package com.example.backend.dto.request;
import lombok.Data;

@Data
public class GoshipWebhookRequest {
    private String orderCode;
    private String trackingNumber;
    private int goshipStatusCode;
    private String note;
}