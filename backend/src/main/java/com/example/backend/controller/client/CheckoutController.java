package com.example.backend.controller.client;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import com.example.backend.dto.request.RefundRequest;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
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

    @Value("${spring.app.frontend.url}")
    private String frontendUrl;

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
    public void handleVnpayCallback(
            @RequestParam Map<String, String> params,
            HttpServletResponse response) throws IOException {

        vnpayService.processCallback(params);

        String responseCode = params.get("vnp_ResponseCode");
        String orderCode = params.get("vnp_TxnRef");
        String txnNo = params.get("vnp_TransactionNo");
        String amount = params.get("vnp_Amount");



        String redirectUrl;

        if ("00".equals(responseCode)) {
            redirectUrl = frontendUrl + "/payment/success"
                    + "?orderCode=" + URLEncoder.encode(orderCode, StandardCharsets.UTF_8)
                    + "&txn=" + URLEncoder.encode(txnNo, StandardCharsets.UTF_8)
                    + "&amount=" + URLEncoder.encode(amount, StandardCharsets.UTF_8)
                    + "&status=success";
        } else {
            redirectUrl = frontendUrl + "/payment/failed"
                    + "?orderCode=" + URLEncoder.encode(orderCode, StandardCharsets.UTF_8)
                    + "&error=" + URLEncoder.encode(responseCode, StandardCharsets.UTF_8)
                    + "&status=failed";
        }

        response.sendRedirect(redirectUrl);
    }

}
