package com.example.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import org.hibernate.annotations.CreationTimestamp;

import lombok.*;

@Entity
@Table(name = "password_reset_codes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PasswordResetCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Column(nullable = false)
    @Builder.Default
    private Integer attempts = 0;

    @Column(nullable = false)
    @Builder.Default
    private Boolean used = false;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;
}
