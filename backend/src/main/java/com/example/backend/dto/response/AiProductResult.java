package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiProductResult {
    private String contextText; // Text mớm cho AI
    private Object productData; // Data thực tế để bắn về React (Projection)
}