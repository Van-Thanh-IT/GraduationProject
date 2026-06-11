package com.example.backend.dto.response.client;

import java.util.ArrayList;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CategoryResponse {
    private Integer id;
    private String name;
    private String slug;
    private String imageUrl;
   private  Integer parentId;
}
