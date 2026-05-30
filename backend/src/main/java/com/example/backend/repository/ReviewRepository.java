package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Review;
import com.example.backend.enums.ReviewStatus;
import com.example.backend.repository.projection.ReviewProjection;
import com.example.backend.repository.projection.ReviewSummaryProjection;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    Page<Review> findAll(Pageable pageable);

    String REVIEW_QUERY =
            """
		SELECT
			v.id,
			v."customerName",
			v."customerAvatar",
			v.rating,
			v.comment,
			v."variantSpecs",
			v.images,
			v."createdAt"
		FROM view_product_reviews v
		WHERE v.product_id = :productId
		AND v.status = 'APPROVED'
		ORDER BY
			CASE WHEN :sortBy = 'rating_desc' THEN v.rating END DESC NULLS LAST,
			CASE WHEN :sortBy = 'rating_asc' THEN v.rating END ASC NULLS LAST,
			v."createdAt" DESC
		""";

    String REVIEW_COUNT_QUERY =
            """
		SELECT count(v.id)
		FROM view_product_reviews v
		WHERE v.product_id = :productId
		AND v.status = 'APPROVED'
		""";

    @Query(value = REVIEW_QUERY, countQuery = REVIEW_COUNT_QUERY, nativeQuery = true)
    Page<ReviewProjection> getApprovedReviewsByProductId(
            @Param("productId") Integer productId, @Param("sortBy") String sortBy, Pageable pageable);

    boolean existsByOrderItemId(Integer orderItemId);

    // PUBLIC API
    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Integer productId, ReviewStatus status);

    List<Review> findByProductIdAndStatusAndRatingOrderByCreatedAtDesc(
            Integer productId, ReviewStatus status, Integer rating);

    @Query("SELECT r FROM Review r WHERE "
            + "(:productId IS NULL OR r.product.id = :productId) AND "
            + "(:rating IS NULL OR r.rating = :rating) AND "
            + "(:status IS NULL OR r.status = :status)")
    Page<Review> findAllForAdmin(
            @Param("productId") Integer productId,
            @Param("rating") Integer rating,
            @Param("status") ReviewStatus status,
            Pageable pageable);


    @Query(
            value =
                    """
			SELECT
				COALESCE(ROUND(AVG(r.rating), 1), 0.0) AS averageRating,
				COUNT(r.id) AS totalReviews,
				COALESCE(SUM(CASE WHEN r.rating = 5 THEN 1 ELSE 0 END), 0) AS fiveStar,
				COALESCE(SUM(CASE WHEN r.rating = 4 THEN 1 ELSE 0 END), 0) AS fourStar,
				COALESCE(SUM(CASE WHEN r.rating = 3 THEN 1 ELSE 0 END), 0) AS threeStar,
				COALESCE(SUM(CASE WHEN r.rating = 2 THEN 1 ELSE 0 END), 0) AS twoStar,
				COALESCE(SUM(CASE WHEN r.rating = 1 THEN 1 ELSE 0 END), 0) AS oneStar
			FROM reviews r
			WHERE r.product_id = :productId AND r.status = 'APPROVED'
			""",
            nativeQuery = true)
    ReviewSummaryProjection getReviewSummaryByProductId(@Param("productId") Integer productId);

	List<Review> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end, Pageable pageable);
}
