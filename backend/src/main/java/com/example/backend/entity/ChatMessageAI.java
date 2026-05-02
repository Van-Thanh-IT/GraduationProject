package com.example.backend.entity;

import com.example.backend.enums.RoleAI;
import jakarta.persistence.*; // Dùng đúng gói của JPA
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;

@Entity
@Table(name = "chat_messages_ai")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageAI {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    private ChatSessionAI session;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RoleAI role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;


    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "metadata", columnDefinition = "jsonb")
    private Map<String, Object> metadata;

    @Column(name = "tokens_used")
    private Integer tokensUsed;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}