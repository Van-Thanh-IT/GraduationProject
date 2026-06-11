package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.util.List;

import lombok.Data;

@Data
public class ProductVariantResponse {
    private Integer id;
    private Integer productId;
    private String sku;
    private String option1Value;
    private String option2Value;
    private String option3Value;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer stockQuantity;
    private BigDecimal weight;
    private Boolean isDefault;
    private Boolean isSerialRequired;

    private List<ProductVariantImageResponse> images;
}
