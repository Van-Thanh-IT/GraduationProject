package com.example.backend.mapper;

import com.example.backend.dto.request.ReviewRequest;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.entity.ProductVariant;
import com.example.backend.entity.Review;
import com.example.backend.entity.ReviewImage;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Mapper(componentModel = "spring")
public interface ReviewMapper {

    // ==========================================
    // 1. MAPPING TỪ ENTITY SANG DTO RESPONSE
    // ==========================================
    @Mapping(target = "userId", source = "user.id")
    // Lưu ý: Tùy Entity User của bạn dùng trường username hay fullName thì sửa lại cho đúng nhé
    @Mapping(target = "userName", source = "user.username")
    @Mapping(target = "userAvatar", source = "user.avatar")

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productName", source = "product.name")

    @Mapping(target = "orderItemId", source = "orderItem.id")

    // Gọi hàm custom ở dưới để biến List<ReviewImage> thành List<String> url
    @Mapping(target = "images", expression = "java(mapImages(review.getImages()))")

    // Gọi hàm custom ở dưới để gộp thông số biến thể (VD: "Đen, Size M")
    @Mapping(target = "variantSpecs", expression = "java(mapVariantSpecs(review.getProductVariant()))")
    ReviewResponse toResponse(Review review);


    // ==========================================
    // 2. MAPPING TỪ REQUEST SANG ENTITY
    // ==========================================
    // Chỉ map tự động rating và comment.
    // Các đối tượng quan hệ và Ảnh bắt buộc phải tự build ở Service!
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "product", ignore = true)
    @Mapping(target = "productVariant", ignore = true)
    @Mapping(target = "orderItem", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "images", ignore = true)
    Review toEntity(ReviewRequest request);


    // ==========================================
    // CÁC HÀM CUSTOM HỖ TRỢ MAPSTRUCT
    // ==========================================

    /**
     * Chuyển đổi danh sách đối tượng ReviewImage thành mảng String chứa link ảnh
     */
    default List<String> mapImages(List<ReviewImage> reviewImages) {
        if (reviewImages == null || reviewImages.isEmpty()) {
            return new ArrayList<>();
        }
        return reviewImages.stream()
                .map(ReviewImage::getImageUrl)
                .collect(Collectors.toList());
    }

    /**
     * Gộp các thuộc tính Option 1, 2, 3 của Variant thành 1 chuỗi hiển thị
     * Ví dụ: Option1="Đỏ", Option2="Size M" -> "Đỏ, Size M"
     */
    default String mapVariantSpecs(ProductVariant variant) {
        if (variant == null) {
            return null;
        }
        List<String> specs = new ArrayList<>();

        if (variant.getOption1Value() != null && !variant.getOption1Value().isBlank()) {
            specs.add(variant.getOption1Value());
        }
        if (variant.getOption2Value() != null && !variant.getOption2Value().isBlank()) {
            specs.add(variant.getOption2Value());
        }
        if (variant.getOption3Value() != null && !variant.getOption3Value().isBlank()) {
            specs.add(variant.getOption3Value());
        }

        return String.join(", ", specs);
    }
}