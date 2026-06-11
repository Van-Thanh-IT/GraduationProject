package com.example.backend.mapper;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.response.AwaitingReviewResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.dto.response.ReviewSummaryResponse;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.ProductVariant;
import com.example.backend.entity.Review;
import com.example.backend.entity.ReviewImage;
import com.example.backend.repository.projection.ReviewSummaryProjection;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    @Mapping(target = "userId", source = "user.id")
    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "userAvatar", source = "user.avatar")
    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "orderItemId", source = "orderItem.id")
    @Mapping(target = "images", expression = "java(mapImages(review.getImages()))")
    @Mapping(target = "variantSpecs", expression = "java(buildVariantSpecs(review.getProductVariant()))")
    ReviewResponse toReviewResponse(Review review);

    @Mapping(target = "totalReviews", source = "totalReviews", defaultValue = "0")
    @Mapping(target = "averageRating", source = "averageRating", defaultValue = "0.0")
    ReviewSummaryResponse toSummaryResponse(ReviewSummaryProjection projection);

    @Mapping(source = "id", target = "orderItemId")
    @Mapping(source = "productVariant.product.id", target = "productId")
    @Mapping(source = "productVariant.product.name", target = "productName")
    @Mapping(source = "productVariant.product.thumbnail", target = "thumbnail")
    @Mapping(source = "order.createdAt", target = "orderDate")
    @Mapping(target = "variantSpecs", expression = "java(buildVariantSpecs(item.getProductVariant()))")
    AwaitingReviewResponse toAwaitingReviewResponse(OrderItem item);

    /**
     * Chuyển đổi danh sách đối tượng ReviewImage thành mảng String chứa link ảnh
     */
    default List<String> mapImages(List<ReviewImage> reviewImages) {
        if (reviewImages == null || reviewImages.isEmpty()) {
            return new ArrayList<>();
        }
        return reviewImages.stream().map(ReviewImage::getImageUrl).toList();
    }

    default String buildVariantSpecs(ProductVariant variant) {
        if (variant == null) return "";
        return Stream.of(variant.getOption1Value(), variant.getOption2Value(), variant.getOption3Value())
                .filter(Objects::nonNull)
                .filter(s -> !s.trim().isEmpty())
                .collect(Collectors.joining(" - "));
    }
}
