package com.example.backend.repository;

import com.example.backend.entity.Review;
import com.example.backend.enums.ReviewStatus;
import com.example.backend.repository.projection.ReviewProjection;
import com.example.backend.repository.projection.ReviewSummaryProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Integer> {

    // ==========================================
    // API DÀNH CHO ADMIN (CÓ PHÂN TRANG)
    // ==========================================
    Page<Review> findAll(Pageable pageable);

    Page<Review> findByRating(Integer rating, Pageable pageable);

    Page<Review> findByProductId(Integer productId, Pageable pageable);

    Page<Review> findByProductIdAndRating(Integer productId, Integer rating, Pageable pageable);

    // ==========================================
    // API PUBLIC & KIỂM TRA (KHÔNG PHÂN TRANG)
    // ==========================================
    List<Review> findByProductIdOrderByCreatedAtDesc(Integer productId);

    List<Review> findByProductIdAndRatingOrderByCreatedAtDesc(Integer productId, Integer rating);

    @Query("SELECT COALESCE(AVG(r.rating), 0.0) FROM Review r WHERE r.product.id = :productId")
    Double getAverageRatingByProductId(@Param("productId") Integer productId);

    boolean existsByUserIdAndProductId(Integer userId, Integer productId);

    // 2. Viết Native Query tối ưu cho PostgreSQL
    // Lưu ý: Đổi chữ 'users' thành 'customers' nếu DB của bạn dùng bảng customers
    // 2. Câu Query chính
    String REVIEW_QUERY = """
            SELECT 
                r.id AS id, 
                u.username AS customerName, 
                u.avatar AS customerAvatar, 
                r.rating AS rating, 
                r.comment AS comment, 
                CONCAT_WS(', ', pv.option1_value, pv.option2_value, pv.option3_value) AS variantSpecs,
                (SELECT string_agg(ri.image_url, ',') FROM review_images ri WHERE ri.review_id = r.id) AS images,
                r.created_at AS createdAt 
            FROM reviews r
            LEFT JOIN users u ON r.user_id = u.id 
            LEFT JOIN product_variants pv ON r.product_variant_id = pv.id
            WHERE r.product_id = :productId 
              AND r.status = 'APPROVED' 
            ORDER BY 
              CASE WHEN :sortBy = 'rating_desc' THEN r.rating END DESC NULLS LAST,
              CASE WHEN :sortBy = 'rating_asc' THEN r.rating END ASC NULLS LAST,
              r.created_at DESC
            """;

    // 3. Câu Query đếm số lượng
    String REVIEW_COUNT_QUERY = """
            SELECT count(r.id) 
            FROM reviews r 
            WHERE r.product_id = :productId 
              AND r.status = 'APPROVED'
            """;

    @Query(value = REVIEW_QUERY, countQuery = REVIEW_COUNT_QUERY, nativeQuery = true)
    Page<ReviewProjection> getApprovedReviewsByProductId(
            @Param("productId") Integer productId,
            @Param("sortBy") String sortBy,
            Pageable pageable
    );





    // ==========================================
    // 1. CHỐT CHẶN SPAM
    // ==========================================
    // Kiểm tra xem dòng sản phẩm trong đơn hàng này đã được đánh giá chưa
    boolean existsByOrderItemId(Integer orderItemId);

    // ==========================================
    // 2. DÀNH CHO KHÁCH HÀNG (PUBLIC API)
    // ==========================================
    // Lấy tất cả đánh giá của Sản phẩm (Chỉ lấy bài ĐÃ DUYỆT)
    List<Review> findByProductIdAndStatusOrderByCreatedAtDesc(Integer productId, ReviewStatus status);

    // Lấy đánh giá của Sản phẩm theo số Sao (Chỉ lấy bài ĐÃ DUYỆT)
    List<Review> findByProductIdAndStatusAndRatingOrderByCreatedAtDesc(Integer productId, ReviewStatus status, Integer rating);

    // ==========================================
    // 3. DÀNH CHO ADMIN (QUẢN LÝ ĐÁNH GIÁ)
    // ==========================================
    // Dùng JPQL để lọc đa điều kiện một cách an toàn.
    // Nếu tham số truyền vào là null thì bỏ qua điều kiện đó.
    @Query("SELECT r FROM Review r WHERE " +
            "(:productId IS NULL OR r.product.id = :productId) AND " +
            "(:rating IS NULL OR r.rating = :rating) AND " +
            "(:status IS NULL OR r.status = :status)")
    Page<Review> findAllForAdmin(@Param("productId") Integer productId,
                                 @Param("rating") Integer rating,
                                 @Param("status") ReviewStatus status,
                                 Pageable pageable);


    // 2. Câu SQL tính toán siêu tốc (Chỉ đếm các bài đã APPROVED)
    @Query(value = """
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
            """, nativeQuery = true)
    ReviewSummaryProjection getReviewSummaryByProductId(@Param("productId") Integer productId);
}