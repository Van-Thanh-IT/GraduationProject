//package com.example.backend.controller.admin;
//
//import com.example.backend.dto.response.APIResponse;
//import com.example.backend.dto.response.ReviewResponse;
//import com.example.backend.service.ReviewService;
//import lombok.RequiredArgsConstructor;
//import org.springframework.data.domain.Page;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequestMapping("/api/admin/reviews")
//@RequiredArgsConstructor
//public class AdminReviewController {
//
//    private final ReviewService reviewService;
//
//    // API: Lấy danh sách đánh giá cho màn hình Quản trị (Có phân trang, lọc theo sao)
//    @GetMapping
//    public APIResponse<Page<ReviewResponse>> getAllReviews(
//            @RequestParam(required = false) Integer productId,
//            @RequestParam(required = false) Integer rating,
//            @RequestParam(defaultValue = "0") int page,
//            @RequestParam(defaultValue = "10") int size
//    ) {
//        Page<ReviewResponse> responsePage = reviewService.getAllReviewsForAdmin(productId, rating, page, size);
//        return APIResponse.success(responsePage);
//    }
//
//    @DeleteMapping("/{id}")
//    public APIResponse<String> deleteReview(@PathVariable Integer id) {
//        reviewService.deleteReviewByAdmin(id);
//        return APIResponse.success("Đã xóa đánh giá thành công!");
//    }
//}

package com.example.backend.controller.management;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.enums.ReviewStatus;
import com.example.backend.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class ReviewManagementController {

    private final ReviewService reviewService;

    // ==========================================
    // API: LẤY DANH SÁCH ĐÁNH GIÁ (Kèm bộ lọc trạng thái)
    // ==========================================
    @GetMapping
    public APIResponse<Page<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) ReviewStatus status, // MỚI: Lọc theo PENDING, APPROVED, HIDDEN
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<ReviewResponse> responsePage = reviewService.getAllReviewsForAdmin(productId, rating, status, page, size);
        return APIResponse.success(responsePage);
    }

    // ==========================================
    // API: CẬP NHẬT TRẠNG THÁI KIỂM DUYỆT (MỚI)
    // ==========================================
    @PutMapping("/{id}/status")
    public APIResponse<ReviewResponse> updateReviewStatus(
            @PathVariable Integer id,
            @RequestParam ReviewStatus status) { // Truyền status mới vào đây (VD: APPROVED)

        ReviewResponse updatedReview = reviewService.updateReviewStatus(id, status);
        return APIResponse.success(updatedReview);
    }

    // ==========================================
    // API: XÓA CỨNG ĐÁNH GIÁ (SPAM/RÁC)
    // ==========================================
    @DeleteMapping("/{id}")
    public APIResponse<String> deleteReview(@PathVariable Integer id) {
        reviewService.deleteReviewByAdmin(id);
        return APIResponse.success("Đã xóa đánh giá thành công!");
    }
}