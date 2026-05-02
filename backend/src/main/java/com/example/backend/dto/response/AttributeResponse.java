package com.example.backend.dto.response;

import com.example.backend.enums.AttributeStatus;
import lombok.Data;

@Data
public class AttributeResponse {
    private Integer id;
    private String name;
    private String code;
    private AttributeStatus status;
    private String filterGroup;
}