package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import jakarta.persistence.LockModeType;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.ProductVariant;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    boolean existsBySku(String sku);

    List<ProductVariant> findByProductId(Integer productId);

    boolean existsByProductIdAndIsDefaultTrue(Integer productId);

    boolean existsByProductIdAndIdNotAndOption1ValueAndOption2ValueAndOption3Value(
            Integer productId, Integer variantId, String opt1, String opt2, String opt3);

    long countByProductId(Integer productId);

    @Query("SELECT pv FROM ProductVariant pv " +
            "WHERE pv.deletedAt IS NULL " +
            "AND (:keyword IS NULL OR :keyword = '' " +
            "OR LOWER(pv.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(pv.product.name) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
            "ORDER BY " +
            "  CASE " +
            "    WHEN LOWER(pv.sku) = LOWER(:keyword) THEN 1 " +
            "    WHEN LOWER(pv.product.name) = LOWER(:keyword) THEN 2 " +
            "    WHEN LOWER(pv.sku) LIKE LOWER(CONCAT(:keyword, '%')) THEN 3 " +
            "    WHEN LOWER(pv.product.name) LIKE LOWER(CONCAT(:keyword, '%')) THEN 4 " +
            "    WHEN :keyword IS NULL OR :keyword = '' THEN 6 " +
            "    ELSE 5 " +
            "  END ASC, " +
            "  pv.id DESC")
    List<ProductVariant> searchSimpleVariants(@Param("keyword") String keyword, Pageable pageable);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.id = :id")
    Optional<ProductVariant> findByIdWithLock(Integer id);

    List<ProductVariant> findTop10ByStockQuantityLessThanAndDeletedAtIsNull(int threshold);

    @Query("SELECT DISTINCT v FROM ProductVariant v "
            + "LEFT JOIN FETCH v.images "
            + "WHERE v.product.id = :productId AND v.deletedAt IS NULL "
            + "ORDER BY v.price ASC")
    List<ProductVariant> findVariantsWithImagesByProductId(@Param("productId") Integer productId);

    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity - :quantity "
            + "WHERE v.id = :variantId AND v.stockQuantity >= :quantity")
    int decrementStockSafely(@Param("variantId") Integer variantId, @Param("quantity") Integer quantity);

    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity + :quantity" + " WHERE v.id = :variantId")
    int incrementStockSafely(@Param("variantId") Integer variantId, @Param("quantity") Integer quantity);

    @Modifying
    @Query(
            "UPDATE ProductVariant v SET v.isDefault = false WHERE v.product.id = :productId AND v.id != :excludeVariantId")
    void resetDefaultVariants(
            @Param("productId") Integer productId, @Param("excludeVariantId") Integer excludeVariantId);
}
