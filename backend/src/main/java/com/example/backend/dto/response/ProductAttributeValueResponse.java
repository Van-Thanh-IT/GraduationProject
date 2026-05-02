package com.example.backend.dto.response;

import lombok.Data;

@Data
public class ProductAttributeValueResponse {
    private Integer id;
    private Integer productId;
    private Integer attributeId;
    private String attributeName;
    private String value;
}