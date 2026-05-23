package com.example.backend.dto.response.client;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ProductDetailResponse {

    private Integer id;
    private String name;
    private String warrantyPeriod;
    private String description;
    private String thumbnail;

    private String brandName;
    private String categoryName;

    private Double averageRating;
    private Integer totalReviews;

    private String option1Name;
    private String option2Name;
    private String option3Name;

    private List<VariantDto> variants;

    private List<SpecDto> specifications;

    @Data
    @Builder
    public static class VariantDto {
        private Integer id;
        private String sku;
        private String option1Value;
        private String option2Value;
        private String option3Value;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Integer stockQuantity;
        private Boolean isDefault;
        private List<ImageDto> images;
        private FlashSaleInfo flashSale;
    }

    @Data
    @Builder
    public static class ImageDto {
        private Integer id;
        private String imageUrl;
        private Boolean isThumbnail;
    }

    @Data
    @Builder
    public static class SpecDto {
        private String name;
        private String value;
    }
}
