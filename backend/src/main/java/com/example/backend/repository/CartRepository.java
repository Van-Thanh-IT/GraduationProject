package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.Cart;

public interface CartRepository extends JpaRepository<Cart, Integer> {
    Optional<Cart> findByUserId(Integer userId);

    Optional<Cart> findBySessionId(String sessionId);
}
