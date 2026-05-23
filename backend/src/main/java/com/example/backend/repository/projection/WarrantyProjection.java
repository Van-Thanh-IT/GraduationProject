package com.example.backend.repository.projection;

import java.time.LocalDateTime;

public interface WarrantyProjection {
    String getOrderCode();

    String getCustomerName();

    String getPhone();

    String getProductName();

    String getThumbnail();

    String getImei();

    String getWarrantyPeriodText();

    LocalDateTime getPurchaseDate();
}
