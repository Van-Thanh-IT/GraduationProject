package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.Category;

public interface CategoryRepository extends JpaRepository<Category, Integer> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Integer id);

    boolean existsBySlug(String slug);

    @Query("SELECT c FROM Category c WHERE c.status = 'ACTIVE'")
    List<Category> findAllActiveCategories();
}
