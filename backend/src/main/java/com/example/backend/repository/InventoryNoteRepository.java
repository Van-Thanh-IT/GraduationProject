package com.example.backend.repository;

import com.example.backend.entity.InventoryNote;
import org.springframework.data.jpa.repository.JpaRepository;

public interface InventoryNoteRepository extends JpaRepository<InventoryNote, Integer> {
}