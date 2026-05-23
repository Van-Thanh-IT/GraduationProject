package com.example.backend.service;

import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

import org.springframework.stereotype.Service;

import com.example.backend.dto.request.AttributeRequest;
import com.example.backend.dto.response.AttributeResponse;
import com.example.backend.entity.Attribute;
import com.example.backend.enums.AttributeStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.AttributeMapper;
import com.example.backend.repository.AttributeRepository;
import com.example.backend.utils.SlugUtil;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeMapper attributeMapper;

    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll().stream()
                .map(attributeMapper::toAttributeResponse)
                .toList();
    }

    public AttributeResponse createAttribute(AttributeRequest request) {

        validateAttributeName(request.getName(), null);

        String code = generateUniqueCode(request.getName());

        Attribute attribute = attributeMapper.toAttribute(request);
        attribute.setCode(code);
        attribute.setStatus(AttributeStatus.ACTIVE);

        return attributeMapper.toAttributeResponse(attributeRepository.save(attribute));
    }

    public AttributeResponse updateAttribute(Integer id, AttributeRequest request) {

        Attribute attribute = getAttributeOrThrow(id);

        if (request.getName() != null && !request.getName().equals(attribute.getName())) {
            validateAttributeName(request.getName(), id);
            attribute.setCode(generateUniqueCode(request.getName()));
        }

        attributeMapper.updateAttribute(attribute, request);

        return attributeMapper.toAttributeResponse(attributeRepository.save(attribute));
    }

    public void updateAttributeStatus(Integer id, AttributeStatus status) {
        Attribute attribute = getAttributeOrThrow(id);
        attribute.setStatus(status);
        attributeRepository.save(attribute);
    }

    private Attribute getAttributeOrThrow(Integer id) {
        return attributeRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.ATTRIBUTE_NOT_FOUND));
    }

    private void validateAttributeName(String name, Integer id) {
        boolean exists = (id == null)
                ? attributeRepository.existsByName(name)
                : attributeRepository.existsByNameAndIdNot(name, id);

        if (exists) {
            throw new CustomException(ErrorCode.ATTRIBUTE_NAME_EXISTS);
        }
    }

    private String generateUniqueCode(String name) {
        String slug = SlugUtil.toSlug(name);

        int randomNumber = ThreadLocalRandom.current().nextInt(100000, 1000000);

        return slug + "_" + randomNumber;
    }
}
