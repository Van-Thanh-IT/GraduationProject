package com.example.backend.controller.client;

import com.example.backend.dto.request.OrderRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.repository.OrderRepository;
import com.example.backend.service.OrderService;
import com.example.backend.service.VnpayService;
import com.example.backend.utils.SecurityUtils;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/orders")
public class CheckoutController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final VnpayService vnpayService;

    @PostMapping("/checkout")
    public APIResponse<OrderResponse> checkout(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody OrderRequest request, HttpServletRequest req) {

        // Lấy userId một cách an toàn (Guest thì trả về null)
        Integer userId = getUserIdSafely();

        OrderResponse orderRes = orderService.checkout(userId, sessionId, request);

        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            Order order = orderRepository.findByCode(orderRes.getCode())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy đơn hàng vừa tạo"));
            String vnpayUrl = vnpayService.createPaymentUrl(order, req);
            orderRes.setVnpayUrl(vnpayUrl);
        }
        return APIResponse.success(orderRes);
    }

    // API VNPAY CALLBACK (Bắt buộc phải public để VNPay còn gọi về được)
    @GetMapping("/vnpay-callback")
    public void handleVnpayCallback(@RequestParam Map<String, String> params, HttpServletResponse response) throws IOException {
        vnpayService.processCallback(params);
        String responseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");
        if ("00".equals(responseCode)) {
            response.sendRedirect("http://localhost:5173/payment/success?orderCode=" + orderCode);
        } else {
            response.sendRedirect("http://localhost:3000/payment/failed?orderCode=" + orderCode + "&error=" + responseCode);
        }
    }

    // Hàm phụ trợ để không bị văng lỗi khi Guest đặt hàng
    private Integer getUserIdSafely() {
        try {
            return SecurityUtils.getCurrentUserId();
        } catch (Exception e) {
            return null;
        }
    }
}
