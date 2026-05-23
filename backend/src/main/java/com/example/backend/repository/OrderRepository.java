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

    // dashboard
    @Query(
            "SELECT COALESCE(SUM(o.finalAmount), 0) FROM Order o WHERE o.orderStatus = 'COMPLETED' AND o.createdAt BETWEEN :startDate AND :endDate")
    BigDecimal sumRevenueBetweenDates(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    long countByOrderStatus(OrderStatus orderStatus);

    @Query("SELECT DATE(o.createdAt) as date, SUM(o.finalAmount) as revenue "
            + "FROM Order o WHERE o.orderStatus = 'COMPLETED' AND o.createdAt >= :startDate "
            + "GROUP BY DATE(o.createdAt) ORDER BY DATE(o.createdAt) ASC")
    List<Object[]> getRevenueChartData(@Param("startDate") LocalDateTime startDate);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    // CLIENT
    @Query(
            value =
                    """
		SELECT
			v.id,
			v.code,
			v."createdAt",
			v."orderStatus",
			v."finalAmount",
			v."paymentMethod",
			v."paymentStatus",
			v."fullShippingAddress",
			v."itemsJson"
		FROM view_user_orders v
		WHERE v.user_id = :userId
		AND (:status IS NULL OR v."orderStatus" = :status)
		AND (:keyword IS NULL OR :keyword = ''
			OR v.code ILIKE CONCAT('%', :keyword, '%')
			OR v."searchNames" ILIKE CONCAT('%', :keyword, '%')
		)
		ORDER BY v."createdAt" DESC
		""",
            countQuery =
                    """
		SELECT count(v.id)
		FROM view_user_orders v
		WHERE v.user_id = :userId
		AND (:status IS NULL OR v."orderStatus" = :status)
		AND (:keyword IS NULL OR :keyword = ''
			OR v.code ILIKE CONCAT('%', :keyword, '%')
			OR v."searchNames" ILIKE CONCAT('%', :keyword, '%')
		)
		""",
            nativeQuery = true)
    Page<UserOrderProjection> findUserOrdersWithFilters(
            @Param("userId") Integer userId,
            @Param("status") String status,
            @Param("keyword") String keyword,
            Pageable pageable);

    @Query(
            value =
                    """
		SELECT CAST(order_status AS TEXT) AS status, COUNT(id) AS count
		FROM orders
		WHERE user_id = :userId
		GROUP BY order_status
		""",
            nativeQuery = true)
    List<OrderStatusCountProjection> countOrdersByStatusForUser(@Param("userId") Integer userId);

    @Query(
            value =
                    """
		SELECT * FROM view_warranty_info v
		WHERE v.status = 'COMPLETED'
		AND (
			v.phone = :keyword
			OR v."orderCode" = :keyword
			OR v.imei = :keyword
		)
		ORDER BY v."purchaseDate" DESC
		""",
            nativeQuery = true)
    List<WarrantyProjection> searchWarranty(@Param("keyword") String keyword);
}
