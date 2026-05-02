package com.example.backend.service;

import com.example.backend.dto.request.CartRequest;
import com.example.backend.dto.response.CartItemResponse;
import com.example.backend.dto.response.CartResponse;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.FlashSale;
import com.example.backend.entity.ProductVariant;
import com.example.backend.mapper.CartMapper;
import com.example.backend.repository.CartItemRepository;
import com.example.backend.repository.CartRepository;
import com.example.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CartService {

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductVariantRepository variantRepository;
    private final CartMapper cartMapper;

    private final FlashSaleService flashSaleService;

    // THÊM VÀO GIỎ HÀNG
    @Transactional
    public CartResponse addToCart(Integer userId, String sessionId, CartRequest request) {
        Cart cart = getOrCreateCart(userId, sessionId);

        ProductVariant variant = variantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("Biến thể không tồn tại!"));

        // --- LOGIC KIỂM TRA FLASH SALE ---
        FlashSale sale = flashSaleService.getActiveFlashSalesForVariants(List.of(variant.getId())).get(variant.getId());
        if (sale != null) {
            int maxAllowed = sale.getMaxQuantityPerUser();

            // Kiểm tra xem trong yêu cầu mới khách có định mua quá không
            if (request.getQuantity() > maxAllowed) {
                throw new RuntimeException("Sản phẩm đang Flash Sale, bạn chỉ được mua tối đa " + maxAllowed + " sản phẩm!");
            }

            // Kiểm tra xem TRONG GIỎ ĐÃ CÓ CHƯA (Tránh việc nhấn thêm nhiều lần)
            Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId());
            if (existingItem.isPresent()) {
                int totalQuantityAfterAdd = existingItem.get().getQuantity() + request.getQuantity();
                if (totalQuantityAfterAdd > maxAllowed) {
                    throw new RuntimeException("Bạn đã có sản phẩm này trong giỏ. Flash Sale giới hạn tối đa " + maxAllowed + " sản phẩm/người!");
                }
            }
        }

        // Đang phát triển kho
        if (variant.getStockQuantity() < request.getQuantity()) {
            throw new RuntimeException("Sản phẩm không đủ số lượng tồn kho!");
        }

        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductVariantId(cart.getId(), variant.getId());

        if (existingItem.isPresent()) {
            // Đã có trong giỏ -> Cộng dồn
            CartItem item = existingItem.get();
            item.setQuantity(item.getQuantity() + request.getQuantity());
            cartItemRepository.save(item);
        } else {
            // Chưa có -> Tạo mới
            CartItem newItem = CartItem.builder()
                    .cart(cart)
                    .productVariant(variant)
                    .quantity(request.getQuantity())
                    .build();
            cart.getItems().add(newItem); // Cập nhật List trong Cart
            cartItemRepository.save(newItem);
        }

        // Lấy lại cart mới nhất từ DB
        return mapAndEnrichCart(cartRepository.findById(cart.getId()).get());
    }

    // LẤY GIỎ HÀNG ĐỂ HIỂN THỊ
    public CartResponse getCart(Integer userId, String sessionId) {
        Cart cart = null;
        if (userId != null) {
            cart = cartRepository.findByUserId(userId).orElse(null);
        } else if (sessionId != null) {
            cart = cartRepository.findBySessionId(sessionId).orElse(null);
        }
        return mapAndEnrichCart(cart);
    }

    // ==========================================
    // LOGIC MERGE GIỎ HÀNG (GỌI KHI ĐĂNG NHẬP THÀNH CÔNG)
    // ==========================================
    @Transactional(rollbackFor = Exception.class)
    public void mergeCartOnLogin(Integer userId, String sessionId) {
        if (sessionId == null || sessionId.isEmpty()) return;

        Cart guestCart = cartRepository.findBySessionId(sessionId).orElse(null);
        if (guestCart == null || guestCart.getItems().isEmpty()) return; // Khách không có giỏ hàng, ko cần gộp

        Cart userCart = cartRepository.findByUserId(userId).orElse(null);

        if (userCart == null) {
            // Kịch bản 1: User chưa có giỏ hàng -> Lấy giỏ của Guest đổi tên thành của User
            guestCart.setUserId(userId);
            guestCart.setSessionId(null);
            cartRepository.save(guestCart);
        } else {
            // Kịch bản 2: User đã có giỏ hàng cũ -> Gộp items từ Guest sang User
            for (CartItem guestItem : guestCart.getItems()) {
                Optional<CartItem> existingUserItem = cartItemRepository
                        .findByCartIdAndProductVariantId(userCart.getId(), guestItem.getProductVariant().getId());

                if (existingUserItem.isPresent()) {
                    // Trùng sản phẩm -> Cộng dồn số lượng
                    CartItem userItem = existingUserItem.get();
                    userItem.setQuantity(userItem.getQuantity() + guestItem.getQuantity());
                    cartItemRepository.save(userItem);
                } else {
                    // Không trùng -> Chuyển sản phẩm sang giỏ của User
                    guestItem.setCart(userCart);
                    cartItemRepository.save(guestItem);
                }
            }
            // Xóa giỏ hàng ảo của Guest sau khi gộp xong
            guestCart.getItems().clear(); // Tránh lỗi foreign key
            cartRepository.delete(guestCart);
        }
    }

    // LẤY HOẶC TẠO GIỎ HÀNG (Dùng chung cho Guest & User)
    private Cart getOrCreateCart(Integer userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId)
                    .orElseGet(() -> cartRepository.save(Cart.builder().userId(userId).build()));
        }
        if (sessionId != null) {
            return cartRepository.findBySessionId(sessionId)
                    .orElseGet(() -> cartRepository.save(Cart.builder().sessionId(sessionId).build()));
        }
        throw new RuntimeException("Phải cung cấp session_id hoặc đăng nhập!");
    }

    // ==========================================
    // XÓA SẢN PHẨM KHỎI GIỎ HÀNG
    // ==========================================

    /**
     * 1. XÓA THEO CART_ITEM_ID (Chuẩn và bảo mật nhất)
     */
    @Transactional
    public CartResponse removeCartItemById(Integer userId, String sessionId, Integer cartItemId) {
        Cart cart = getCartSafe(userId, sessionId);
        if (cart == null) throw new RuntimeException("Không tìm thấy giỏ hàng!");

        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng!"));

        // Bảo mật (Security check): Chống user khác truyền bừa ID để xóa trộm đồ của người khác
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên sản phẩm này!");
        }

        // Xóa khỏi DB và xóa khỏi List trong Entity để Mapper trả về data mới nhất ngay lập tức
        cartItemRepository.delete(item);
        cart.getItems().remove(item);

        return mapAndEnrichCart(cart);
    }

    // ==========================================
    // CẬP NHẬT SỐ LƯỢNG TRONG GIỎ HÀNG
    // ==========================================
    @Transactional
    public CartResponse updateCartItemQuantity(Integer userId, String sessionId, Integer cartItemId, Integer newQuantity) {
        // 1. Lấy giỏ hàng an toàn (Không tạo mới)
        Cart cart = getCartSafe(userId, sessionId);
        if (cart == null) throw new RuntimeException("Không tìm thấy giỏ hàng!");



        // 2. Tìm món hàng cần sửa
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Sản phẩm không tồn tại trong giỏ hàng!"));


        // 3. Bảo mật: Đảm bảo item này nằm đúng trong giỏ của người dùng hiện tại
        if (!item.getCart().getId().equals(cart.getId())) {
            throw new RuntimeException("Bạn không có quyền thao tác trên sản phẩm này!");
        }

        // 4. Nếu số lượng bằng 0 -> XÓA LUÔN KHỎI GIỎ HÀNG
        if (newQuantity == 0) {
            cartItemRepository.delete(item);
            cart.getItems().remove(item);
            return mapAndEnrichCart(cart);
        }

        // 5. Kiểm tra tồn kho thường
        if (item.getProductVariant().getStockQuantity() < newQuantity) {
            throw new RuntimeException("Xin lỗi, sản phẩm chỉ còn " + item.getProductVariant().getStockQuantity() + " sản phẩm trong kho!");
        }

        // 5.5. KIỂM TRA TỒN KHO FLASH SALE
        FlashSale sale = flashSaleService.getActiveFlashSalesForVariants(List.of(item.getProductVariant().getId())).get(item.getProductVariant().getId());
        if (sale != null) {
            int remainingSale = sale.getSaleStockQuantity() - sale.getSoldQuantity();
            int maxAllowed = Math.min(sale.getMaxQuantityPerUser(), remainingSale);

            if (newQuantity > maxAllowed) {
                throw new RuntimeException("Giới hạn Flash Sale: Bạn chỉ được mua tối đa " + maxAllowed + " sản phẩm giá ưu đãi!");
            }
        }

        // 6. Cập nhật số lượng mới và lưu lại
        item.setQuantity(newQuantity);
        cartItemRepository.save(item);

        // 7. Cập nhật lại list item trong đối tượng cart để Map trả về data mới nhất
        int index = cart.getItems().indexOf(item);
        if (index != -1) {
            cart.getItems().set(index, item);
        }

        return mapAndEnrichCart(cart);
    }

    // ==========================================
    // HÀM TIỆN ÍCH (HELPER)
    // ==========================================

    // Hàm trả về Cart Entity (SỬA LẠI THÀNH CART NHƯ CŨ ĐỂ KHÔNG LỖI)
    private Cart getCartSafe(Integer userId, String sessionId) {
        if (userId != null) {
            return cartRepository.findByUserId(userId).orElse(null);
        }
        if (sessionId != null) {
            return cartRepository.findBySessionId(sessionId).orElse(null);
        }
        return null;
    }

    // ==========================================
    // HÀM BỔ SUNG GIÁ FLASH SALE VÀO GIỎ HÀNG (TỐI ƯU N+1 QUERY)
    // ==========================================
    private CartResponse mapAndEnrichCart(Cart cart) {
        if (cart == null || cart.getItems().isEmpty()) {
            return CartResponse.builder().items(new ArrayList<>()).totalPrice(BigDecimal.ZERO).build();
        }

        // 1. Lấy response thô từ Mapper (Giá lúc này đang là giá gốc)
        CartResponse response = cartMapper.toResponse(cart);

        // 2. Lấy tất cả Variant IDs có trong giỏ hàng
        List<Integer> variantIds = response.getItems().stream()
                .map(CartItemResponse::getVariantId)
                .collect(Collectors.toList());

        // 3. Gọi DB 1 lần duy nhất lấy Map Flash Sale
        Map<Integer, FlashSale> activeSalesMap = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        // 4. Quét qua giỏ hàng, nếu có Sale thì "Đè" giá mới vào
        BigDecimal grandTotal = BigDecimal.ZERO;

        for (CartItemResponse item : response.getItems()) {
            FlashSale sale = activeSalesMap.get(item.getVariantId());

            if (sale != null) {
                // Đè giá Flash Sale vào
                item.setPrice(sale.getFlashSalePrice());
                item.setFlashSale(CartItemResponse.FlashSaleInfo.builder()
                        .flashSaleId(sale.getId())
                        .flashSalePrice(sale.getFlashSalePrice())
                        .maxQuantityPerUser(sale.getMaxQuantityPerUser())
                        .saleStockRemaining(sale.getSaleStockQuantity() - sale.getSoldQuantity())
                        .endTime(sale.getEndTime().toString())
                        .build());
            }

            // Tính lại Thành tiền (SubTotal) và Tổng đơn (GrandTotal)
            BigDecimal subTotal = item.getPrice().multiply(new BigDecimal(item.getQuantity()));
            item.setSubTotal(subTotal);
            grandTotal = grandTotal.add(subTotal);
        }

        // Cập nhật lại tổng tiền cuối cùng
        response.setTotalPrice(grandTotal);

        return response;
    }
}