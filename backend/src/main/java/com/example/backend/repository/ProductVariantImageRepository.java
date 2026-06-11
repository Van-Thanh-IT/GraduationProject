package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.ProductVariantImage;

public interface ProductVariantImageRepository extends JpaRepository<ProductVariantImage, Integer> {
    List<ProductVariantImage> findByVariantIdOrderBySortOrderAsc(Integer variantId);

    long countByVariantProductId(Integer productId);

    @Modifying
    @Query(
            "UPDATE ProductVariantImage p SET p.isThumbnail = false WHERE p.variant.id = :variantId AND p.isThumbnail = true")
    void resetThumbnailsByVariantId(Integer variantId);
}
