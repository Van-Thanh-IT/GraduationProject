package com.example.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Date;

@Entity
@Table(name = "token_blacklist")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InvalidatedToken {

    /**
     * Đây chính là mã JWT ID (jti) sinh ra lúc tạo Token.
     * Chúng ta dùng nó làm Khóa chính (Primary Key) luôn để lệnh
     * invalidateTokenRepository.existsById() chạy với tốc độ bàn thờ (Index Scan).
     */
    @Id
    @Column(name = "id", nullable = false, length = 50)
    String id;

    /**
     * Thời gian Token này thực sự hết hạn.
     * RẤT QUAN TRỌNG: Dùng để làm chức năng dọn rác (Cron Job).
     */
    @Column(name = "expiry_time", nullable = false)
    Date expiryTime;
}