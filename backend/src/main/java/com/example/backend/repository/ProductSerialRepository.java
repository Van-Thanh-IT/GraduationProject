package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.ProductSerial;

public interface ProductSerialRepository extends JpaRepository<ProductSerial, Integer> {

    Optional<ProductSerial> findBySerialNumber(String serialNumber);

    List<ProductSerial> findBySerialNumberIn(List<String> serialNumbers);

    List<ProductSerial> findByOrderIdAndProductVariantId(Integer orderId, Integer productVariantId);

    @Query(
            "SELECT ps.serialNumber FROM ProductSerial ps WHERE ps.inventoryNoteId = :noteId AND ps.productVariantId = :variantId")
    List<String> findSerialNumbers(@Param("noteId") Integer noteId, @Param("variantId") Integer variantId);

    List<ProductSerial> findByInventoryNoteIdAndProductVariantId(Integer noteId, Integer variantId);
}
