package com.example.backend.mapper;

import com.example.backend.dto.response.admin.AdminBannerResponse;
import com.example.backend.dto.response.client.ClientBannerResponse;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.BannerRequest;
import com.example.backend.entity.Banner;

@Mapper(componentModel = "spring")
public interface BannerMapper {

    AdminBannerResponse toAdminBannerResponse(Banner banner);

    ClientBannerResponse toClientBannerResponse(Banner banner);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "mobileImageUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Banner toBanner(BannerRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "imageUrl", ignore = true)
    @Mapping(target = "mobileImageUrl", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateBanner(BannerRequest request, @MappingTarget Banner banner);
}
