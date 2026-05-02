package com.example.backend.repository;

import com.example.backend.entity.InventoryHistory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryHistoryRepository extends JpaRepository<InventoryHistory, Integer> {
    // Tìm lịch sử của 1 sản phẩm cụ thể, sắp xếp từ mới nhất -> cũ nhất
    List<InventoryHistory> findByProductVariantIdOrderByCreatedAtDesc(Integer productVariantId);
}