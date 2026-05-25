package com.example.backend.repository;

import com.example.backend.enums.NoteStatus;
import com.example.backend.enums.NoteType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.InventoryNote;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface InventoryNoteRepository extends JpaRepository<InventoryNote, Integer> {
    // Thêm vào InventoryNoteRepository
    @Query("SELECT DISTINCT n FROM InventoryNote n " +
            "WHERE (:keyword IS NULL OR :keyword = '' " +
            "  OR LOWER(n.code) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR LOWER(n.supplierName) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "  OR n.id IN (SELECT d.inventoryNote.id FROM InventoryNoteDetail d, ProductVariant pv " +
            "              WHERE d.productVariantId = pv.id " +
            "                AND (LOWER(pv.product.name) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
            "                 OR LOWER(pv.sku) LIKE LOWER(CONCAT('%', :keyword, '%')))) " +
            ") " +
            "AND (:type IS NULL OR n.type = :type) " +
            "AND (:status IS NULL OR n.status = :status)")
    Page<InventoryNote> searchNotes(
            @Param("keyword") String keyword,
            @Param("type") NoteType type,
            @Param("status") NoteStatus status,
            Pageable pageable);

}
