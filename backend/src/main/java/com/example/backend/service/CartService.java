package com.example.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.example.backend.entity.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.backend.dto.request.CartRequest;
import com.example.backend.dto.response.client.CartItemResponse;
import com.example.backend.dto.response.client.CartResponse;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CartMapper;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final CartMapper cartMapper;
    private final FlashSaleService flashSaleService;

    @Transactional
    public CartResponse addToCart(Integer userId, String sessionId, CartRequest request) {
        Cart cart = getOrCreateCart(userId, sessionId);

        ProductVariant variant = variantRepository
                .findById(request.getProductVariantId())
                .orElseThrow(() -> new CustomException(ErrorCode.VARIANT_NOT_FOUND));

        CartItem existingItem = cart.getItems().stream()
                .filter(i -> i.getProductVariant().getId().equals(variant.getId()))
                .findFirst()
                .orElse(null);

        FlashSale activeSale = flashSaleService
                .getActiveFlashSalesForVariants(List.of(variant.getId()))
                .get(variant.getId());

        // Tính toán tổng số lượng khách muốn mua (có giới hạn max 20 sản phẩm mỗi loại trong giỏ)
        int currentQuantityInCart = (existingItem != null) ? existingItem.getQuantity() : 0;
        int totalRequestedQuantity = currentQuantityInCart + request.getQuantity();
        totalRequestedQuantity = Math.min(totalRequestedQuantity, 20);

        int finalQuantity;

        if (activeSale != null) {
            int remainingSale = activeSale.getSaleStockQuantity() - activeSale.getSoldQuantity();
            if (remainingSale <= 0 || variant.getStockQuantity() <= 0) {
                throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK);
            }

            // Chốt số lượng dựa trên tồn kho thực tế và tồn kho của Flash Sale
            finalQuantity = Math.min(totalRequestedQuantity, Math.min(variant.getStockQuantity(), remainingSale));
        } else {
            finalQuantity = Math.min(totalRequestedQuantity, variant.getStockQuantity());
        }

        if (finalQuantity <= 0) {
            throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        if (existingItem != null) {
            existingItem.setQuantity(finalQuantity);
        } else {
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(finalQuantity)
                    .build();
            cart.getItems().add(newItem);
            cartItemRepository.save(newItem);
        }

        return mapAndEnrichCart(cart);
    }

    @Transactional(readOnly = true)
    public CartResponse getCart(Integer userId, String sessionId) {
        Cart cart = getCartSafe(userId, sessionId);
        return mapAndEnrichCart(cart);
    }

    @Transactional
    public void mergeCartOnLogin(Integer userId, String sessionId) {
        if (!StringUtils.hasText(sessionId)) return;

        Cart guestCart = cartRepository.findBySessionId(sessionId).orElse(null);
        if (guestCart == null || guestCart.getItems().isEmpty()) return;

        Cart userCart = cartRepository.findByUserId(userId).orElse(null);

        if (userCart == null) {
            guestCart.setUserId(userId);
            guestCart.setSessionId(null);
        } else {
            Map<Integer, CartItem> userItemsMap = userCart.getItems().stream()
                    .collect(Collectors.toMap(item -> item.getProductVariant().getId(), item -> item));

            for (CartItem guestItem : guestCart.getItems()) {
                CartItem userItem = userItemsMap.get(guestItem.getProductVariant().getId());

                if (userItem != null) {
                    userItem.setQuantity(userItem.getQuantity() + guestItem.getQuantity());
                } else {
                    guestItem.setCart(userCart);
                    userCart.getItems().add(guestItem);
                    cartItemRepository.save(guestItem);
                }
            }

            guestCart.getItems().clear();
            cartRepository.delete(guestCart);
        }
    }

    @Transactional
    public void removeCartItemById(Integer userId, String sessionId, Integer cartItemId) {
        Cart cart = getCartSafe(userId, sessionId);
        if (cart == null) throw new CustomException(ErrorCode.CART_NOT_FOUND);

        CartItem item = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new CustomException(ErrorCode.CART_UNAUTHORIZED);
        }

        cartItemRepository.delete(item);
        cart.getItems().remove(item);

        mapAndEnrichCart(cart);
    }

    @Transactional(rollbackFor = Exception.class)
    public void removeCartItemsBatch(Integer userId, String sessionId, List<Integer> cartItemIds) {
        if (cartItemIds == null || cartItemIds.isEmpty()) return;

        Cart cart = getCartSafe(userId, sessionId);
        if (cart == null) throw new CustomException(ErrorCode.CART_NOT_FOUND);

        int deletedCount = cartItemRepository.deleteAllByIdInAndCartId(cartItemIds, cart.getId());

        if (deletedCount == 0) {
            log.warn("Không có sản phẩm nào bị xóa trong giỏ ID {}. Item IDs: {}", cart.getId(), cartItemIds);
            return;
        }

        cart.getItems().removeIf(item -> cartItemIds.contains(item.getId()));
    }

    @Transactional
    public CartResponse updateCartItemQuantity(Integer userId, String sessionId, Integer cartItemId, Integer newQuantity) {
        Cart cart = getCartSafe(userId, sessionId);
        if (cart == null) throw new CustomException(ErrorCode.CART_NOT_FOUND);

        CartItem item = cartItemRepository
                .findById(cartItemId)
                .orElseThrow(() -> new CustomException(ErrorCode.CART_ITEM_NOT_FOUND));

        if (!item.getCart().getId().equals(cart.getId())) {
            throw new CustomException(ErrorCode.CART_UNAUTHORIZED);
        }

        if (newQuantity <= 0) {
            cartItemRepository.delete(item);
            cart.getItems().remove(item);
            return mapAndEnrichCart(cart);
        }

        newQuantity = Math.min(newQuantity, 20000);

        validateStockAndFlashSale(item.getProductVariant(), newQuantity);

        item.setQuantity(newQuantity);

        return mapAndEnrichCart(cart);
    }

    private Cart getOrCreateCart(Integer userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        }
        if (StringUtils.hasText(sessionId)) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionId).build()));
        }
        throw new CustomException(ErrorCode.CART_SESSION_REQUIRED);
    }

    private Cart getCartSafe(Integer userId, String sessionId) {
        if (userId != null) return cartRepository.findByUserId(userId).orElse(null);
        if (StringUtils.hasText(sessionId)) return cartRepository.findBySessionId(sessionId).orElse(null);
        return null;
    }

    private void validateStockAndFlashSale(ProductVariant variant, int totalRequestedQuantity) {
        if (variant.getStockQuantity() < totalRequestedQuantity) {
            throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK);
        }

        FlashSale sale = flashSaleService
                .getActiveFlashSalesForVariants(List.of(variant.getId()))
                .get(variant.getId());

        if (sale != null) {
            int remainingSale = sale.getSaleStockQuantity() - sale.getSoldQuantity();
            if (totalRequestedQuantity > remainingSale) {
                throw new CustomException(ErrorCode.FLASH_SALE_LIMIT_EXCEEDED);
            }
        }
    }

    private CartResponse mapAndEnrichCart(Cart cart) {
        if (cart == null || cart.getItems().isEmpty()) {
            return CartResponse.builder()
                    .items(new ArrayList<>())
                    .totalPrice(BigDecimal.ZERO)
                    .build();
        }

        CartResponse response = cartMapper.toResponse(cart);


        List<Integer> variantIds = response.getItems().stream().map(CartItemResponse::getVariantId).toList();
        Map<Integer, FlashSale> activeSalesMap = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        BigDecimal grandTotal = BigDecimal.ZERO;

        for (CartItemResponse item : response.getItems()) {
            FlashSale sale = activeSalesMap.get(item.getVariantId());

            if (sale != null) {
                item.setPrice(sale.getFlashSalePrice());
                item.setFlashSale(CartItemResponse.FlashSaleInfo.builder()
                        .flashSaleId(sale.getId())
                        .flashSalePrice(sale.getFlashSalePrice())
                        .saleStockRemaining(sale.getSaleStockQuantity() - sale.getSoldQuantity())
                        .endTime(sale.getEndTime().toString())
                        .build());
            }

            BigDecimal subTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
            item.setSubTotal(subTotal);
            grandTotal = grandTotal.add(subTotal);
        }

        response.setTotalPrice(grandTotal);
        return response;
    }
}