package com.example.backend.mapper;

import com.example.backend.dto.request.ProductRequest;
import com.example.backend.dto.request.ProductVariantRequest;
import com.example.backend.dto.response.*;
import com.example.backend.entity.Product;
import com.example.backend.entity.ProductAttributeValue;
import com.example.backend.entity.ProductVariant;
import com.example.backend.entity.ProductVariantImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import java.util.List;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface ProductMapper {

    @Mapping(target = "brandId", source = "brand.id")
    @Mapping(target = "brandName", source = "brand.name")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    ProductResponse toResponse(Product product);

    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    Product toEntity(ProductRequest request);

    @Mapping(target = "thumbnail", ignore = true)
    @Mapping(target = "brand", ignore = true)
    @Mapping(target = "category", ignore = true)
    void updateEntity(@MappingTarget Product product, ProductRequest request);

    @Mapping(target = "productId", source = "product.id")
    ProductVariantResponse toResponse(ProductVariant variant);

    List<ProductVariantResponse> toResponse(List<ProductVariant> variants);

    @Mapping(target = "product", ignore = true)
    ProductVariant toEntity(ProductVariantRequest request);

    @Mapping(target = "product", ignore = true)
    void updateEntity(@MappingTarget ProductVariant variant, ProductVariantRequest request);

    ProductVariantImageResponse toResponse(ProductVariantImage image);

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "attributeId", source = "attribute.id")
    @Mapping(target = "attributeName", source = "attribute.name")
    ProductAttributeValueResponse toResponse(ProductAttributeValue entity);


    //
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "options", expression = "java(formatVariantOptions(entity))")
    VariantSimpleResponse toSimpleResponse(ProductVariant entity);

    // Hàm tự định nghĩa để nối các Option lại với nhau bằng dấu " - "
    default String formatVariantOptions(ProductVariant variant) {
        if (variant == null) return "";

        java.util.List<String> options = new java.util.ArrayList<>();
        if (variant.getOption1Value() != null && !variant.getOption1Value().isBlank()) {
            options.add(variant.getOption1Value());
        }
        if (variant.getOption2Value() != null && !variant.getOption2Value().isBlank()) {
            options.add(variant.getOption2Value());
        }
        if (variant.getOption3Value() != null && !variant.getOption3Value().isBlank()) {
            options.add(variant.getOption3Value());
        }

        return String.join(" - ", options);
    }

}