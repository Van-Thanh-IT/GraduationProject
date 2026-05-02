package com.example.backend.entity;

import com.example.backend.enums.ChatStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Conversation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // --- 1. THÔNG TIN KHÁCH HÀNG ---
    @Column(name = "customer_name", length = 100, nullable = false)
    private String customerName; // Tên hiển thị (Tên User hoặc "Khách #123")

    @Column(name = "user_id")
    private Integer userId; // Có giá trị nếu là USER (Khách đã có TK)

    @Column(name = "guest_id", length = 100)
    private String guestId; // Có giá trị nếu là GUEST (Mã UUID sinh từ Frontend)

    // --- 2. THÔNG TIN NGƯỜI HỖ TRỢ ---
    @Column(name = "agent_id")
    private Integer agentId; // ID của STAFF hoặc ADMIN đang nhận chat này (Null nếu WAITING)

    // --- 3. TRẠNG THÁI & HIỂN THỊ ---
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ChatStatus status = ChatStatus.WAITING;

    @Column(name = "last_message", length = 500)
    private String lastMessage; // Lưu text ngắn gọn để hiển thị ngoài danh sách

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}