package com.example.backend.dto.response;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class WarrantyResponse {
    private String orderCode;
    private String customerName;
    private String phone;
    private String productName;
    private String thumbnail;
    private String imei;
    private String warrantyText;
    private LocalDateTime purchaseDate;
    private LocalDateTime expireDate;
    private String status;
}
