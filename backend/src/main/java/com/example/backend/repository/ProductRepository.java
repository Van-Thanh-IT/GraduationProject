package com.example.backend.repository;

import com.example.backend.entity.Product;
import com.example.backend.repository.projection.ProductCardProjection;
import com.example.backend.repository.projection.RatingProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    // CLIENT
    // 1. LẤY SẢN PHẨM BÁN CHẠY (soldCount > 4)
    @Query(value = "SELECT * FROM view_product_cards v " +
            "WHERE v.status = 'ACTIVE' AND v.deleted_at IS NULL " +
            "AND v.\"soldCount\" > 4 " +
            "ORDER BY v.\"soldCount\" DESC, v.id DESC LIMIT 15",
            nativeQuery = true)
    List<ProductCardProjection> getBestSellers();

    // 2. LẤY SẢN PHẨM MẶC ĐỊNH (Loại trừ ID đã xuất hiện)
    @Query(value = "SELECT * FROM view_product_cards v " +
            "WHERE v.status = 'ACTIVE' AND v.deleted_at IS NULL " +
            "AND v.id NOT IN :excludedIds " +
            "ORDER BY v.created_at DESC LIMIT 20",
            nativeQuery = true)
    List<ProductCardProjection> getDefaultProducts(@Param("excludedIds") Set<Integer> excludedIds);


    // Tìm kiếm và hiển thị sản phẩm
    String BASE_FILTER_QUERY = """
                SELECT 
                    p.id, p.name, p.slug, p.thumbnail, p.created_at AS "createdAt",
                    pv.price, pv.original_price AS "originalPrice",
                    COALESCE(rs.rating, 0.0) AS rating,
                    COALESCE(rs.reviewCount, 0) AS "reviewCount",
                    COALESCE(vs.stockQuantity, 0) AS "stockQuantity",
                    COALESCE(os.soldCount, 0) AS "soldCount",
                    CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END AS "isNew",
                    CONCAT_WS(', ', pv.option1_value, pv.option2_value, pv.option3_value) AS "specsStr",
                    fs.flash_sale_price AS "flashSalePrice",
                    fs.end_time AS "flashSaleEndTime"
                FROM products p
                -- Join lấy Variant mặc định
                LEFT JOIN product_variants pv ON pv.id = (
                    SELECT v.id FROM product_variants v 
                    WHERE v.product_id = p.id AND v.deleted_at IS NULL 
                    ORDER BY v.is_default DESC, v.price ASC LIMIT 1
                )
                -- Join lấy Rating & Review (Tối ưu N+1)
                LEFT JOIN (
                    SELECT product_id, AVG(rating) AS rating, COUNT(id) AS reviewCount 
                    FROM reviews WHERE deleted_at IS NULL AND status = 'APPROVED' 
                    GROUP BY product_id
                ) rs ON rs.product_id = p.id
                -- Join lấy Tồn kho
                LEFT JOIN (
                    SELECT product_id, SUM(stock_quantity) AS stockQuantity 
                    FROM product_variants WHERE deleted_at IS NULL GROUP BY product_id
                ) vs ON vs.product_id = p.id
                -- Join lấy Lượt bán
                LEFT JOIN (
                    SELECT pv_inner.product_id, SUM(oi.quantity) AS soldCount 
                    FROM order_items oi 
                    JOIN orders o ON oi.order_id = o.id 
                    JOIN product_variants pv_inner ON oi.product_variant_id = pv_inner.id 
                    WHERE o.order_status = 'COMPLETED' GROUP BY pv_inner.product_id
                ) os ON os.product_id = p.id
                -- Join Flash Sale
                LEFT JOIN flash_sales fs ON fs.product_variant_id = pv.id 
                    AND fs.status = 1 AND fs.start_time <= NOW() AND fs.end_time >= NOW()
                LEFT JOIN categories c ON p.category_id = c.id
                LEFT JOIN brands b ON p.brand_id = b.id
                WHERE p.status = 'ACTIVE' AND p.deleted_at IS NULL
            """;

    @Query(value = BASE_FILTER_QUERY + """
            AND (:keyword IS NULL OR :keyword = '' OR to_tsvector('simple', p.name) @@ plainto_tsquery('simple', :keyword))
            AND (:categorySlug IS NULL OR :categorySlug = '' OR c.slug = :categorySlug)
            AND (:brandSlug IS NULL OR :brandSlug = '' OR b.slug = :brandSlug)
            AND (:minPrice IS NULL OR pv.price >= :minPrice)
            AND (:maxPrice IS NULL OR pv.price <= :maxPrice)
            AND (:isFlashSale = false OR fs.id IS NOT NULL)
            ORDER BY 
                CASE WHEN :sortBy = 'price_asc' THEN COALESCE(fs.flash_sale_price, pv.price) END ASC,
                CASE WHEN :sortBy = 'price_desc' THEN COALESCE(fs.flash_sale_price, pv.price) END DESC,
                CASE WHEN :sortBy = 'best_seller' THEN COALESCE(os.soldCount, 0) END DESC,
                p.created_at DESC
            """,
            countQuery = "SELECT count(*) FROM products p WHERE p.status = 'ACTIVE'",
            nativeQuery = true)
    Page<ProductCardProjection> searchAndFilterProducts(
            @Param("keyword") String keyword,
            @Param("categorySlug") String categorySlug,
            @Param("brandSlug") String brandSlug,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice,
            @Param("sortBy") String sortBy,
            @Param("isFlashSale") Boolean isFlashSale,
            Pageable pageable);


    // Lấy thông tin cơ bản của Sản phẩm + Brand + Category (1 query)
    @Query("SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.brand " +
            "LEFT JOIN FETCH p.category " +
            "WHERE p.slug = :slug AND p.status = 'ACTIVE'")
    Optional<Product> findDetailBySlug(@Param("slug") String slug);


    // Tính sao trung bình (PostgreSQL chuẩn)
    @Query(value = "SELECT COALESCE(AVG(rating), 0.0) AS avgRating, COUNT(id) AS totalReviews " +
            "FROM reviews WHERE product_id = :productId AND deleted_at IS NULL AND status = 'APPROVED'",
            nativeQuery = true)
    RatingProjection getProductRating(@Param("productId") Integer productId);


    /**
     * AI Search tối ưu: Sử dụng Full-Text Search và tối ưu hóa Join.
     */
    String AI_SEARCH_QUERY = """
            SELECT 
                p.id, p.name, p.slug, p.thumbnail, 
                pv.price, pv.original_price AS "originalPrice", 
                CONCAT_WS(', ', pv.option1_value, pv.option2_value, pv.option3_value) AS "specsStr",
                COALESCE(os.sold_count, 0) AS "soldCount"
            FROM products p
            -- Join lấy Variant mặc định (Dùng LATERAL JOIN sẽ nhanh hơn Subquery truyền thống trong PG)
            LEFT JOIN LATERAL (
                SELECT v.price, v.original_price, v.option1_value, v.option2_value, v.option3_value
                FROM product_variants v 
                WHERE v.product_id = p.id AND v.deleted_at IS NULL 
                ORDER BY v.is_default DESC, v.price ASC LIMIT 1
            ) pv ON TRUE
            -- Join lấy dữ liệu thống kê bán hàng (Giả định bạn có bảng thống kê hoặc Join trực tiếp)
            LEFT JOIN (
                SELECT pv_inner.product_id, SUM(oi.quantity) AS sold_count 
                FROM order_items oi 
                JOIN orders o ON oi.order_id = o.id 
                JOIN product_variants pv_inner ON oi.product_variant_id = pv_inner.id 
                WHERE o.order_status = 'COMPLETED' 
                GROUP BY pv_inner.product_id
            ) os ON os.product_id = p.id
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN brands b ON p.brand_id = b.id
            WHERE p.status = 'ACTIVE' AND p.deleted_at IS NULL
              -- Sử dụng Full-Text Search thay cho ILIKE để tận dụng GIN Index
              AND (:keyword IS NULL OR :keyword = '' OR to_tsvector('simple', p.name || ' ' || COALESCE(c.name, '') || ' ' || COALESCE(b.name, '')) @@ plainto_tsquery('simple', :keyword))
              AND (:brandName IS NULL OR :brandName = '' OR b.name ILIKE :brandName)
              AND (:categoryName IS NULL OR :categoryName = '' OR c.name ILIKE :categoryName)
              AND (:minPrice IS NULL OR pv.price >= :minPrice)
              AND (:maxPrice IS NULL OR pv.price <= :maxPrice)
            ORDER BY 
                -- Độ ưu tiên: Khớp tên > Bán chạy
                ts_rank(to_tsvector('simple', p.name), plainto_tsquery('simple', :keyword)) DESC,
                os.sold_count DESC
            LIMIT 1
            """;

    @Query(value = AI_SEARCH_QUERY, nativeQuery = true)
    Optional<ProductCardProjection> findBestMatchProductForAI(
            @Param("keyword") String keyword,
            @Param("brandName") String brandName,
            @Param("categoryName") String categoryName,
            @Param("minPrice") BigDecimal minPrice,
            @Param("maxPrice") BigDecimal maxPrice
    );
}