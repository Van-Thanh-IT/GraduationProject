package com.example.backend.dto.response;

import java.time.LocalDateTime;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ChatSessionDTO {
    private UUID id;
    private String title;
    private String contextType;
    private LocalDateTime updatedAt;
}
