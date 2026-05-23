package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AwaitingReviewResponse {
    private Integer orderItemId;

    private Integer productId;

    private String productName;

    private String thumbnail;

    private String variantSpecs;

    private BigDecimal price;

    private Integer quantity;

    private LocalDateTime orderDate;
}
