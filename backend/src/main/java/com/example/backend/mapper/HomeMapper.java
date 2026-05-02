package com.example.backend.mapper;

import com.example.backend.dto.response.client.*;
import com.example.backend.entity.Brand;
import com.example.backend.entity.FlashSale;
import com.example.backend.repository.projection.ProductCardProjection;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.Arrays;
import java.util.List;

@Mapper(componentModel = "spring")
public interface HomeMapper {

    // 1. MAP BRAND ĐƠN GIẢN
    BrandClientResponse toBrandDto(Brand brand);

    // 2. MAP PRODUCT TÙY CHỈNH (Kết hợp Custom Logic)
    @Mapping(target = "soldCount",expression = "java(p.getSoldCount() != null ? p.getSoldCount() : 0)")
    @Mapping(target = "reviewCount",expression = "java(p.getReviewCount() != null ? p.getReviewCount() : 0)")
    @Mapping(target = "rating", expression = "java(p.getRating() != null ? Math.round(p.getRating() * 10.0) / 10.0 : 0.0)")
    @Mapping(target = "isNew", expression = "java(p.getIsNew() != null && p.getIsNew() == 1)")
    @Mapping(target = "specs", expression = "java(parseSpecs(p.getSpecsStr()))")
    @Mapping(target = "flashSale", ignore = true) // FlashSale sẽ được gán sau từ Map
    ProductCardResponse toProductCard(ProductCardProjection p);

    // 3. MAP FLASH SALE
    @Mapping(target = "flashSaleId", source = "sale.id")
    @Mapping(target = "discountPercentage", expression = "java(calculateDiscount(originalPrice, sale.getFlashSalePrice()))")
    @Mapping(target = "isActiveNow", constant = "true")
    FlashSaleInfo toFlashSaleInfo(FlashSale sale, BigDecimal originalPrice);

    // ====================================================
    // CÁC HÀM DEFAULT ĐỂ MAPSTRUCT TỰ GỌI
    // ====================================================

    default List<String> parseSpecs(String specsStr) {
        return (specsStr != null && !specsStr.trim().isEmpty())
                ? Arrays.asList(specsStr.split(",\\s*"))
                : null;
    }

    default Integer calculateDiscount(BigDecimal original, BigDecimal sale) {
        if (original == null || original.compareTo(BigDecimal.ZERO) == 0) return 0;
        return 100 - sale.multiply(new BigDecimal("100")).divide(original, RoundingMode.HALF_UP).intValue();
    }
}