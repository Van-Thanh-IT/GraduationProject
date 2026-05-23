package com.example.backend.dto.response.admin;

import java.time.LocalDateTime;

import com.example.backend.enums.ProductStatus;

import lombok.Data;

@Data
public class ProductResponse {
    private Integer id;
    private Integer brandId;
    private String brandName;
    private Integer categoryId;
    private String categoryName;

    private String name;
    private String slug;
    private String warrantyPeriod;
    private String description;
    private String thumbnail;

    private String option1Name;
    private String option2Name;
    private String option3Name;
    private ProductStatus status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
