package com.example.backend.repository;

import com.example.backend.entity.ProductVariant;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductVariantRepository extends JpaRepository<ProductVariant, Integer> {
    boolean existsBySku(String sku);

    List<ProductVariant> findByProductId(Integer productId);

    boolean existsByProductIdAndOption1ValueAndOption2ValueAndOption3Value(
            Integer productId,
            String option1Value,
            String option2Value,
            String option3Value
    );

    boolean existsByProductIdAndIsDefaultTrue(Integer productId);


    boolean existsByProductIdAndIdNotAndOption1ValueAndOption2ValueAndOption3Value(
            Integer productId, Integer variantId, String opt1, String opt2, String opt3);


    long countByProductId(Integer productId);

    //simple
    @Query("SELECT pv FROM ProductVariant pv " +
            "WHERE pv.deletedAt IS NULL " +
            "AND (:keyword IS NULL OR :keyword = '' " +
            "OR LOWER(pv.sku) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "OR LOWER(pv.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')))")
    List<ProductVariant> searchSimpleVariants(@Param("keyword") String keyword, Pageable pageable);


    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.id = :id")
    Optional<ProductVariant> findByIdWithLock(Integer id);




    //dashboard
    // Tìm các mặt hàng sắp hết (Tồn kho < 5)
    @Query("SELECT pv FROM ProductVariant pv WHERE pv.stockQuantity < :threshold AND pv.deletedAt IS NULL")
    List<ProductVariant> findLowStockVariants(@Param("threshold") int threshold);

    //CLIENT
    // Lấy toàn bộ biến thể và kèm luôn ảnh của biến thể đó
    @Query("SELECT DISTINCT v FROM ProductVariant v " +
            "LEFT JOIN FETCH v.images " +
            "WHERE v.product.id = :productId AND v.deletedAt IS NULL " +
            "ORDER BY v.price ASC")
    List<ProductVariant> findVariantsWithImagesByProductId(@Param("productId") Integer productId);

    // Đảm bảo không bao giờ kho bị âm.
    @Modifying
    @Query("UPDATE ProductVariant v SET v.stockQuantity = v.stockQuantity - :quantity " +
            "WHERE v.id = :variantId AND v.stockQuantity >= :quantity")
    int decrementStockSafely(@Param("variantId") Integer variantId, @Param("quantity") Integer quantity);
}