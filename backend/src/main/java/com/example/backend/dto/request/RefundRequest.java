package com.example.backend.dto.request;

import lombok.*;

@Data
public class RefundRequest {
    private String orderCode;
    private long amount;
    private String transactionNo;
    private String transactionDate; // yyyyMMddHHmmss
    private String createdBy;
}