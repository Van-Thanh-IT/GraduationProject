package com.example.backend.dto.response.client;

import java.time.LocalDateTime;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ReviewClientResponse {
    private Integer id;
    private String customerName;
    private String customerAvatar; // (Tùy chọn) Ảnh đại diện của khách
    private Integer rating; // Số sao (1-5)
    private String comment; // Nội dung đánh giá
    private LocalDateTime createdAt;
}
