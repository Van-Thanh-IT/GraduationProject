package com.example.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Attribute;

public interface AttributeRepository extends JpaRepository<Attribute, Integer> {
    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Integer id);

    boolean existsByCode(String code);
}
