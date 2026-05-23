package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FlashSaleResponse {
    private Integer id;

    private Integer productId;

    private Integer variantId;

    private String productName;

    private String variantOptions;

    private String thumbnail;

    private BigDecimal originalPrice;

    private BigDecimal flashSalePrice;

    private Integer discountPercentage;

    private LocalDateTime startTime;

    private LocalDateTime endTime;

    private Integer saleStockQuantity;

    private Integer soldQuantity;

    private Integer maxQuantityPerUser;

    private Integer status;

    private Boolean isActiveNow;

    private Boolean isSoldOut;
}
