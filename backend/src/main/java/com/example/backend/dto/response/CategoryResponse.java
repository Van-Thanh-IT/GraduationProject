package com.example.backend.dto.response;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.example.backend.enums.CategoryStatus;

import lombok.Data;

@Data
public class CategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private String description;
    private String imageUrl;
    private Integer parentId;
    private CategoryStatus status;
    private LocalDateTime createdAt;

    private List<CategoryResponse> children = new ArrayList<>();
}
