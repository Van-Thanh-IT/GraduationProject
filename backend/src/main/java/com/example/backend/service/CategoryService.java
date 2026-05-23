package com.example.backend.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.CategoryRequest;
import com.example.backend.dto.response.CategoryResponse;
import com.example.backend.entity.Category;
import com.example.backend.enums.CategoryStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.CategoryMapper;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.utils.CloudinaryUtil;
import com.example.backend.utils.SlugUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final CloudinaryUtil cloudinaryutil;

    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllCategories() {
        List<CategoryResponse> list = categoryRepository.findAll().stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();

        Map<Integer, CategoryResponse> map = new HashMap<>();
        List<CategoryResponse> roots = new ArrayList<>();

        for (CategoryResponse category : list) {
            map.put(category.getId(), category);
        }

        for (CategoryResponse category : list) {
            if (category.getParentId() == null) {
                roots.add(category);
            } else {
                CategoryResponse parent = map.get(category.getParentId());
                if (parent != null) {
                    parent.getChildren().add(category);
                }
            }
        }
        return roots;
    }

    @Transactional
    public CategoryResponse createCategory(CategoryRequest request) {
        validateCategoryName(request.getName(), null);

        String slug = SlugUtil.generateUniqueSlug(request.getName(), categoryRepository::existsBySlug);

        Category category = categoryMapper.toCategory(request);
        category.setSlug(slug);

        handleParent(category, request.getParentId(), null);
        handleImage(category, request);

        category.setStatus(CategoryStatus.ACTIVE);

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = getCategoryOrThrow(id);

        if (request.getName() != null && !request.getName().equals(category.getName())) {
            validateCategoryName(request.getName(), id);

            String slug = SlugUtil.generateUniqueSlug(request.getName(), categoryRepository::existsBySlug);
            category.setSlug(slug);
        }
        handleParent(category, request.getParentId(), id);

        categoryMapper.updateCategory(category, request);

        handleImage(category, request);

        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    @Transactional
    public void updateCategoryStatus(Integer id, CategoryStatus status) {
        Category category = getCategoryOrThrow(id);
        category.setStatus(status);
        categoryRepository.save(category);
    }

    private Category getCategoryOrThrow(Integer id) {
        return categoryRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
    }

    private void validateCategoryName(String name, Integer id) {
        boolean exists = (id == null)
                ? categoryRepository.existsByName(name)
                : categoryRepository.existsByNameAndIdNot(name, id);

        if (exists) {
            throw new CustomException(ErrorCode.CATEGORY_NAME_EXISTS);
        }
    }

    private void handleParent(Category category, Integer parentId, Integer currentId) {
        if (parentId == null) return;

        if (parentId == 0) {
            category.setParent(null);
            return;
        }

        validateNoCycle(currentId, parentId);

        Category parent = categoryRepository
                .findById(parentId)
                .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));

        category.setParent(parent);
    }

    private void validateNoCycle(Integer categoryId, Integer parentId) {
        if (categoryId == null) return;

        Integer currentParentId = parentId;
        while (currentParentId != null) {
            if (currentParentId.equals(categoryId)) {
                log.warn("Attempted to create a cycle for category ID: {} with parent ID: {}", categoryId, parentId);
                throw new CustomException(ErrorCode.CATEGORY_CHILD_AS_PARENT_NOT_ALLOWED);
            }
            Category parent = categoryRepository.findById(currentParentId).orElse(null);
            currentParentId = (parent != null && parent.getParent() != null)
                    ? parent.getParent().getId()
                    : null;
        }
    }

    private void handleImage(Category category, CategoryRequest request) {
        if (request.getImage() == null || request.getImage().isEmpty()) return;

        if (category.getImageUrl() != null) {
            try {
                cloudinaryutil.deleteFile(category.getImageUrl());
            } catch (Exception e) {
                log.error("Failed to delete old image for category ID {}: {}", category.getId(), e.getMessage());
            }
        }

        String newImageUrl = cloudinaryutil.saveFile(request.getImage());
        if (newImageUrl != null) {
            category.setImageUrl(newImageUrl);
        }
    }
}
