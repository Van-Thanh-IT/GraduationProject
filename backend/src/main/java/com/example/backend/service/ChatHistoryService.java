package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.dto.response.ChatSessionDTO;
import com.example.backend.dto.response.client.AIChatResponse;
import com.example.backend.dto.response.client.ActionItem;
import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;
import com.example.backend.repository.ChatMessageAIRepository;
import com.example.backend.repository.ChatSessionAIRepository;
import com.example.backend.utils.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatHistoryService {

    private final ChatSessionAIRepository sessionRepository;
    private final ChatMessageAIRepository messageRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();


    // LẤY DANH SÁCH CÁC PHIÊN CHAT (HIỂN THỊ CỘT TRÁI)
    public List<ChatSessionDTO> getUserSessions(String guestSessionKey) {
        Integer userId = null;
        try {
            userId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {
        }

        List<ChatSessionAI> sessions;
        if (userId != null) {
            sessions = sessionRepository.findByUserIdOrderByUpdatedAtDesc(userId);
        } else if (guestSessionKey != null && !guestSessionKey.isBlank()) {
            sessions = sessionRepository.findBySessionKeyOrderByUpdatedAtDesc(guestSessionKey);
        } else {
            return List.of();
        }

        return sessions.stream()
                .map(s -> ChatSessionDTO.builder()
                        .id(s.getId())
                        .title(s.getTitle())
                        .contextType(s.getContextType())
                        .updatedAt(s.getUpdatedAt())
                        .build())
                .toList();
    }


    // LẤY NỘI DUNG TIN NHẮN TRONG 1 PHIÊN (HIỂN THỊ CỘT PHẢI)
    public List<AIChatResponse> getMessagesBySession(UUID sessionId) {

        List<ChatMessageAI> messages = messageRepository.findBySessionIdOrderByCreatedAtAsc(sessionId);

        return messages.stream()
                .map(m -> {
                    Object attachment = null;
                    List<ActionItem> actions = null;

                    if (m.getMetadata() != null) {
                        if (m.getMetadata().containsKey("attachment")) {
                            attachment = m.getMetadata().get("attachment");
                        }
                        if (m.getMetadata().containsKey("actions")) {
                            try {
                                actions = objectMapper.convertValue(
                                        m.getMetadata().get("actions"), new TypeReference<List<ActionItem>>() {});
                            } catch (Exception e) {
                                log.error("Lỗi parse actions từ metadata cho message {}: ", m.getId(), e);
                            }
                        }
                    }

                    return AIChatResponse.builder()
                            .id(m.getId())
                            .sessionId(m.getSession().getId())
                            .role(m.getRole().name())
                            .content(m.getContent())
                            .attachment(attachment)
                            .actions(actions)
                            .createdAt(m.getCreatedAt())
                            .build();
                })
               .toList();
    }

    @Scheduled(cron = "0 0 2 * * ?")
    public void cleanupOldChatData() {
        log.info("Bắt đầu dọn dẹp dữ liệu Chat AI cũ...");
        LocalDateTime cutoffDate = LocalDateTime.now().minusDays(30);

        int deletedCount = sessionRepository.deleteOldSessions(cutoffDate);

        log.info("Đã dọn dẹp hoàn tất. Số lượng phiên chat bị xóa: {}", deletedCount);
    }
}
