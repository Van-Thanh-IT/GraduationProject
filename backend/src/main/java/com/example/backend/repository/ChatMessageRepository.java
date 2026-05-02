package com.example.backend.repository;

import com.example.backend.entity.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    // Lấy toàn bộ tin nhắn của 1 phòng chat, sắp xếp cũ nhất lên trước (như Zalo)
    List<ChatMessage> findByConversationIdOrderByCreatedAtAsc(Integer conversationId);

}