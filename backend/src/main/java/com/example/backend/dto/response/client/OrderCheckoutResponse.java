package com.example.backend.dto.response.client;

import java.math.BigDecimal;

import com.example.backend.enums.PaymentMethod;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderCheckoutResponse {
    private Integer id;
    private String code;
    private BigDecimal finalAmount;
    private PaymentMethod paymentMethod;
    private String paymentUrl;
}
