package com.example.backend.controller.client;

import java.io.IOException;
import java.util.Map;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.OrderRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.client.OrderCheckoutResponse;
import com.example.backend.entity.Order;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.OrderRepository;
import com.example.backend.service.OrderService;
import com.example.backend.service.VnpayService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/public/orders")
public class CheckoutController {

    private final OrderService orderService;
    private final OrderRepository orderRepository;
    private final VnpayService vnpayService;

    @PostMapping("/checkout")
    public APIResponse<OrderCheckoutResponse> checkout(
            @RequestHeader(value = "X-Session-Id", required = false) String sessionId,
            @Valid @RequestBody OrderRequest request,
            HttpServletRequest req) {

        OrderCheckoutResponse orderRes = orderService.checkout(sessionId, request);

        if (request.getPaymentMethod() == PaymentMethod.VNPAY) {
            Order order = orderRepository
                    .findByCode(orderRes.getCode())
                    .orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
            String paymenUrl = vnpayService.createPayment(order, req);
            orderRes.setPaymentMethod(PaymentMethod.VNPAY);
            orderRes.setPaymentUrl(paymenUrl);
        }
        return APIResponse.success(orderRes);
    }

    @GetMapping("/vnpay-callback")
    public void handleVnpayCallback(@RequestParam Map<String, String> params, HttpServletResponse response)
            throws IOException {
        vnpayService.processCallback(params);
        String responseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");
        if ("00".equals(responseCode)) {
            response.sendRedirect("https://techstores-two.vercel.app/payment/success?orderCode=" + orderCode);
        } else {
            response.sendRedirect(
                    "https://techstores-two.vercel.app/payment/failed?orderCode=" + orderCode + "&error=" + responseCode);
        }
    }
}
