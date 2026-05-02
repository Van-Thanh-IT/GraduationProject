package com.example.backend.repository;

import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChatMessageAIRepository extends JpaRepository<ChatMessageAI, Long> {
    // Lấy 5 tin nhắn gần nhất để làm bộ nhớ (Memory) cho AI
    List<ChatMessageAI> findTop2BySessionOrderByCreatedAtDesc(ChatSessionAI session);

    // Dành cho Frontend: Lấy toàn bộ tin nhắn của 1 phiên, xếp TỪ CŨ ĐẾN MỚI (ASC) để hiển thị từ trên xuống dưới
    List<ChatMessageAI> findBySessionIdOrderByCreatedAtAsc(UUID sessionId);

}
