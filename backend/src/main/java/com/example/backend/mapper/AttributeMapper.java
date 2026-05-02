package com.example.backend.mapper;

import com.example.backend.dto.request.AttributeRequest;
import com.example.backend.dto.response.AttributeResponse;
import com.example.backend.entity.Attribute;
import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;

@Mapper(componentModel = "spring", nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
public interface AttributeMapper {

    AttributeResponse toAttributeResponse(Attribute attribute);

    Attribute toAttribute(AttributeRequest request);

    void updateAttribute(@MappingTarget Attribute attribute, AttributeRequest request);
}