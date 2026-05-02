package com.example.backend.service;

import com.example.backend.dto.request.ArticleRequest;
import com.example.backend.dto.response.ArticleResponse;
import com.example.backend.entity.Article;
import com.example.backend.enums.ArticleStatus;
import com.example.backend.repository.ArticleRepository;
import com.example.backend.utils.Cloudinaryutil;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final Cloudinaryutil cloudinaryutil;

    // --- CLIENT ---
    public Page<ArticleResponse> getPublishedArticles(Pageable pageable) {
        return articleRepository.findAllByStatus(ArticleStatus.PUBLISHED, pageable)
                .map(this::mapToResponse);
    }

    @Transactional
    public ArticleResponse getArticleBySlug(String slug) {
        Article article = articleRepository.findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bài viết!"));

        articleRepository.incrementViewCount(article.getId()); // Tăng lượt xem
        return mapToResponse(article);
    }

    // --- ADMIN ---

    public Page<ArticleResponse> getAllArticlesForAdmin(Pageable pageable) {
        return articleRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Transactional
    public ArticleResponse createArticle(ArticleRequest request) {
        String slug = generateSlug(request.getTitle());
        if (articleRepository.existsBySlug(slug)) {
            slug += "-" + System.currentTimeMillis() / 1000;
        }

        Article article = Article.builder()
                .title(request.getTitle())
                .slug(slug)
                .content(request.getContent())
                .shortDescription(request.getShortDescription())
                .authorName(request.getAuthorName())
                .status(request.getStatus())
                .viewCount(0)
                .build();

        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            article.setThumbnailUrl(cloudinaryutil.saveFile(request.getThumbnail()));
        }

        return mapToResponse(articleRepository.save(article));
    }

    @Transactional
    public ArticleResponse updateArticle(Integer id, ArticleRequest request) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));

        article.setTitle(request.getTitle());
        article.setContent(request.getContent());
        article.setShortDescription(request.getShortDescription());
        article.setAuthorName(request.getAuthorName());
        article.setStatus(request.getStatus());

        if (request.getThumbnail() != null && !request.getThumbnail().isEmpty()) {
            if (article.getThumbnailUrl() != null) {
                cloudinaryutil.deleteFile(article.getThumbnailUrl());
            }
            article.setThumbnailUrl(cloudinaryutil.saveFile(request.getThumbnail()));
        }

        return mapToResponse(articleRepository.save(article));
    }

    @Transactional
    public void deleteArticle(Integer id) {
        Article article = articleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bài viết không tồn tại"));

        if (article.getThumbnailUrl() != null) {
            cloudinaryutil.deleteFile(article.getThumbnailUrl());
        }
        articleRepository.delete(article);
    }

    // --- HELPER ---
    private ArticleResponse mapToResponse(Article article) {
        return ArticleResponse.builder()
                .id(article.getId())
                .title(article.getTitle())
                .slug(article.getSlug())
                .thumbnailUrl(article.getThumbnailUrl())
                .shortDescription(article.getShortDescription())
                .content(article.getContent())
                .authorName(article.getAuthorName())
                .viewCount(article.getViewCount())
                .status(article.getStatus())
                .createdAt(article.getCreatedAt())
                .build();
    }

    private String generateSlug(String title) {
        String nfdNormalizedString = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String nospecial = pattern.matcher(nfdNormalizedString).replaceAll("")
                .replace('đ', 'd').replace('Đ', 'D')
                .replace(' ', '-')
                .replaceAll("[^a-zA-Z0-9-]", "")
                .toLowerCase(Locale.ENGLISH);
        return nospecial.replaceAll("-+", "-").replaceAll("^-|-$", "");
    }
}