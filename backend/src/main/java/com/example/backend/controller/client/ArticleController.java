package com.example.backend.controller.client;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.ArticleResponse;
import com.example.backend.service.ArticleService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/articles")
@RequiredArgsConstructor
public class ArticleController {
    private final ArticleService articleService;

    @GetMapping
    public APIResponse<Page<ArticleResponse>> list(Pageable pageable) {
        return APIResponse.success(articleService.getPublishedArticles(pageable));
    }

    @GetMapping("/{slug}")
    public APIResponse<ArticleResponse> detail(@PathVariable String slug) {
        return APIResponse.success(articleService.getArticleBySlug(slug));
    }
}
