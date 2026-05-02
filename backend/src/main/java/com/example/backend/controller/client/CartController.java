package com.example.backend.controller.client;

import com.example.backend.dto.request.CartRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.CartResponse;
import com.example.backend.service.CartService;
import com.example.backend.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
// Gom chung tiền tố, mọi API bên dưới sẽ tự động cộng thêm /api/cart
@RequestMapping("/api/public/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;


    private Integer getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    @GetMapping
    public APIResponse<CartResponse> getCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId) {

        Integer userId = getCurrentUserId();

        return APIResponse.success(cartService.getCart(userId, sessionId));
    }

    @PostMapping("/items")
    public APIResponse<CartResponse> addToCart(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody CartRequest request) {

        Integer userId = getCurrentUserId();
        return APIResponse.success(cartService.addToCart(userId, sessionId, request));
    }

    @DeleteMapping("/items/{cartItemId}")
    public APIResponse<Void> deleteCartItem(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Integer cartItemId) {

        Integer userId = getCurrentUserId();
        cartService.removeCartItemById(userId, sessionId, cartItemId);
        return APIResponse.success(null);
    }

    @PutMapping("/items/{cartItemId}")
    public APIResponse<CartResponse> updateCartItemQuantity(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @PathVariable Integer cartItemId,
            @RequestBody CartRequest request) {

        Integer userId = getCurrentUserId();

        return APIResponse.success(
                cartService.updateCartItemQuantity(userId, sessionId, cartItemId, request.getQuantity())
        );
    }

    @PostMapping("/merge")
    public APIResponse<Void> mergeCart(
            @RequestHeader(value = "X-Session-Id") String sessionId) {

        Integer userId = getCurrentUserId();

        // Chỉ merge khi user ĐÃ LOGIN và CÓ SESSION ID từ lúc còn là khách vãng lai
        if (userId != null && sessionId != null && !sessionId.isEmpty()) {
            cartService.mergeCartOnLogin(userId, sessionId);
        }
        return APIResponse.success(null);
    }
}