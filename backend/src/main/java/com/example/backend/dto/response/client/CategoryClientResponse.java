package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
@Builder
public class CategoryClientResponse {
    private Integer id;
    private String name;
    private String slug;
    private String imageUrl;

    @Builder.Default
    private List<CategoryClientResponse> children = new ArrayList<>();
}
