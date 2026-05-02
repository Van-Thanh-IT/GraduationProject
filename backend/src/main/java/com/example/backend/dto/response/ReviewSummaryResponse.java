package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewSummaryResponse {
    private Double averageRating; // Ví dụ: 4.8
    private Integer totalReviews; // Tổng số lượng đánh giá

    // Đếm chi tiết từng mức sao
    private Integer fiveStar;
    private Integer fourStar;
    private Integer threeStar;
    private Integer twoStar;
    private Integer oneStar;
}