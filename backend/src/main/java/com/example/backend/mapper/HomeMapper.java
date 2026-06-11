package com.example.backend.mapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.response.client.*;
import com.example.backend.entity.Brand;
import com.example.backend.entity.FlashSale;
import com.example.backend.repository.projection.ProductCardProjection;

@Mapper(componentModel = "spring")
public interface HomeMapper {

    ClientBrandResponse toBrandDto(Brand brand);

    @Mapping(target = "soldCount", expression = "java(p.getSoldCount() != null ? p.getSoldCount() : 0)")
    @Mapping(target = "reviewCount", expression = "java(p.getReviewCount() != null ? p.getReviewCount() : 0)")
    @Mapping(
            target = "rating",
            expression = "java(p.getRating() != null ? Math.round(p.getRating() * 10.0) / 10.0 : 0.0)")
    @Mapping(target = "isNew", expression = "java(p.getIsNew() != null && p.getIsNew() == 1)")
    @Mapping(target = "specs", expression = "java(parseSpecs(p.getSpecsStr()))")
    @Mapping(target = "flashSale", ignore = true)
    ProductCardResponse toProductCard(ProductCardProjection p);

    @Mapping(target = "flashSaleId", source = "sale.id")
    @Mapping(
            target = "discountPercentage",
            expression = "java(calculateDiscount(originalPrice, sale.getFlashSalePrice()))")
    @Mapping(target = "isActiveNow", constant = "true")
    FlashSaleInfo toFlashSaleInfo(FlashSale sale, BigDecimal originalPrice);

    default List<String> parseSpecs(String specsStr) {
        return (specsStr != null && !specsStr.trim().isEmpty()) ? Arrays.asList(specsStr.split(",\\s*")) : null;
    }

    default Integer calculateDiscount(BigDecimal originalPrice, BigDecimal sale) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) == 0) return 0;
        return 100
                - sale.multiply(new BigDecimal("100"))
                        .divide(originalPrice, RoundingMode.HALF_UP)
                        .intValue();
    }
}
