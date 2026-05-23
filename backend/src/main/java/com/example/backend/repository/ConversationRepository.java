package com.example.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Conversation;
import com.example.backend.enums.ChatStatus;

@Repository
public interface ConversationRepository extends JpaRepository<Conversation, Integer> {
    Optional<Conversation> findByUserId(Integer userId);

    Optional<Conversation> findByGuestId(String guestId);

    // Lấy danh sách chat đang chờ (Tab 1)
    List<Conversation> findByStatusOrderByUpdatedAtDesc(ChatStatus status);

    // Lấy danh sách chat của riêng 1 nhân viên (Tab 2)
    List<Conversation> findByAgentIdOrderByUpdatedAtDesc(Integer agentId);

    // Tìm và sắp xếp phòng chat theo thời gian cập nhật giảm dần (Mới nhất lên đầu)
    List<Conversation> findAllByOrderByUpdatedAtDesc();
}
