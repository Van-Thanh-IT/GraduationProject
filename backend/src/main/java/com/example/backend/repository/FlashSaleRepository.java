package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.FlashSale;

public interface FlashSaleRepository extends JpaRepository<FlashSale, Integer> {

    @Query("SELECT COUNT(f) > 0 FROM FlashSale f WHERE f.productVariant.id = :variantId "
            + "AND f.status = 1 "
            + "AND f.id != :excludeId "
            + "AND ((f.startTime <= :endTime AND f.endTime >= :startTime))")
    boolean existsOverlappingFlashSale(
            @Param("variantId") Integer variantId,
            @Param("startTime") LocalDateTime startTime,
            @Param("endTime") LocalDateTime endTime,
            @Param("excludeId") Integer excludeId);

    @Modifying
    @Query("UPDATE FlashSale f SET f.soldQuantity = f.soldQuantity + :quantity "
            + "WHERE f.id = :id AND (f.soldQuantity + :quantity) <= f.saleStockQuantity")
    int incrementSoldQuantitySafely(@Param("id") Integer id, @Param("quantity") Integer quantity);

    @Query(
            "SELECT fs FROM FlashSale fs WHERE fs.productVariant.id IN :variantIds AND fs.status = 1 AND fs.soldQuantity < fs.saleStockQuantity AND fs.startTime <= :now AND fs.endTime >= :now")
    List<FlashSale> findActiveByVariantIds(
            @Param("variantIds") List<Integer> variantIds, @Param("now") LocalDateTime now);

    @Query("SELECT f FROM FlashSale f WHERE f.productVariant.id = :variantId " +
            "AND f.startTime <= :orderTime AND f.endTime >= :orderTime")
    List<FlashSale> findFlashSalesByVariantAndDate(
            @Param("variantId") Integer variantId,
            @Param("orderTime") LocalDateTime orderTime);
}
