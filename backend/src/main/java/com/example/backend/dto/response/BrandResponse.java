package com.example.backend.dto.response;

import java.time.LocalDateTime;

import com.example.backend.enums.BrandStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BrandResponse {
    private Integer id;
    private String name;
    private String slug;
    private String logoUrl;
    private String description;
    private BrandStatus status;
    private LocalDateTime createdAt;
}
