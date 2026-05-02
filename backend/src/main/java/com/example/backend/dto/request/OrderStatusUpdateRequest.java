package com.example.backend.dto.request;

import com.example.backend.enums.OrderStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class OrderStatusUpdateRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private OrderStatus orderStatus;

    private String cancelReason; // Dùng khi trạng thái là CANCELLED
    private String trackingNumber; // Dùng khi trạng thái là SHIPPING
    private String shippingCarrier; // Hãng vận chuyển (GHN, GHTK...)
}