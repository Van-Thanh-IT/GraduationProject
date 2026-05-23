package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.PasswordResetCode;
import com.example.backend.entity.User;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Integer> {
    void deleteByUser(User user);

    Optional<PasswordResetCode> findFirstByUserAndUsedFalseOrderByCreatedAtDesc(User user);
}
