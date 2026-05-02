package com.example.backend.controller.management;

import com.example.backend.dto.request.ArticleRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.ArticleResponse;
import com.example.backend.service.ArticleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/management/articles")
@RequiredArgsConstructor
public class ArticleManagementController {
    private final ArticleService articleService;

    @GetMapping
    public APIResponse<Page<ArticleResponse>> getAllArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {

        // Sắp xếp bài mới nhất lên đầu bảng
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        return APIResponse.success(articleService.getAllArticlesForAdmin(pageable));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<ArticleResponse> create(@ModelAttribute @Valid ArticleRequest request) {
        return APIResponse.success(articleService.createArticle(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<ArticleResponse> update(@PathVariable Integer id, @ModelAttribute @Valid ArticleRequest request) {
        return APIResponse.success(articleService.updateArticle(id, request));
    }

    @DeleteMapping("/{id}")
    public APIResponse<String> delete(@PathVariable Integer id) {
        articleService.deleteArticle(id);
        return APIResponse.success("Xóa bài viết thành công");
    }
}