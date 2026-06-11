package com.example.backend.dto.request;

import java.util.List;

import com.example.backend.enums.SenderRole;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChatMessageRequest {

    private Integer conversationId;

    private SenderRole senderRole;

    private String senderIdentifier;

    private String content;

    private List<String> imageUrls;
}
