package com.example.backend.service;

import com.example.backend.dto.request.ChatMessageRequest;
import com.example.backend.entity.ChatMessage;
import com.example.backend.entity.Conversation;
import com.example.backend.enums.ChatStatus;
import com.example.backend.enums.SenderRole;
import com.example.backend.repository.ChatMessageRepository;
import com.example.backend.repository.ConversationRepository;
import com.example.backend.utils.Cloudinaryutil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final Cloudinaryutil cloudinaryutil;

    // 1. TÌM HOẶC TẠO MỚI PHÒNG CHAT
    @Transactional
    public Conversation getOrCreateConversation(Integer userId, String guestId, String customerName) {
        if (userId != null) {
            return conversationRepository.findByUserId(userId)
                    .orElseGet(() -> createNewConversation(userId, null, customerName));
        } else if (guestId != null) {
            return conversationRepository.findByGuestId(guestId)
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

    // 2. LƯU TIN NHẮN (Gọi từ WebSocket)
    @Transactional
    public ChatMessage saveMessage(ChatMessageRequest request) {
        Conversation conversation = conversationRepository.findById(request.getConversationId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy phòng chat"));

        ChatMessage message = ChatMessage.builder()
                .conversation(conversation)
                .senderRole(request.getSenderRole())
                .senderIdentifier(request.getSenderIdentifier())
                .content(request.getContent())
                .imageUrls(request.getImageUrls())
                .isRead(false)
                .build();

        // Tạo text hiển thị ngắn gọn cho Sidebar
        String lastMsgText = request.getContent();
        if (lastMsgText == null || lastMsgText.isEmpty()) {
            lastMsgText = "Đã gửi " + (request.getImageUrls() != null ? request.getImageUrls().size() : 0) + " hình ảnh";
        } else if (lastMsgText.length() > 30) {
            lastMsgText = lastMsgText.substring(0, 30) + "...";
        }

        // Cập nhật phòng chat
        conversation.setLastMessage(lastMsgText);
        // Nếu Admin gửi tin, tự động chuyển trạng thái thành ASSIGNED nếu đang WAITING
        if ((request.getSenderRole() == SenderRole.ADMIN || request.getSenderRole() == SenderRole.STAFF)
                && conversation.getStatus() == ChatStatus.WAITING) {
            conversation.setStatus(ChatStatus.ASSIGNED);
            conversation.setAgentId(Integer.parseInt(request.getSenderIdentifier())); // Gán cho người vừa trả lời
        }

        conversationRepository.save(conversation);
        return chatMessageRepository.save(message);
    }

    // 3. LẤY LỊCH SỬ TIN NHẮN (Khi khách vừa mở khung chat lên)
    public List<ChatMessage> getChatHistory(Integer conversationId) {
        return chatMessageRepository.findByConversationIdOrderByCreatedAtAsc(conversationId);
    }

    // Thêm hàm này vào ChatService
    public List<Conversation> getAllConversationsForAdmin() {
        return conversationRepository.findAllByOrderByUpdatedAtDesc();
    }

    // ==========================================
    // XỬ LÝ UPLOAD ẢNH CHO CHAT
    // ==========================================
    public List<String> uploadChatImages(List<MultipartFile> files) {
        List<String> imageUrls = new ArrayList<>();

        if (files == null || files.isEmpty()) {
            return imageUrls; // Trả về mảng rỗng nếu không có file
        }

        for (MultipartFile file : files) {
            // Bỏ qua nếu file bị lỗi hoặc rỗng
            if (file.isEmpty()) continue;

            try {
                // Gọi hàm saveFile từ file Utils của bạn
                String url = cloudinaryutil.saveFile(file);
                if (url != null) {
                    imageUrls.add(url);
                }
            } catch (Exception e) {
                // Log lỗi nhưng KHÔNG throw Exception để không làm chết cả mảng ảnh
                System.err.println("❌ Lỗi upload 1 ảnh trong chat: " + e.getMessage());
            }
        }

        return imageUrls; // Trả về mảng các link URL đã lên mây thành công
    }
}