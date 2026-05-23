package com.example.backend.dto.response;

import java.time.LocalDateTime;

import com.example.backend.enums.ArticleStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ArticleResponse {
    private Integer id;
    private String title;
    private String slug;
    private String thumbnailUrl;
    private String shortDescription;
    private String content;
    private String authorName;
    private Integer viewCount;
    private ArticleStatus status;
    private LocalDateTime createdAt;
}
