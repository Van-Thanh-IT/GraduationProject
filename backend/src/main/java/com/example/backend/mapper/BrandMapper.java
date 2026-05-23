package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

import com.example.backend.dto.request.BrandRequest;
import com.example.backend.dto.response.BrandResponse;
import com.example.backend.dto.response.client.ClientBrandResponse;
import com.example.backend.entity.Brand;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface BrandMapper {

    BrandResponse toBrandResponse(Brand brand);

    @Mapping(target = "logoUrl", ignore = true)
    Brand toBrand(BrandRequest request);

    @Mapping(target = "logoUrl", ignore = true)
    void updateBrand(@MappingTarget Brand brand, BrandRequest request);

    ClientBrandResponse toClientBrandResponse(Brand brand);
}
