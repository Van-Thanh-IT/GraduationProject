package com.example.backend.repository;

import java.util.Optional;

import com.example.backend.enums.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.OtpCode;
import com.example.backend.entity.User;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Integer> {
    void deleteByUser(User user);
    // Tìm mã OTP mới nhất theo User, Type và trạng thái Chưa sử dụng
    Optional<OtpCode> findFirstByUserAndTypeAndUsedFalseOrderByCreatedAtDesc(User user, OtpType type);

    void deleteByUserAndType(User user, OtpType type);

    Optional<OtpCode> findFirstByUserAndUsedFalseOrderByCreatedAtDesc(User user);
}
