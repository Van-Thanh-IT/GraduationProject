package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
public class ProductDetailResponse {
    // 1. Thông tin chung
    private Integer id;
    private String name;
    private String slug;
    private String warrantyPeriod;
    private String description;
    private String thumbnail;

    // 2. Phân loại
    private String brandName;
    private String categoryName;
    private String categorySlug;

    // 3. Đánh giá (Rating)
    private Double averageRating;
    private Integer totalReviews;

    // 4. Định nghĩa Tùy chọn (Ví dụ: option1="Màu sắc", option2="Dung lượng")
    private String option1Name;
    private String option2Name;
    private String option3Name;

    // 5. Danh sách Biến thể (SKU) & Thư viện ảnh
    private List<VariantDto> variants;

    // 6. Thông số kỹ thuật (Specs)
    private List<SpecDto> specifications;

    @Data @Builder
    public static class VariantDto {
        private Integer id;
        private String sku;
        private String option1Value; // Ví dụ: "Titan Xanh"
        private String option2Value; // Ví dụ: "256GB"
        private String option3Value;
        private BigDecimal price;
        private BigDecimal originalPrice;
        private Integer stockQuantity;
        private Boolean isDefault;
        private List<ImageDto> images;
        private FlashSaleInfo flashSale;
    }

    @Data @Builder
    public static class ImageDto {
        private Integer id;
        private String imageUrl;
        private Boolean isThumbnail;
    }

    @Data @Builder
    public static class SpecDto {
        private String name;  // Ví dụ: "Chipset"
        private String value; // Ví dụ: "Apple A17 Pro"
    }
}