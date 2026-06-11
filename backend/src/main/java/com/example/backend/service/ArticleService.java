package com.example.backend.service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.ArticleRequest;
import com.example.backend.dto.response.ArticleResponse;
import com.example.backend.entity.Article;
import com.example.backend.enums.ArticleStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ArticleMapper;
import com.example.backend.repository.ArticleRepository;
import com.example.backend.utils.CloudinaryUtil;
import com.example.backend.utils.SlugUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;
    private final CloudinaryUtil cloudinaryutil;

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getPublishedArticles(Pageable pageable) {
        return articleRepository
                .findAllByStatus(ArticleStatus.PUBLISHED, pageable)
                .map(articleMapper::toArticleResponse);
    }

    public ArticleResponse getArticleBySlug(String slug) {
        Article article = articleRepository
                .findBySlugAndStatus(slug, ArticleStatus.PUBLISHED)
                .orElseThrow(() -> new CustomException(ErrorCode.ARTICLE_NOT_FOUND));

        increaseViewCountSafely(article.getId());

        return articleMapper.toArticleResponse(article);
    }

    @Transactional(readOnly = true)
    public Page<ArticleResponse> getAllArticlesForAdmin(Pageable pageable) {
        return articleRepository.findAll(pageable).map(articleMapper::toArticleResponse);
    }

    @Transactional
    public ArticleResponse createArticle(ArticleRequest request) {

        Article article = articleMapper.toArticle(request);
        article.setSlug(generateUniqueSlug(request.getTitle()));
        article.setViewCount(0);

        handleThumbnail(article, request.getThumbnail());

        return articleMapper.toArticleResponse(articleRepository.save(article));
    }

    @Transactional
    public ArticleResponse updateArticle(Integer id, ArticleRequest request) {

        Article article = getArticleOrThrow(id);

        articleMapper.updateArticle(article, request);

        handleThumbnail(article, request.getThumbnail());

        return articleMapper.toArticleResponse(articleRepository.save(article));
    }

    @Transactional
    public void deleteArticle(Integer id) {
        Article article = getArticleOrThrow(id);

        String thumbnailUrl = article.getThumbnailUrl();
        articleRepository.delete(article);

        if (thumbnailUrl != null) {
            deleteThumbnailSafely(thumbnailUrl);
        }
    }

    private Article getArticleOrThrow(Integer id) {
        return articleRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.ARTICLE_NOT_FOUND));
    }

    private String generateUniqueSlug(String title) {
        String baseSlug = SlugUtil.toSlug(title);
        String slug = baseSlug;
        if (articleRepository.existsBySlug(slug)) {
            slug = baseSlug + "-" + (System.currentTimeMillis() / 1000);
        }
        return slug;
    }

    private void handleThumbnail(Article article, MultipartFile thumbnail) {
        if (thumbnail == null || thumbnail.isEmpty()) return;

        if (article.getThumbnailUrl() != null) {
            deleteThumbnailSafely(article.getThumbnailUrl());
        }

        String newUrl = cloudinaryutil.saveFile(thumbnail);
        if (newUrl != null) {
            article.setThumbnailUrl(newUrl);
        }
    }

    private void deleteThumbnailSafely(String url) {
        try {
            cloudinaryutil.deleteFile(url);
        } catch (Exception e) {
            log.error("Lỗi xóa ảnh bài viết trên Cloudinary: {}", url, e);
        }
    }

    private void increaseViewCountSafely(Integer articleId) {
        try {
            articleRepository.incrementViewCount(articleId);
        } catch (Exception e) {
            log.error("Failed to increment view count for article: {}", articleId, e);
        }
    }
}
