package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;

import lombok.Data;

@Data
public class GoshipWebhookRequest {

    @NotBlank(message = "Order code không được để trống")
    private String orderCode;

    private String trackingNumber;

    private Integer goshipStatusCode;

    private String note;
}
