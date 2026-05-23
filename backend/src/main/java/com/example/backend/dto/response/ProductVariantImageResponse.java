package com.example.backend.dto.response;

import lombok.Data;

@Data
public class ProductVariantImageResponse {
    private Integer id;
    private String imageUrl;
    private Integer sortOrder;
    private Boolean isThumbnail;
}
