package com.example.backend.controller.management;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.GoshipWebhookRequest;
import com.example.backend.dto.request.PackOrderRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.admin.AdminOrderResponse;
import com.example.backend.service.OrderService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/management/orders")
@RequiredArgsConstructor
public class OrderManagementController {

    private final OrderService orderService;

    @GetMapping
    public APIResponse<List<AdminOrderResponse>> getAllOrders() {
        return APIResponse.success(orderService.getAllOrders());
    }

    @PostMapping("/{code}/cancel")
    public APIResponse<Void> cancelOrder(@PathVariable String code, @RequestParam String reason) {
        orderService.cancelOrderByAdmin(code, reason);
        return APIResponse.success(null);
    }

    @PutMapping("/{id}/confirm")
    public APIResponse<AdminOrderResponse> confirmOrder(@PathVariable Integer id) {
        return APIResponse.success(orderService.confirmOrder(id));
    }

    @PutMapping("/{id}/pack")
    public APIResponse<AdminOrderResponse> packOrder(@PathVariable Integer id, @RequestBody PackOrderRequest request) {
        return APIResponse.success(orderService.packAndReadyToShip(id, request));
    }

    @PostMapping("/goship/webhooks")
    public ResponseEntity<String> receiveGoshipWebhook(@RequestBody GoshipWebhookRequest request) {
        orderService.handleGoshipWebhook(request);
        return ResponseEntity.ok("Success");
    }
}
