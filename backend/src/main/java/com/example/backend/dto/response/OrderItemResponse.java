package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class OrderItemResponse {
    private Integer id;
    private Integer variantId;
    private String productName;
    private String sku;
    private String thumbnail;
    private String variantInfo; // Ví dụ: "Titan Tự Nhiên - 256GB"
    private Integer quantity;
    private BigDecimal price;
    private BigDecimal totalPrice;
    private Boolean isSerialRequired;
}