package com.example.backend.dto.response.client;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class FlashSaleInfo {
    private Integer flashSaleId;
    private BigDecimal flashSalePrice;
    private Integer discountPercentage;
    private String endTime;
    private Integer saleStockQuantity;
    private Integer soldQuantity;
    private Boolean isActiveNow;
}