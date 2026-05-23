package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.OrderItem;

public interface OrderItemRepository extends JpaRepository<OrderItem, Integer> {
    @Query("SELECT COALESCE(SUM(oi.quantity), 0) FROM OrderItem oi JOIN oi.order o WHERE o.orderStatus = 'COMPLETED'")
    Long sumTotalProductsSold();

    @Query("SELECT oi.productName, SUM(oi.quantity) as totalSold FROM OrderItem oi JOIN oi.order o "
            + "WHERE o.orderStatus = 'COMPLETED' "
            + "GROUP BY oi.productName ORDER BY totalSold DESC LIMIT 5")
    List<Object[]> findTop5BestSellingProducts();

    @Query("SELECT c.name, SUM(oi.totalPrice) as revenue "
            + "FROM OrderItem oi JOIN oi.productVariant pv JOIN pv.product p JOIN p.category c JOIN oi.order o "
            + "WHERE o.orderStatus = 'COMPLETED' "
            + "GROUP BY c.name ORDER BY revenue DESC")
    List<Object[]> getCategoryRevenueShare();

    // biến mất sau khi đánh giá
    @Query("SELECT oi FROM OrderItem oi " + "JOIN FETCH oi.order o "
            + "JOIN FETCH oi.productVariant pv "
            + "JOIN FETCH pv.product p "
            + "WHERE o.user.id = :userId "
            + "AND o.orderStatus = 'COMPLETED' "
            + "AND NOT EXISTS (SELECT r FROM Review r WHERE r.orderItem.id = oi.id)")
    List<OrderItem> findItemsAwaitingReview(@Param("userId") Integer userId);
}
