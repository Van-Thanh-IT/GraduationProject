package com.example.backend.controller.management;

import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.ReviewResponse;
import com.example.backend.enums.ReviewStatus;
import com.example.backend.service.ReviewService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/reviews")
@RequiredArgsConstructor
public class ReviewManagementController {

    private final ReviewService reviewService;

    @GetMapping
    public APIResponse<Page<ReviewResponse>> getAllReviews(
            @RequestParam(required = false) Integer productId,
            @RequestParam(required = false) Integer rating,
            @RequestParam(required = false) ReviewStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Page<ReviewResponse> responsePage = reviewService.getAllReviewsForAdmin(productId, rating, status, page, size);
        return APIResponse.success(responsePage);
    }

    @PutMapping("/{id}/status")
    public APIResponse<ReviewResponse> updateReviewStatus(@PathVariable Integer id, @RequestParam ReviewStatus status) {

        ReviewResponse updatedReview = reviewService.updateReviewStatus(id, status);
        return APIResponse.success(updatedReview);
    }

    @DeleteMapping("/{id}")
    public APIResponse<String> deleteReview(@PathVariable Integer id) {
        reviewService.deleteReviewByAdmin(id);
        return APIResponse.success("Đã xóa đánh giá thành công!");
    }
}
