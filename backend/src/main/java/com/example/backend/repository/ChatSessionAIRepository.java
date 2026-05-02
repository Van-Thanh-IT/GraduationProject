package com.example.backend.repository;

import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ChatSessionAIRepository extends JpaRepository<ChatSessionAI, UUID> {

    // Lấy danh sách phiên chat của User (đã đăng nhập)
    List<ChatSessionAI> findByUserIdOrderByUpdatedAtDesc(Integer userId);

    // Lấy danh sách phiên chat của Guest (chưa đăng nhập) qua sessionKey (localStorage)
    List<ChatSessionAI> findBySessionKeyOrderByUpdatedAtDesc(String sessionKey);

    // Xóa các session cũ hơn X ngày
    @Modifying
    @Transactional
    @Query("DELETE FROM ChatSessionAI c WHERE c.updatedAt < :cutoffDate")
    int deleteOldSessions(@Param("cutoffDate") LocalDateTime cutoffDate);
}
