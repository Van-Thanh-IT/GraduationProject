package com.example.backend.service;

import com.example.backend.dto.request.AttributeRequest;
import com.example.backend.dto.response.AttributeResponse;
import com.example.backend.entity.Attribute;
import com.example.backend.enums.AttributeStatus;
import com.example.backend.mapper.AttributeMapper;
import com.example.backend.repository.AttributeRepository;
import com.example.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class AttributeService {

    private final AttributeRepository attributeRepository;
    private final AttributeMapper attributeMapper;

    // 1. Lấy toàn bộ danh sách
    public List<AttributeResponse> getAllAttributes() {
        return attributeRepository.findAll()
                .stream()
                .map(attributeMapper::toAttributeResponse)
                .toList();
    }

    // 2. Lấy chi tiết 1 thông số
    public AttributeResponse getAttributeById(Integer id) {
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật!"));
        return attributeMapper.toAttributeResponse(attribute);
    }

    // 3. Thêm mới
    public AttributeResponse createAttribute(AttributeRequest request) {
        String code = generateAttributeCode(request.getName());
        if (attributeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên thông số đã tồn tại!");
        }

        if (attributeRepository.existsByCode(code)) {
            throw new RuntimeException("Mã code đã tồn tại!");
        }

        Attribute attribute = attributeMapper.toAttribute(request);
        attribute.setCode(code);
        attribute.setStatus(AttributeStatus.ACTIVE);
        return attributeMapper.toAttributeResponse(attributeRepository.save(attribute));
    }

    // 4. Cập nhật
    public AttributeResponse updateAttribute(Integer id, AttributeRequest request) {
        String code = generateAttributeCode(request.getName());
        Attribute attribute = attributeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông số kỹ thuật!"));

        // Check trùng Tên
        if (!attribute.getName().equals(request.getName()) && attributeRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên thông số đã tồn tại!");
        }

        // Check trùng Mã Code
        if (!attribute.getCode().equals(code) && attributeRepository.existsByCode(code)) {
            throw new RuntimeException("Mã code đã tồn tại!");
        }

        attributeMapper.updateAttribute(attribute, request);
        attribute.setCode(code);
        return attributeMapper.toAttributeResponse(attributeRepository.save(attribute));
    }

    // 5. Xóa cứng (Hard Delete)
    public void updateAttributeStatus(Integer id, AttributeStatus status) {
        Attribute attribute = attributeRepository.findById(id).orElseThrow(
                () -> new RuntimeException("Không tìm thấy id thuộc tính"));

        attribute.setStatus(status);

        attributeRepository.save(attribute);
    }

    private String generateAttributeCode(String name) {
        String slug = SlugUtil.toSlug(name);

        int randomNumber = 100000 + new Random().nextInt(900000);

        return slug + "_" + randomNumber;
    }
}