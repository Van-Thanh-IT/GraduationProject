//package com.example.backend.controller.client;
//
//import com.example.backend.dto.request.ReviewRequest;
//import com.example.backend.dto.response.APIResponse;
//import com.example.backend.dto.response.ReviewResponse;
//import com.example.backend.service.ReviewService;
//import com.example.backend.utils.SecurityUtils;
//import jakarta.validation.Valid;
//import lombok.RequiredArgsConstructor;
//import org.springframework.http.MediaType;
//import org.springframework.web.bind.annotation.*;
//
//import java.util.List;
//
//@RestController
//@RequestMapping("/api")
//@RequiredArgsConstructor
//public class ReviewController {
//
//    private final ReviewService reviewService;
//
//    // API 1: PUBLIC - Lấy danh sách đánh giá của 1 sản phẩm (Có thể truyền thêm ?rating=5 để lọc)
////    @GetMapping("/public/products/{productId}/reviews")
////    public APIResponse<List<ReviewResponse>> getProductReviews(
////            @PathVariable Integer productId,
////            @RequestParam(required = false) Integer rating) {
////        return APIResponse.success(reviewService.getProductReviews(productId, rating));
////    }
//
//    @PostMapping(value = "/user/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
//    public APIResponse<ReviewResponse> createReview(
//            @ModelAttribute @Valid ReviewRequest request) {
//        Integer userId = SecurityUtils.getCurrentUserId();
//        return APIResponse.success(reviewService.createReview(userId, request));
//    }
//
//}

package com.example.backend.controller.client;

import com.example.backend.dto.request.ReviewRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.AwaitingReviewResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.dto.response.ReviewSummaryResponse;
import com.example.backend.service.ReviewService;
import com.example.backend.utils.SecurityUtils;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // Lấy danh sách chờ đánh giá
    @GetMapping("user/reviews/awaiting")
    public APIResponse<List<AwaitingReviewResponse>> getAwaitingReviews() {
        Integer userId = SecurityUtils.getCurrentUserId();
        return APIResponse.success(reviewService.getAwaitingReviews(userId));
    }

    // ==========================================
    // API 1: PUBLIC - LẤY DANH SÁCH ĐÁNH GIÁ ĐÃ DUYỆT CỦA SẢN PHẨM
    // ==========================================
    @GetMapping("/public/products/{productId}/reviews")
    public APIResponse<List<ReviewResponse>> getProductReviews(
            @PathVariable Integer productId,
            @RequestParam(required = false) Integer rating) { // Dành cho nút lọc: 5 sao, 1 sao...

        // Trong Service ta đã gài cứng chỉ lấy bài có status = APPROVED
        return APIResponse.success(reviewService.getProductReviews(productId, rating));
    }

    // ==========================================
    // API 2: KHÁCH HÀNG - GỬI ĐÁNH GIÁ (Có Upload mảng ảnh)
    // ==========================================
    @PostMapping(value = "/user/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<ReviewResponse> createReview(
            // Dùng @ModelAttribute vì form gửi lên chứa file (không dùng @RequestBody được)
            @ModelAttribute @Valid ReviewRequest request) {

        Integer userId = SecurityUtils.getCurrentUserId();
        return APIResponse.success(reviewService.createReview(userId, request));
    }


    // API: Lấy thông số tổng quan (Số sao, Đếm sao) để vẽ biểu đồ
    @GetMapping("/public/products/{productId}/reviews/summary")
    public APIResponse<ReviewSummaryResponse> getReviewSummary(@PathVariable Integer productId) {
        return APIResponse.success(reviewService.getReviewSummary(productId));
    }

}