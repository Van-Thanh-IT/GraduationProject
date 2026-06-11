package com.example.backend.dto.response.client;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class AiProductResult {

    private String contextText;

    private Object productData;
}
