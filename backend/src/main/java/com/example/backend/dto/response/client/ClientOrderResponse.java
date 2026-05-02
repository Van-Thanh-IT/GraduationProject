package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class ClientOrderResponse {

    private Integer id;
    private String code;
    private LocalDateTime createdAt;
    private String orderStatus;
    private BigDecimal finalAmount;
    private String paymentMethod;
    private String paymentStatus;
    private String fullShippingAddress;
    private List<Map<String, Object>> items;


}