package com.example.backend.mapper;

import com.example.backend.dto.request.BannerRequest;
import com.example.backend.dto.response.BannerResponse;
import com.example.backend.entity.Banner;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    BannerResponse toResponse(Banner banner);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)       // Ảnh xử lý ở Service
    @Mapping(target = "mobileImageUrl", ignore = true) // Ảnh xử lý ở Service
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Banner toEntity(BannerRequest request);
}