package com.example.backend.dto.response.client;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AIChatResponse {

    private Long id;

    private UUID sessionId;

    private String role;

    private String content;

    private Object attachment;

    private List<ActionItem> actions;

    private LocalDateTime createdAt;
}
