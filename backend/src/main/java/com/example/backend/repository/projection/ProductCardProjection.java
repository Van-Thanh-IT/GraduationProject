package com.example.backend.repository.projection;

import java.math.BigDecimal;

public interface ProductCardProjection {
    Integer getId();

    String getName();

    String getSlug();

    String getThumbnail();

    Integer getDefaultVariantId();

    BigDecimal getPrice();

    BigDecimal getOriginalPrice();

    Integer getStockQuantity();

    Integer getSoldCount();

    Double getRating();

    Integer getReviewCount();

    Integer getIsNew();

    String getSpecsStr();
}
