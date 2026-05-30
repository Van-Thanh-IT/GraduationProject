package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.InventoryHistory;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Integer> {
    List<InventoryHistory> findTop100ByProductVariantIdOrderByCreatedAtDesc(Integer productVariantId);
}
