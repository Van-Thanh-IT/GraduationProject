package com.example.backend.repository;

import com.example.backend.entity.FlashSale;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface FlashSaleRepository extends JpaRepository<FlashSale, Integer> {

    // 1. Kiểm tra xem Biến thể này có đang nằm trong chương trình FlashSale nào bị TRÙNG THỜI GIAN không?
    @Query("SELECT COUNT(f) > 0 FROM FlashSale f WHERE f.productVariant.id = :variantId " +
            "AND f.status = 1 " +
            "AND f.id != :excludeId " + // Dùng khi Update (loại trừ chính nó)
            "AND ((f.startTime <= :endTime AND f.endTime >= :startTime))")
    boolean existsOverlappingFlashSale(
            @Param("variantId") Integer variantId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Integer excludeId);

    // 3. CHIÊU THỨC CHỐNG BÁN LỐ (Race Condition) KHI THANH TOÁN
    // Update trực tiếp dưới DB: Chỉ cộng thêm sold_quantity NẾU tổng số lượng mua chưa vượt quá kho sale.
    @Modifying
    @Query("UPDATE FlashSale f SET f.soldQuantity = f.soldQuantity + :quantity " +
            "WHERE f.id = :id AND (f.soldQuantity + :quantity) <= f.saleStockQuantity")
    int incrementSoldQuantitySafely(@Param("id") Integer id, @Param("quantity") Integer quantity);

    @Query("SELECT fs FROM FlashSale fs WHERE fs.productVariant.id IN :variantIds AND fs.status = 1 AND fs.startTime <= :now AND fs.endTime >= :now")
    List<FlashSale> findActiveByVariantIds(@Param("variantIds") List<Integer> variantIds, @Param("now") LocalDateTime now);
}