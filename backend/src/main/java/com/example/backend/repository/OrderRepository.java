package com.example.backend.repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.Order;
import com.example.backend.enums.OrderStatus;
import com.example.backend.repository.projection.OrderStatusCountProjection;
import com.example.backend.repository.projection.UserOrderProjection;
import com.example.backend.repository.projection.WarrantyProjection;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByCode(String code);

    List<Order> findByCodeIn(List<String> codes);

	List<Order> findAllByOrderByUpdatedAtDesc();

	// CLIENT
	String BASE_USER_ORDERS_SQL = """
       SELECT 
           o.id,
           o.user_id,
           o.code,
           o.created_at AS "createdAt",
           CAST(o.order_status AS VARCHAR) AS "orderStatus",
           o.final_amount AS "finalAmount",
           lp.method AS "paymentMethod",
           lp.status AS "paymentStatus",
           CONCAT_WS(', ', o.shipping_address, o.shipping_ward, o.shipping_district, o.shipping_city) AS "fullShippingAddress",
           CAST(oia.items_json AS VARCHAR) AS "itemsJson",
           oia.all_product_names AS "searchNames"
       FROM orders o
       
       -- Lấy phương thức và trạng thái thanh toán mới nhất của đơn hàng
       LEFT JOIN ( 
           SELECT DISTINCT ON (order_id) order_id, method, status
           FROM payments
           ORDER BY order_id, id DESC
       ) lp ON lp.order_id = o.id
       
       -- Nhóm các sản phẩm trong đơn hàng thành JSON và chuỗi tìm kiếm
       LEFT JOIN ( 
           SELECT 
               oi.order_id,
               json_agg(
                   json_build_object(
                       'productName', oi.product_name, 
             
                       'thumbnail', COALESCE(pvi.image_url, oi.thumbnail), 
                       'variantId', oi.product_variant_id,
                       'variantInfo', CONCAT_WS(' ', oi.option1_value, oi.option2_value, oi.option3_value), 
                       'quantity', oi.quantity, 
                       'price', oi.price, 
                       'isReviewed', CASE WHEN r.id IS NOT NULL THEN true ELSE false END
                   )
               ) AS items_json,
               string_agg(CAST(oi.product_name AS VARCHAR), ' ') AS all_product_names
           FROM order_items oi
           LEFT JOIN reviews r ON r.order_item_id = oi.id
           
           -- LỌC ẢNH VARIANT: Ưu tiên is_thumbnail = true, sau đó đến sort_order nhỏ nhất
           LEFT JOIN (
               SELECT DISTINCT ON (variant_id) variant_id, image_url
               FROM product_variant_images
               ORDER BY variant_id, is_thumbnail DESC, sort_order ASC
           ) pvi ON pvi.variant_id = oi.product_variant_id
           
           GROUP BY oi.order_id
       ) oia ON oia.order_id = o.id
       """;

	@Query(value = """
       SELECT 
           v.id, v.code, v."createdAt", v."orderStatus", 
           v."finalAmount", v."paymentMethod", v."paymentStatus", 
           v."fullShippingAddress", v."itemsJson" 
       FROM (
       """ + BASE_USER_ORDERS_SQL + """
       ) v 
       WHERE v.user_id = :userId 
       AND (:status IS NULL OR v."orderStatus" = :status) 
       AND (:keyword IS NULL OR :keyword = '' 
           OR v.code ILIKE CONCAT('%', :keyword, '%') 
           OR v."searchNames" ILIKE CONCAT('%', :keyword, '%')
       ) 
       ORDER BY v."createdAt" DESC
       """,
			countQuery = """
       SELECT count(v.id) 
      FROM (
      """ + BASE_USER_ORDERS_SQL + """
      ) v 
     WHERE v.user_id = :userId 
     AND (:status IS NULL OR v."orderStatus" = :status) 
     AND (:keyword IS NULL OR :keyword = '' 
          OR v.code ILIKE CONCAT('%', :keyword, '%') 
          OR v."searchNames" ILIKE CONCAT('%', :keyword, '%')
     )
     """, nativeQuery = true
	)
	Page<UserOrderProjection> findUserOrdersWithFilters(
			@Param("userId") Integer userId,
			@Param("status") String status,
			@Param("keyword") String keyword,
			Pageable pageable);

	@Query(value = """
    SELECT CAST(order_status AS TEXT) AS status, COUNT(id) AS count
    FROM orders
    WHERE user_id = :userId
    GROUP BY order_status
    """, nativeQuery = true)
	List<OrderStatusCountProjection> countOrdersByStatusForUser(@Param("userId") Integer userId);

	@Query(
			value = """
            SELECT 
                o.code AS "orderCode",
                o.customer_name AS "customerName",
                o.customer_phone AS phone,
                oi.product_name AS "productName",
                oi.thumbnail,
                ps.serial_number AS imei,
                p.warranty_period AS "warrantyPeriodText",
                o.updated_at AS "purchaseDate",
                CAST(o.order_status AS VARCHAR) AS status
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN product_variants pv ON oi.product_variant_id = pv.id
            JOIN products p ON pv.product_id = p.id
            LEFT JOIN product_serials ps ON ps.order_id = o.id AND ps.product_variant_id = pv.id
            WHERE o.order_status = 'COMPLETED'
            AND (
                o.customer_phone = :keyword
                OR o.code = :keyword
                OR ps.serial_number = :keyword
            )
            ORDER BY o.updated_at DESC
            """,
			nativeQuery = true
	)
	List<WarrantyProjection> searchWarranty(@Param("keyword") String keyword);


	// dashboard
	@Query("SELECT SUM(o.finalAmount) FROM Order o WHERE o.createdAt BETWEEN :start AND :end AND o.orderStatus = 'COMPLETED'")
	BigDecimal sumRevenueBetweenDates(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	@Query("SELECT DATE(o.createdAt), SUM(o.finalAmount) FROM Order o WHERE o.createdAt BETWEEN :start AND :end GROUP BY DATE(o.createdAt)")
	List<Object[]> getRevenueChartData(@Param("start") LocalDateTime start, @Param("end") LocalDateTime end);

	long countByOrderStatusAndCreatedAtBetween(OrderStatus status, LocalDateTime start, LocalDateTime end);

	List<Order> findTop5ByCreatedAtBetweenOrderByCreatedAtDesc(LocalDateTime start, LocalDateTime end);

}
