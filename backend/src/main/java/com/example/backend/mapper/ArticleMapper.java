package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.ArticleRequest;
import com.example.backend.dto.response.ArticleResponse;
import com.example.backend.entity.Article;

@Mapper(componentModel = "spring")
public interface ArticleMapper {

    ArticleResponse toArticleResponse(Article article);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Article toArticle(ArticleRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "slug", ignore = true)
    @Mapping(target = "viewCount", ignore = true)
    @Mapping(target = "thumbnailUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateArticle(@MappingTarget Article article, ArticleRequest request);
}
