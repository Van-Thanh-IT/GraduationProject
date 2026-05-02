package com.example.backend.repository;

import com.example.backend.entity.ProductVariantImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProductVariantImageRepository extends JpaRepository<ProductVariantImage, Integer> {
    List<ProductVariantImage> findByVariantId(Integer variantId);

    long countByVariantProductId(Integer productId);
}
