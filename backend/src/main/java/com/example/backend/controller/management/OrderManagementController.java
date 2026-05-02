package com.example.backend.controller.management;

import com.example.backend.dto.request.GoshipWebhookRequest;
import com.example.backend.dto.request.PackOrderRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.service.OrderService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/management/orders")
@RequiredArgsConstructor
public class OrderManagementController {

    private final OrderService orderService;

    @GetMapping
    public APIResponse<List<OrderResponse>> getAllOrders() {
        return APIResponse.success(orderService.getAllOrders());
    }

    @PostMapping("/{code}/cancel")
    public APIResponse<Void> cancelOrder(
            @PathVariable String code,
            @RequestParam String reason) {
        orderService.cancelOrderByAdmin(code, reason);
        return APIResponse.success(null);
    }

    @PutMapping("/{id}/confirm")
    public APIResponse<OrderResponse> confirmOrder(@PathVariable Integer id) {
        return APIResponse.success(orderService.confirmOrder(id));
    }


    @PutMapping("/{id}/pack")
    public APIResponse<OrderResponse> packOrder(
            @PathVariable Integer id,
            @RequestBody PackOrderRequest request
    ) {
        return APIResponse.success(orderService.packAndReadyToShip(id, request));
    }

    @PostMapping("/goship/webhooks")
    public ResponseEntity<String> receiveGoshipWebhook(@RequestBody GoshipWebhookRequest request) {

            // 2. Gọi hàm xử lý logic của bạn
            orderService.handleGoshipWebhook(request);
            return ResponseEntity.ok("Success");


    }


}