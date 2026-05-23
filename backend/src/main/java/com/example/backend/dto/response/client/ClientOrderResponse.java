package com.example.backend.dto.response.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

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
    private List<OrderItem> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    @JsonIgnoreProperties(ignoreUnknown = true)
    public static class OrderItem {
        private String productName;
        private String thumbnail;
        private String variantInfo;
        private Integer quantity;
        private BigDecimal price;
        private Boolean isReviewed;
    }
}
