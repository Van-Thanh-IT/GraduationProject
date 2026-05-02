package com.example.backend.repository.projection;

public interface ReviewSummaryProjection {
    Double getAverageRating();
    Integer getTotalReviews();
    Integer getFiveStar();
    Integer getFourStar();
    Integer getThreeStar();
    Integer getTwoStar();
    Integer getOneStar();
}
