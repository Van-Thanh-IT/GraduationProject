package com.example.backend.repository;

import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.example.backend.entity.Article;
import com.example.backend.enums.ArticleStatus;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Integer> {
    Optional<Article> findBySlugAndStatus(String slug, ArticleStatus status);

    Page<Article> findAllByStatus(ArticleStatus status, Pageable pageable);

    @Modifying
    @Query("UPDATE Article a SET a.viewCount = a.viewCount + 1 WHERE a.id = :id")
    void incrementViewCount(Integer id);

    boolean existsBySlug(String slug);
}
