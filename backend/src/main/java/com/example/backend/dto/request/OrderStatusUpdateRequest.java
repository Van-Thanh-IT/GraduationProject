package com.example.backend.dto.request;

import jakarta.validation.constraints.NotNull;

import com.example.backend.enums.OrderStatus;

import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus orderStatus;

    private String cancelReason;

    private String trackingNumber;

    private String shippingCarrier;
}
