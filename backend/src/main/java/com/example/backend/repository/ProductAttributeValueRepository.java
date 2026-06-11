package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.ProductAttributeValue;

public interface ProductAttributeValueRepository extends JpaRepository<ProductAttributeValue, Integer> {

    List<ProductAttributeValue> findByProductId(Integer productId);

    boolean existsByProductIdAndAttributeId(Integer productId, Integer attributeId);

    boolean existsByProductIdAndAttributeIdAndIdNot(Integer productId, Integer attributeId, Integer id);

    long countByProductId(Integer productId);

    // CLIENT
    @Query("SELECT pav FROM ProductAttributeValue pav " + "JOIN FETCH pav.attribute "
            + "WHERE pav.product.id = :productId")
    List<ProductAttributeValue> findSpecsByProductId(@Param("productId") Integer productId);
}
