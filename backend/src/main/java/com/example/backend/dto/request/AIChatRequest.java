package com.example.backend.dto.request;

import java.util.UUID;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AIChatRequest {
    private UUID sessionId;

    private String message;

    private String contextType;

    private Integer contextId;
}
