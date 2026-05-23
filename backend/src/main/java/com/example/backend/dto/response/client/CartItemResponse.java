package com.example.backend.dto.response.client;

import java.math.BigDecimal;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class CartItemResponse {

    private Integer itemId;

    private Integer variantId;

    private String productName;

    private String options;

    private String imageUrl;

    private BigDecimal price;

    private BigDecimal originalPrice;

    private Integer quantity;

    private BigDecimal subTotal;

    private Integer maxStock;

    private FlashSaleInfo flashSale;

    @Data
    @Builder
    @JsonInclude(JsonInclude.Include.NON_NULL)
    public static class FlashSaleInfo {

        private Integer flashSaleId;

        private BigDecimal flashSalePrice;

        private Integer maxQuantityPerUser;

        private Integer saleStockRemaining;

        private String endTime;
    }
}
