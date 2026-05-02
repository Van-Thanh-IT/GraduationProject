package com.example.backend.service;

import com.example.backend.dto.response.AIChatResponse;
import com.example.backend.dto.response.ActionItem;
import com.example.backend.dto.response.ChatSessionDTO;
import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;
import com.example.backend.repository.ChatMessageAIRepository;
import com.example.backend.repository.ChatSessionAIRepository;
import com.example.backend.utils.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatSessionAIRepository sessionRepository;
    private final ChatMessageAIRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    // ====================================================
    // 1. LẤY DANH SÁCH CÁC PHIÊN CHAT (HIỂN THỊ CỘT TRÁI)
    // ====================================================
    public List<ChatSessionDTO> getUserSessions(String guestSessionKey) {
        Integer userId = null;
        System.out.println("Nhận đc:" + guestSessionKey);
        try {
            userId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {}

        List<ChatSessionAI> sessions;
        if (userId != null) {
            sessions = sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        } else if (guestSessionKey != null && !guestSessionKey.isBlank()) {
            sessions = sessionRepository.findBySessionKeyOrderByUpdatedAtDesc(guestSessionKey);
        } else {
            return List.of(); // Trả về rỗng nếu chưa login và cũng không có sessionKey
        }

        return sessions.stream().map(s -> ChatSessionDTO.builder()
                .id(s.getId())
                .title(s.getTitle())
                .contextType(s.getContextType())
                .updatedAt(s.getUpdatedAt())
                .build()).collect(Collectors.toList());
    }

    // ====================================================
    // 2. LẤY NỘI DUNG TIN NHẮN TRONG 1 PHIÊN (HIỂN THỊ CỘT PHẢI)
    // ====================================================
    public List<AIChatResponse> getMessagesBySession(UUID sessionId) {

        List<ChatMessageAI> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        return messages.stream().map(m -> {
            Object attachment = null;
            List<ActionItem> actions = null;

            // Bóc tách metadata từ DB ra lại thành attachment và actions
            if (m.getMetadata() != null) {
                if (m.getMetadata().containsKey("attachment")) {
                    attachment = m.getMetadata().get("attachment");
                }
                if (m.getMetadata().containsKey("actions")) {
                    try {
                        // Ép kiểu an toàn từ Map của Postgres sang List<ActionItem>
                        actions = objectMapper.convertValue(
                                m.getMetadata().get("actions"),
                                new TypeReference<List<ActionItem>>() {}
                        );
                    } catch (Exception e) {
                        log.error("Lỗi parse actions từ metadata cho message {}: ", m.getId(), e);
                    }
                }
            }

            return AIChatResponse.builder()
                    .id(m.getId()) // ID tin nhắn
                    .sessionId(m.getSession().getId())
                    .role(m.getRole().name())
                    .content(m.getContent())
                    .attachment(attachment) // Trả lại y nguyên lúc chat
                    .actions(actions)       // Trả lại y nguyên lúc chat
                    .createdAt(m.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
    }

    // ====================================================
    // 3. TỰ ĐỘNG DỌN DẸP DỮ LIỆU CŨ (CRON JOB)
    // ====================================================
    @Scheduled(cron = "0 0 2 * * ?") // 2 giờ sáng mỗi ngày
    public void cleanupOldChatData() {
        log.info("Bắt đầu dọn dẹp dữ liệu Chat AI cũ...");
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);

        int deletedCount = sessionRepository.deleteOldSessions(cutoffDate);

        log.info("Đã dọn dẹp hoàn tất. Số lượng phiên chat bị xóa: {}", deletedCount);
    }
}