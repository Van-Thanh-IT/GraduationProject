package com.example.backend.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL) // Ẩn các trường null
public class CartItemResponse {
    private Integer itemId;
    private Integer variantId;
    private String productName;
    private String options;
    private String imageUrl;

    private BigDecimal price; // Giá thực tế áp dụng (Sale hoặc Gốc)
    private BigDecimal originalPrice; // Giá niêm yết

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

        // BỔ SUNG THỜI GIAN KẾT THÚC Ở ĐÂY
        private String endTime;
    }
}