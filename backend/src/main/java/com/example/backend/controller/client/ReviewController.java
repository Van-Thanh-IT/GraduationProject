package com.example.backend.controller.client;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.ReviewRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.AwaitingReviewResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.dto.response.ReviewSummaryResponse;
import com.example.backend.service.ReviewService;
import com.example.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("user/reviews/awaiting")
    public APIResponse<List<AwaitingReviewResponse>> getAwaitingReviews() {
        Integer userId = SecurityUtils.getCurrentUserId();
        return APIResponse.success(reviewService.getAwaitingReviews(userId));
    }

    @GetMapping("/public/products/{productId}/reviews")
    public APIResponse<List<ReviewResponse>> getProductReviews(
            @PathVariable Integer productId,
            @RequestParam(required = false) Integer rating) { // Dành cho nút lọc: 5 sao, 1 sao...

        // Trong Service ta đã gài cứng chỉ lấy bài có status = APPROVED
        return APIResponse.success(reviewService.getProductReviews(productId, rating));
    }

    @PostMapping(value = "/user/reviews", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<ReviewResponse> createReview(@ModelAttribute @Valid ReviewRequest request) {

        Integer userId = SecurityUtils.getCurrentUserId();
        return APIResponse.success(reviewService.createReview(userId, request));
    }

    @GetMapping("/public/products/{productId}/reviews/summary")
    public APIResponse<ReviewSummaryResponse> getReviewSummary(@PathVariable Integer productId) {
        return APIResponse.success(reviewService.getReviewSummary(productId));
    }
}
