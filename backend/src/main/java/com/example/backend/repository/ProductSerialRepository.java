package com.example.backend.repository;

import com.example.backend.entity.ProductSerial;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductSerialRepository extends JpaRepository<ProductSerial, Integer> {
    boolean existsBySerialNumber(String serialNumber);
    Optional<ProductSerial> findBySerialNumber(String serialNumber);

    @Query("SELECT p.serialNumber FROM ProductSerial p WHERE p.inventoryNoteId = :noteId AND p.productVariantId = :variantId")
    List<String> findSerialNumbers(@Param("noteId") Integer noteId, @Param("variantId") Integer variantId);
}