package com.example.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.backend.entity.Brand;

public interface BrandRepository extends JpaRepository<Brand, Integer> {
    boolean existsByName(String name);

    boolean existsBySlug(String slug);

    @Query("SELECT b FROM Brand b WHERE b.status = 'ACTIVE'")
    List<Brand> findAllActiveBrands();
}
