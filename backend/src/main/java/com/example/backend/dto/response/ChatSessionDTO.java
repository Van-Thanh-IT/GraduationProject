package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ChatSessionDTO {
    private UUID id;
    private String title;
    private String contextType;
    private LocalDateTime updatedAt;
}