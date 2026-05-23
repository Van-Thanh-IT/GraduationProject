package com.example.backend.mapper;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Stream;

import com.example.backend.dto.response.admin.ProductResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.backend.dto.request.ProductRequest;
import com.example.backend.dto.request.ProductVariantRequest;
import com.example.backend.dto.response.*;
import com.example.backend.dto.response.admin.ProductAttributeValueResponse;
import com.example.backend.dto.response.client.ProductCardResponse;
import com.example.backend.entity.*;
import com.example.backend.repository.projection.ProductCardProjection;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandName", source = "brand.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    ProductResponse toProductResponse(Product product);

    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toProduct(ProductRequest request);

    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateProduct(@MappingTarget Product product, ProductRequest request);

    @Mapping(target = "productId", source = "product.id")
    ProductVariantResponse toVariantResponse(ProductVariant variant);

    List<ProductVariantResponse> toVariantResponse(List<ProductVariant> variants);

    @Mapping(target = "product", ignore = true)
    ProductVariant toVariant(ProductVariantRequest request);

    @Mapping(target = "product", ignore = true)
    void updateVariant(@MappingTarget ProductVariant variant, ProductVariantRequest request);

    ProductVariantImageResponse toVariantImageResponse(ProductVariantImage image);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "attributeId", source = "attribute.id")
    @Mapping(target = "attributeName", source = "attribute.name")
    ProductAttributeValueResponse toAttributeValueponse(ProductAttributeValue productAttributeValue);

    //
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "options", expression = "java(mapVariantOptions(productVariant))")
    VariantSimpleResponse toSimpleResponse(ProductVariant productVariant);

    default String mapVariantOptions(ProductVariant variant) {
        if (variant == null) return "";

        return Stream.of(variant.getOption1Value(), variant.getOption2Value(), variant.getOption3Value())
                .filter(opt -> opt != null && !opt.isBlank())
                .collect(java.util.stream.Collectors.joining(" - "));
    }

    @Mapping(target = "soldCount", expression = "java(p.getSoldCount() != null ? p.getSoldCount() : 0)")
    @Mapping(target = "reviewCount", expression = "java(p.getReviewCount() != null ? p.getReviewCount() : 0)")
    @Mapping(
            target = "rating",
            expression = "java(p.getRating() != null ? Math.round(p.getRating() * 10.0) / 10.0 : 0.0)")
    @Mapping(target = "isNew", expression = "java(p.getIsNew() != null && p.getIsNew() == 1)")
    @Mapping(target = "specs", expression = "java(parseSpecs(p.getSpecsStr()))")
    @Mapping(target = "flashSale", ignore = true)
    ProductCardResponse toProductCard(ProductCardProjection p);

    default List<String> parseSpecs(String specsStr) {
        return (specsStr != null && !specsStr.trim().isEmpty()) ? Arrays.asList(specsStr.split(",\\s*")) : null;
    }
}
