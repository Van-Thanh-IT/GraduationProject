package com.example.backend.repository;

import com.example.backend.entity.Attribute;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    boolean existsByName(String name);

    boolean existsByCode(String code);
}