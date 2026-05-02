package com.example.backend.repository;

import com.example.backend.entity.Order;
import com.example.backend.enums.OrderStatus;
import com.example.backend.repository.projection.OrderStatusCountProjection;
import com.example.backend.repository.projection.UserOrderProjection;
import com.example.backend.repository.projection.WarrantyProjection;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface OrderRepository extends JpaRepository<Order, Integer> {

    Optional<Order> findByCode(String code);

    //in hóa đơn
    List<Order> findByCodeIn(List<String> codes);

    //dashboard
    // 1. Tính tổng doanh thu theo khoảng thời gian (Chỉ tính đơn COMPLETED)
    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.orderStatus = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueBetweenDates(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // 2. Đếm số đơn hàng theo trạng thái
    long countByOrderStatus(OrderStatus orderStatus);

    // 3. Doanh thu theo từng ngày (Dùng cho Line Chart) - Trả về mảng Object[] chứa Ngày và Doanh thu
    @Query("SELECT DATE(o.createdAt) as date, SUM(o.finalAmount) as revenue " +
            "FROM Order o WHERE o.orderStatus = 'COMPLETED' AND o.createdAt >= :startDate " +
            "GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt) ASC")
    List<Object[]> getRevenueChartData(@Param("startDate") LocalDateTime startDate);

    // 4. Lấy 5 đơn hàng mới nhất
    List<Order> findTop5ByOrderByCreatedAtDesc();


    //CLIENT
    @Query(value = """
        SELECT 
            o.id AS id, 
            o.code AS code, 
            o.created_at AS createdAt, 
            o.order_status AS orderStatus, 
            o.final_amount AS finalAmount,
            (SELECT p.method FROM payments p WHERE p.order_id = o.id ORDER BY p.id DESC LIMIT 1) AS paymentMethod,
            (SELECT p.status FROM payments p WHERE p.order_id = o.id ORDER BY p.id DESC LIMIT 1) AS paymentStatus,
            CONCAT_WS(', ', o.shipping_address, o.shipping_ward, o.shipping_district, o.shipping_city) AS fullShippingAddress,
            
            CAST((
                SELECT json_agg(
                    json_build_object(
                        'productName', oi.product_name,
                        'thumbnail', oi.thumbnail,
                        'variantInfo', CONCAT_WS(' ', oi.option1_value, oi.option2_value, oi.option3_value),
                        'quantity', oi.quantity,
                        'price', oi.price,
                        'isReviewed', EXISTS (SELECT 1 FROM reviews r WHERE r.order_item_id = oi.id)
                    )
                ) FROM order_items oi WHERE oi.order_id = o.id
            ) AS TEXT) AS itemsJson
            
        FROM orders o
        WHERE o.user_id = :userId
          -- 1. LỌC THEO TRẠNG THÁI (Nếu truyền null thì bỏ qua, lấy tất cả)
          AND (:status IS NULL OR CAST(o.order_status AS TEXT) = :status)
          -- 2. TÌM KIẾM (Theo mã đơn hàng HOẶC tên sản phẩm nằm bên trong)
          AND (:keyword IS NULL OR :keyword = '' 
               OR o.code ILIKE CONCAT('%', :keyword, '%') 
               OR EXISTS (
                   SELECT 1 FROM order_items oi2 
                   WHERE oi2.order_id = o.id AND oi2.product_name ILIKE CONCAT('%', :keyword, '%')
               ))
        ORDER BY o.created_at DESC
        """,
            countQuery = """
        SELECT count(o.id) 
        FROM orders o
        WHERE o.user_id = :userId
          AND (:status IS NULL OR CAST(o.order_status AS TEXT) = :status)
          AND (:keyword IS NULL OR :keyword = '' 
               OR o.code ILIKE CONCAT('%', :keyword, '%') 
               OR EXISTS (
                   SELECT 1 FROM order_items oi2 
                   WHERE oi2.order_id = o.id AND oi2.product_name ILIKE CONCAT('%', :keyword, '%')
               ))
        """,
            nativeQuery = true)
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


    // Tra cứu bảo hành
    @Query(value = """
            SELECT 
                o.code AS orderCode, 
                o.customer_name AS customerName,
                o.customer_phone AS phone, 
                oi.product_name AS productName, 
                oi.thumbnail AS thumbnail, 
                ps.serial_number AS imei,
                p.warranty_period AS warrantyPeriodText,
                o.updated_at AS purchaseDate
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
            """, nativeQuery = true)
    List<WarrantyProjection> searchWarranty(@Param("keyword") String keyword);
}