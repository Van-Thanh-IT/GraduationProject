package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ActionItem {
    private String label;
    private String url;
    private String type; // Thường là "LINK" hoặc "BUTTON"
}