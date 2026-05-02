package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class WarrantyResponse {
    private String orderCode;
    private String customerName;
    private String phone;
    private String productName;
    private String thumbnail;
    private String imei;
    private String warrantyText; // Hiển thị nguyên gốc text của DB
    private LocalDateTime purchaseDate;
    private LocalDateTime expireDate; // Ngày hết hạn (Java tự tính)
    private String status;       // "HỢP LỆ" hoặc "ĐÃ HẾT HẠN"
}