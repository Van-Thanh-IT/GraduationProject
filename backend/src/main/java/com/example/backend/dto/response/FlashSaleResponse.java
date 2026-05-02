package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class FlashSaleResponse {
    private Integer id;

    // THÊM PRODUCT ID ĐỂ FRONTEND LÀM LINK CHUYỂN TRANG
    private Integer productId;

    private Integer variantId;
    private String productName;
    private String variantOptions; // VD: Đỏ - 256GB
    private String thumbnail;

    private BigDecimal originalPrice;
    private BigDecimal flashSalePrice;

    // THÊM PHẦN TRĂM GIẢM GIÁ (VD: 15, 20, 50...) hiển thị tem "-20%"
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