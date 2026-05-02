//package com.example.backend.dto.response;
//
//import lombok.Builder;
//import lombok.Data;
//import java.time.LocalDateTime;
//
//@Data
//@Builder
//public class ReviewResponse {
//    private Integer id;
//    private Integer rating;
//    private String comment;
//    private String image;
//    private Boolean isVerifiedPurchase;
//    private LocalDateTime createdAt;
//
//    private Integer productId;
//    private String productName;
//
//    private Integer userId;
//    private String userName;
//    private String userAvatar;
//}

package com.example.backend.dto.response;

import com.example.backend.enums.ReviewStatus;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class ReviewResponse {

    private Integer id;
    private Integer rating;
    private String comment;

    // ĐỔI MỚI: Trả về 1 mảng các đường link ảnh
    private List<String> images;

    // MỚI: Trạng thái kiểm duyệt để Frontend/Admin biết
    private ReviewStatus status;

    private LocalDateTime createdAt;

    // --- THÔNG TIN SẢN PHẨM & BIẾN THỂ ---
    private Integer productId;
    private String productName;

    // MỚI: Thông số phân loại (VD: "Đen, Size M") để Frontend hiển thị trên thẻ đánh giá
    private String variantSpecs;

    // --- THÔNG TIN ĐƠN HÀNG ---
    private Integer orderItemId;

    // --- THÔNG TIN NGƯỜI DÙNG ---
    private Integer userId;
    private String userName;
    private String userAvatar;

    // XÓA: isVerifiedPurchase (Vì đã dùng orderItemId thì mặc định 100% là đã mua hàng)
}