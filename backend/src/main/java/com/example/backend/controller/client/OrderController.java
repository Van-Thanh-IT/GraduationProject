package com.example.backend.controller.client;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.client.ClientOrderDetailResponse;
import com.example.backend.dto.response.client.OrderPageResponse;
import com.example.backend.service.OrderService;
import com.example.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/user/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    private Integer getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }

    @GetMapping
    public APIResponse<OrderPageResponse> getMyOrders(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String keyword,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        Integer userId = SecurityUtils.getCurrentUserId();
        String filterStatus = (status != null && status.equalsIgnoreCase("ALL")) ? null : status;

        // Hứng kết quả bằng kiểu mới
        OrderPageResponse result = orderService.getMyOrders(userId, filterStatus, keyword, page, size);

        return APIResponse.<OrderPageResponse>builder()
                .code(200)
                .data(result)
                .messages("Lấy danh sách đơn hàng thành công")
                .build();
    }

    @GetMapping("/{orderId}")
    public APIResponse<ClientOrderDetailResponse> getOrderDetail(@PathVariable Integer orderId) {

        // Lấy ID của user đang đăng nhập từ Token
        Integer userId = SecurityUtils.getCurrentUserId();

        ClientOrderDetailResponse response = orderService.getOrderDetailForClient(userId, orderId);

        return APIResponse.<ClientOrderDetailResponse>builder()
                .code(200)
                .data(response)
                .messages("Lấy chi tiết đơn hàng thành công")
                .build();
    }

    @PostMapping("/{code}/cancel")
    public APIResponse<Void> cancelOrder(
            @PathVariable String code,
            @RequestParam String reason) {
        orderService.cancelOrderByUser(getCurrentUserId(), code, reason);
        return APIResponse.success(null);
    }



}