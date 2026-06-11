package com.example.backend.repository.projection;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public interface UserOrderProjection {
    Integer getId();

    String getCode();

    LocalDateTime getCreatedAt();

    String getOrderStatus();

    BigDecimal getFinalAmount();

    String getPaymentMethod();

    String getPaymentStatus();

    String getFullShippingAddress();

    String getItemsJson();
}
