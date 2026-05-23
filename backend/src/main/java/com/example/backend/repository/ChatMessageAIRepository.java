package com.example.backend.repository;

import java.util.List;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;

public interface ChatMessageAIRepository extends JpaRepository<ChatMessageAI, Long> {
    List<ChatMessageAI> findTop6BySessionOrderByCreatedAtDesc(ChatSessionAI session);

    List<ChatMessageAI> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);
}
