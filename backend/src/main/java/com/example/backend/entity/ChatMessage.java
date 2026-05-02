package com.example.backend.entity;

import com.example.backend.enums.SenderRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "chat_messages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    // --- AI LÀ NGƯỜI GỬI TIN NÀY? ---
    @Enumerated(EnumType.STRING)
    @Column(name = "sender_role", nullable = false, length = 20)
    private SenderRole senderRole; // (ADMIN, STAFF, USER, GUEST)

    // ID của người gửi (Ép về kiểu String để chứa được cả Integer UserID lẫn UUID GuestID)
    @Column(name = "sender_identifier", nullable = false, length = 100)
    private String senderIdentifier;

    // --- NỘI DUNG TIN NHẮN (ZALO STYLE) ---
    // 1. Chữ viết (Có thể null nếu khách chỉ gửi ảnh)
    @Column(columnDefinition = "TEXT")
    private String content;

    // 2. Danh sách 4-5 ảnh đính kèm (Lưu trữ dạng mảng JSON -> Không cần thêm bảng mới)
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "image_urls", columnDefinition = "json")
    private List<String> imageUrls;

    // Trạng thái đã xem
    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean isRead = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}