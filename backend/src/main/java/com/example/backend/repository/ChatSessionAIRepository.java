package com.example.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import jakarta.transaction.Transactional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.backend.entity.ChatSessionAI;

public interface ChatSessionAIRepository extends JpaRepository<ChatSessionAI, UUID> {
    List<ChatSessionAI> findByUserIdOrderByUpdatedAtDesc(Integer userId);

    List<ChatSessionAI> findBySessionKeyOrderByUpdatedAtDesc(String sessionKey);

    @Modifying
    @Transactional
    @Query("DELETE FROM ChatSessionAI c WHERE c.updatedAt < :cutoffDate")
    int deleteOldSessions(@Param("cutoffDate") LocalDateTime cutoffDate);
}
