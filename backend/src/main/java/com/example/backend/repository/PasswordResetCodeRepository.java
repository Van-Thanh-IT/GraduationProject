package com.example.backend.repository;

import com.example.backend.entity.PasswordResetCode;
import com.example.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface PasswordResetCodeRepository extends JpaRepository<PasswordResetCode, Integer> {
    void deleteByUser(User user);

    Optional<PasswordResetCode> findFirstByUserAndUsedFalseOrderByCreatedAtDesc(User user);
}