package com.example.backend.mapper;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.response.FlashSaleResponse;
import com.example.backend.dto.response.client.FlashSaleInfo;
import com.example.backend.entity.FlashSale;
import com.example.backend.entity.ProductVariant;

@Mapper(
        componentModel = "spring",
        imports = {LocalDateTime.class})
public interface FlashSaleMapper {

    @Mapping(target = "productId", source = "productVariant.product.id")
    @Mapping(target = "variantId", source = "productVariant.id")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "thumbnail", source = "productVariant.product.thumbnail")
    @Mapping(target = "originalPrice", source = "productVariant.price")
    @Mapping(target = "variantOptions", expression = "java(formatOptions(entity.getProductVariant()))")
    @Mapping(target = "isActiveNow", expression = "java(checkIsActive(entity))")
    @Mapping(target = "isSoldOut", expression = "java(checkIsSoldOut(entity))")
    @Mapping(target = "discountPercentage", expression = "java(calculateDiscountPercentage(entity))") // Tính % giảm
    FlashSaleResponse toFlashSaleResponse(FlashSale entity);

    default String formatOptions(ProductVariant variant) {
        if (variant == null) return "";
        return String.format(
                        "%s %s %s",
                        variant.getOption1Value() != null ? variant.getOption1Value() : "",
                        variant.getOption2Value() != null ? variant.getOption2Value() : "",
                        variant.getOption3Value() != null ? variant.getOption3Value() : "")
                .trim();
    }

    default boolean checkIsActive(FlashSale entity) {
        if (entity == null || entity.getStartTime() == null || entity.getEndTime() == null) {
            return false;
        }
        LocalDateTime now = LocalDateTime.now();
        return entity.getStatus() != null
                && entity.getStatus() == 1
                && !entity.getStartTime().isAfter(now)
                && !entity.getEndTime().isBefore(now);
    }

    default boolean checkIsSoldOut(FlashSale entity) {
        if (entity == null || entity.getSoldQuantity() == null || entity.getSaleStockQuantity() == null) {
            return false;
        }
        return entity.getSoldQuantity() >= entity.getSaleStockQuantity();
    }

    default Integer calculateDiscountPercentage(FlashSale entity) {
        if (entity == null
                || entity.getProductVariant() == null
                || entity.getProductVariant().getPrice() == null) {
            return 0;
        }
        BigDecimal original = entity.getProductVariant().getPrice();
        BigDecimal flashSale = entity.getFlashSalePrice();

        if (original.compareTo(BigDecimal.ZERO) <= 0) return 0;

        BigDecimal discount = original.subtract(flashSale)
                .divide(original, 2, java.math.RoundingMode.HALF_UP)
                .multiply(new BigDecimal("100"));

        return discount.intValue();
    }

    @Mapping(target = "flashSaleId", source = "sale.id")
    @Mapping(
            target = "discountPercentage",
            expression = "java(calculateDiscount(originalPrice, sale.getFlashSalePrice()))")
    @Mapping(target = "isActiveNow", constant = "true")
    FlashSaleInfo toFlashSaleInfo(FlashSale sale, BigDecimal originalPrice);

    default Integer calculateDiscount(BigDecimal originalPrice, BigDecimal sale) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) == 0) return 0;
        return 100
                - sale.multiply(new BigDecimal("100"))
                        .divide(originalPrice, RoundingMode.HALF_UP)
                        .intValue();
    }
}
