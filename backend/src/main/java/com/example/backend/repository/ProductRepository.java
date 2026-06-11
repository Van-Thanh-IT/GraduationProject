package com.example.backend.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Product;
import com.example.backend.repository.projection.ProductCardProjection;
import com.example.backend.repository.projection.RatingProjection;

public interface ProductRepository extends JpaRepository<Product, Integer> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Integer id);

    boolean existsBySlug(String slug);

	String BASE_PRODUCT_CARD_SQL = """
        SELECT 
            p.id, 
            p.name, 
            p.slug, 
            p.thumbnail, 
            p.status, 
            p.deleted_at, 
            p.created_at, 
            pv_rep.id AS "defaultVariantId", 
            pv_rep.price, 
            pv_rep.original_price AS "originalPrice", 
            COALESCE(rs.rating, 0.0) AS rating, 
            COALESCE(rs.review_count, 0) AS "reviewCount", 
            COALESCE(vs.stock_quantity, 0) AS "stockQuantity", 
            COALESCE(os.sold_count, 0) AS "soldCount", 
            CASE 
                WHEN p.created_at >= (CURRENT_TIMESTAMP - INTERVAL '30 days') THEN 1 
                ELSE 0 
            END AS "isNew", 
            CONCAT_WS(', ', pv_rep.option1_value, pv_rep.option2_value, pv_rep.option3_value) AS "specsStr" 
        FROM products p 
        
        -- Lấy Variant mặc định (Giá tốt nhất / Đang Flash Sale)
        LEFT JOIN LATERAL ( 
            SELECT v.id, v.price, v.original_price, v.option1_value, v.option2_value, v.option3_value 
            FROM product_variants v 
            LEFT JOIN flash_sales fs ON fs.product_variant_id = v.id 
                AND fs.status = 1 
                AND fs.start_time <= CURRENT_TIMESTAMP 
                AND fs.end_time >= CURRENT_TIMESTAMP 
            WHERE v.product_id = p.id AND v.deleted_at IS NULL 
            ORDER BY (fs.id IS NOT NULL) DESC, v.is_default DESC, v.price ASC 
            LIMIT 1
        ) pv_rep ON true 
        
        -- Lấy thống kê Review
        LEFT JOIN ( 
            SELECT product_id, AVG(rating) AS rating, COUNT(id) AS review_count 
            FROM reviews 
            WHERE deleted_at IS NULL AND status = 'APPROVED' 
            GROUP BY product_id
        ) rs ON rs.product_id = p.id 
        
        -- Lấy số lượng tồn kho
        LEFT JOIN ( 
            SELECT product_id, SUM(stock_quantity) AS stock_quantity 
            FROM product_variants 
            WHERE deleted_at IS NULL 
            GROUP BY product_id
        ) vs ON vs.product_id = p.id 
        
        -- Lấy số lượng đã bán
        LEFT JOIN ( 
            SELECT pv_inner.product_id, SUM(oi.quantity) AS sold_count 
            FROM order_items oi 
            JOIN orders o ON oi.order_id = o.id 
            JOIN product_variants pv_inner ON oi.product_variant_id = pv_inner.id 
            WHERE o.order_status = 'COMPLETED' 
            GROUP BY pv_inner.product_id
        ) os ON os.product_id = p.id
        """;

	@Query(
			value = "SELECT * FROM (" + BASE_PRODUCT_CARD_SQL + ") v " +
					"WHERE v.status = 'ACTIVE' AND v.deleted_at IS NULL " +
					"AND v.\"soldCount\" > 4 " +
					"ORDER BY v.\"soldCount\" DESC, v.id DESC " +
					"LIMIT 15",
			nativeQuery = true
	)
	List<ProductCardProjection> getBestSellers();

	@Query(
			value = "SELECT * FROM (" + BASE_PRODUCT_CARD_SQL + ") v " +
					"WHERE v.status = 'ACTIVE' AND v.deleted_at IS NULL " +
					"AND v.id NOT IN :excludedIds " +
					"ORDER BY v.created_at DESC " +
					"LIMIT 20",
			nativeQuery = true
	)
	List<ProductCardProjection> getDefaultProducts(@Param("excludedIds") Set<Integer> excludedIds);

    // Tìm kiếm và hiển thị sản phẩm
    String BASE_FILTER_WHERE =
            """
		WHERE p.status = 'ACTIVE' AND p.deleted_at IS NULL
		AND (:keyword IS NULL OR :keyword = '' OR p.name ILIKE CONCAT('%', :keyword, '%'))
		AND (:categorySlug IS NULL OR :categorySlug = '' OR c.slug = :categorySlug)
		AND (:brandSlug IS NULL OR :brandSlug = '' OR b.slug = :brandSlug)
		-- Lọc giá dựa trên giá Flash Sale (nếu có), nếu không thì dùng giá gốc
		AND (:minPrice IS NULL OR COALESCE(pv_rep.flash_sale_price, pv_rep.price) >= :minPrice)
		AND (:maxPrice IS NULL OR COALESCE(pv_rep.flash_sale_price, pv_rep.price) <= :maxPrice)
		AND (:isFlashSale = false OR pv_rep.flashSaleId IS NOT NULL)
	""";

    @Query(
            value =
                    """
			SELECT
			p.id, p.name, p.slug, p.thumbnail, p.created_at AS "createdAt",
			pv_rep.price, pv_rep.original_price AS "originalPrice",
			COALESCE(rs.rating, 0.0) AS rating,
			COALESCE(rs.reviewCount, 0) AS "reviewCount",
			COALESCE(vs.stockQuantity, 0) AS "stockQuantity",
			COALESCE(os.soldCount, 0) AS "soldCount",
			CASE WHEN p.created_at >= NOW() - INTERVAL '30 days' THEN 1 ELSE 0 END AS "isNew",
			CONCAT_WS(', ', pv_rep.option1_value, pv_rep.option2_value, pv_rep.option3_value) AS "specsStr",
			pv_rep.id AS "defaultVariantId",
			pv_rep.flash_sale_price AS "flashSalePrice",
			pv_rep.flashSaleEndTime AS "flashSaleEndTime"
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN brands b ON p.brand_id = b.id

			-- GỘP CHUNG VARIANT VÀ FLASH SALE VÀO 1 KHỐI LATERAL
			LEFT JOIN LATERAL (
			SELECT v.id, v.price, v.original_price, v.option1_value, v.option2_value, v.option3_value,
					f.id AS flashSaleId, f.flash_sale_price, f.end_time AS flashSaleEndTime
			FROM product_variants v
			-- Join trực tiếp với Flash Sale tại đây
			LEFT JOIN flash_sales f ON f.product_variant_id = v.id
					AND f.status = 1
					AND f.sold_quantity < f.sale_stock_quantity  
					AND f.start_time <= NOW() 
					AND f.end_time >= NOW()
			WHERE v.product_id = p.id AND v.deleted_at IS NULL
			ORDER BY
					-- Luật ưu tiên số 1: Có Flash Sale thì xếp lên đầu tiên
					CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END DESC,
					-- Luật ưu tiên số 2: Lấy biến thể mặc định
					v.is_default DESC,
					-- Luật ưu tiên số 3: Lấy giá rẻ nhất
					v.price ASC
			LIMIT 1
			) pv_rep ON true

			-- LATERAL tính Rating
			LEFT JOIN LATERAL (
			SELECT AVG(r.rating) AS rating, COUNT(r.id) AS reviewCount
			FROM reviews r
			WHERE r.product_id = p.id AND r.deleted_at IS NULL AND r.status = 'APPROVED'
			) rs ON true

			-- LATERAL tính Tồn kho
			LEFT JOIN LATERAL (
			SELECT SUM(v.stock_quantity) AS stockQuantity
			FROM product_variants v
			WHERE v.product_id = p.id AND v.deleted_at IS NULL
			) vs ON true

			-- LATERAL tính Lượt bán
			LEFT JOIN LATERAL (
			SELECT SUM(oi.quantity) AS soldCount
			FROM order_items oi
			JOIN orders o ON oi.order_id = o.id
			WHERE oi.product_variant_id IN (SELECT id FROM product_variants WHERE product_id = p.id)
				AND o.order_status = 'COMPLETED'
			) os ON true

			"""
                            + BASE_FILTER_WHERE
                            + """
			ORDER BY
                               -- 1. Nếu sortBy là giá tăng dần
                CASE WHEN :sortBy = 'price_asc' THEN COALESCE(pv_rep.flash_sale_price, pv_rep.price) END ASC NULLS LAST,
                     
                -- 2. Nếu sortBy là giá giảm dần
                CASE WHEN :sortBy = 'price_desc' THEN COALESCE(pv_rep.flash_sale_price, pv_rep.price) END DESC NULLS LAST,
                     
                -- 3. Nếu sortBy là bán chạy nhất
                CASE WHEN :sortBy = 'best_seller' THEN COALESCE(os.soldCount, 0) END DESC NULLS LAST,
                     
                -- 4. LUÔN LUÔN CÓ FALLBACK: Sắp xếp mặc định là Mới nhất (newest)
                p.created_at DESC
		""",
            countQuery =
                    """
			SELECT count(p.id)
			FROM products p
			LEFT JOIN categories c ON p.category_id = c.id
			LEFT JOIN brands b ON p.brand_id = b.id
			-- Count query cũng cần khối pv_rep này để chạy điều kiện Filter
			LEFT JOIN LATERAL (
			SELECT v.price, f.id AS flashSaleId, f.flash_sale_price
			FROM product_variants v
			LEFT JOIN flash_sales f ON f.product_variant_id = v.id
					AND f.status = 1
					AND f.sold_quantity < f.sale_stock_quantity 
					AND f.start_time <= NOW() 
					AND f.end_time >= NOW()
			WHERE v.product_id = p.id AND v.deleted_at IS NULL
			ORDER BY CASE WHEN f.id IS NOT NULL THEN 1 ELSE 0 END DESC, v.is_default DESC, v.price ASC LIMIT 1
			) pv_rep ON true
			"""
                            + BASE_FILTER_WHERE,
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
    @Query("SELECT p FROM Product p " + "LEFT JOIN FETCH p.brand "
            + "LEFT JOIN FETCH p.category "
            + "WHERE p.slug = :slug AND p.status = 'ACTIVE'")
    Optional<Product> findDetailBySlug(@Param("slug") String slug);

    @Query(
            value = "SELECT COALESCE(AVG(rating), 0.0) AS avgRating, COUNT(id) AS totalReviews "
                    + "FROM reviews WHERE product_id = :productId AND deleted_at IS NULL AND status = 'APPROVED'",
            nativeQuery = true)
    RatingProjection getProductRating(@Param("productId") Integer productId);

	/**
	 * AI Search tối ưu:
	 * 1. ILIKE cho chuỗi chính xác
	 * 2. websearch_to_tsquery cho tìm kiếm linh hoạt
	 * 3. Trọng số sắp xếp thông minh (Exact match > Rank > Sold Count)
	 */
	String AI_SEARCH_QUERY =
			"""
    SELECT
        p.id, p.name, p.slug, p.thumbnail,
        pv.price, pv.original_price AS "originalPrice",
        CONCAT_WS(', ', pv.option1_value, pv.option2_value, pv.option3_value) AS "specsStr",
        COALESCE(os.sold_count, 0) AS "soldCount"
    FROM products p
    -- Join lấy Variant mặc định (ưu tiên bản có giá thấp nhất nếu có nhiều bản default)
    LEFT JOIN LATERAL (
        SELECT v.price, v.original_price, v.option1_value, v.option2_value, v.option3_value
        FROM product_variants v
        WHERE v.product_id = p.id AND v.deleted_at IS NULL
        ORDER BY v.is_default DESC, v.price ASC
        LIMIT 1
    ) pv ON TRUE
    -- Join lấy dữ liệu thống kê bán hàng
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
    
    --  BỘ LỌC TÌM KIẾM THÔNG MINH
    AND (
        :keyword IS NULL OR :keyword = ''
        OR p.name ILIKE CONCAT('%', :keyword, '%')
        OR to_tsvector('simple', p.name || ' ' || COALESCE(c.name, '') || ' ' || COALESCE(b.name, '')) @@ websearch_to_tsquery('simple', :keyword)
    )
    AND (:brandName IS NULL OR :brandName = '' OR b.name ILIKE CONCAT('%', :brandName, '%'))
    AND (:categoryName IS NULL OR :categoryName = '' OR c.name ILIKE CONCAT('%', :categoryName, '%'))
    AND (:minPrice IS NULL OR pv.price >= :minPrice)
    AND (:maxPrice IS NULL OR pv.price <= :maxPrice)
    
    --  SẮP XẾP ƯU TIÊN THÔNG MINH (CHỐT ĐƠN)
    ORDER BY
        -- Ưu tiên 1: Khớp chuỗi chính xác 100% (Ví dụ gõ "iPhone 16 Pro Max" là cho lên Top 1 luôn)
        CASE WHEN :keyword IS NOT NULL AND :keyword != '' AND p.name ILIKE CONCAT('%', :keyword, '%') THEN 1 ELSE 0 END DESC,
        -- Ưu tiên 2: Khớp từ khóa rải rác (Full-Text Search Rank)
        ts_rank(to_tsvector('simple', p.name), websearch_to_tsquery('simple', :keyword)) DESC,
        -- Ưu tiên 3: Nếu độ khớp bằng nhau, sản phẩm nào bán chạy hơn sẽ được AI tư vấn trước
        os.sold_count DESC
    LIMIT 1
    """;

	@Query(value = AI_SEARCH_QUERY, nativeQuery = true)
	Optional<ProductCardProjection> findBestMatchProductForAI(
			@Param("keyword") String keyword,
			@Param("brandName") String brandName,
			@Param("categoryName") String categoryName,
			@Param("minPrice") BigDecimal minPrice,
			@Param("maxPrice") BigDecimal maxPrice);
}
