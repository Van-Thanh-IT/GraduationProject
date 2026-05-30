package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.Conversation;
import com.example.backend.enums.ChatStatus;
import com.example.backend.enums.SenderRole;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.utils.CloudinaryUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final CloudinaryUtil cloudinaryutil;

    @Transactional
    public Conversation getOrCreateConversation(Integer userId, String guestId, String customerName) {
        if (userId != null) {
            return conversationRepository
                    .findByUserId(userId)
                    .orElseGet(() -> createNewConversation(userId, null, customerName));
        } else if (guestId != null) {
            return conversationRepository
                    .findByGuestId(guestId)
                    .orElseGet(() -> createNewConversation(null, guestId, customerName));
        }
        throw new IllegalArgumentException("Phải có UserId hoặc GuestId");
    }

    private Conversation createNewConversation(Integer userId, String guestId, String customerName) {
        Conversation conversation = Conversation.builder()
                .userId(userId)
                .guestId(guestId)
                .customerName(customerName)
                .status(ChatStatus.WAITING)
                .build();
        return conversationRepository.save(conversation);
    }

    @Transactional
    public ChatMessage saveMessage(ChatMessageRequest request) {
        Conversation conversation = conversationRepository
                .findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat"));

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderRole(request.getSenderRole())
                .senderIdentifier(request.getSenderIdentifier())
                .content(request.getContent())
                .imageUrls(request.getImageUrls())
                .isRead(false)
                .build();

        String lastMsgText = request.getContent();
        if (lastMsgText == null || lastMsgText.isEmpty()) {
            lastMsgText = "Đã gửi "
                    + (request.getImageUrls() != null ? request.getImageUrls().size() : 0) + " hình ảnh";
        } else if (lastMsgText.length() > 30) {
            lastMsgText = lastMsgText.substring(0, 30) + "...";
        }

        conversation.setLastMessage(lastMsgText);
        if ((request.getSenderRole() == SenderRole.ADMIN || request.getSenderRole() == SenderRole.STAFF)
                && conversation.getStatus() == ChatStatus.WAITING) {
            conversation.setStatus(ChatStatus.ASSIGNED);
            conversation.setAgentId(Integer.parseInt(request.getSenderIdentifier())); // Gán cho người vừa trả lời
        }

        conversationRepository.save(conversation);
        return chatMessageRepository.save(message);
    }

    public List<ChatMessage> getChatHistory(Integer conversationId) {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    public List<Conversation> getAllConversationsForAdmin() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc();
    }

    public List<String> uploadChatImages(List<MultipartFile> files) {
        return cloudinaryutil.uploadMultipleFiles(files);
    }
}
