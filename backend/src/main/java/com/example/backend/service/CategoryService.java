package com.example.backend.service;

import com.example.backend.dto.request.CategoryRequest;
import com.example.backend.dto.response.CategoryResponse;
import com.example.backend.entity.Category;
import com.example.backend.enums.CategoryStatus;
import com.example.backend.mapper.CategoryMapper;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.utils.Cloudinaryutil;
import com.example.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;
    private final CategoryMapper categoryMapper;
    private final Cloudinaryutil cloudinaryutil;

    public List<CategoryResponse> getAllCategories() {

        List<CategoryResponse> list = categoryRepository.findAll()
                .stream()
                .map(categoryMapper::toCategoryResponse)
                .toList();

        Map<Integer, CategoryResponse> map = new HashMap<>();
        List<CategoryResponse> roots = new ArrayList<>();

        for (CategoryResponse category : list) {
            map.put(category.getId(), category);
        }

        // Build tree
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

    public CategoryResponse createCategory(CategoryRequest request) {
        if (categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại!");
        }

        String slug = SlugUtil.toSlug(request.getName());
        if (categoryRepository.existsBySlug(slug)) {
            throw new RuntimeException("Đường dẫn (Slug) đã tồn tại!");
        }

        Category category = categoryMapper.toCategory(request);
        category.setSlug(slug);

        if (request.getParentId() != null) {
            Category parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Danh mục cha không tồn tại!"));
            category.setParent(parent);
        }

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            category.setImageUrl(cloudinaryutil.saveFile(request.getImage()));
        }

        category.setStatus(CategoryStatus.ACTIVE);
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public CategoryResponse updateCategory(Integer id, CategoryRequest request) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        if (request.getName() != null && !request.getName().equals(category.getName())
                && categoryRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên danh mục đã tồn tại!");
        }

        if (request.getName() != null) {
            String slug = SlugUtil.toSlug(request.getName());
            if (!slug.equals(category.getSlug()) && categoryRepository.existsBySlug(slug)) {
                throw new RuntimeException("Đường dẫn (Slug) đã tồn tại!");
            }


            if (request.getParentId() != null) {
                if (request.getParentId() == 0) {
                    category.setParent(null);
                } else {
                    if (request.getParentId().equals(id)) {
                        throw new RuntimeException("Lỗi: Một danh mục không thể làm cha của chính nó!");
                    }

                    Category parent = categoryRepository.findById(request.getParentId())
                            .orElseThrow(() -> new RuntimeException("Danh mục cha không tồn tại!"));
                    category.setParent(parent);
                }
            }

            categoryMapper.updateCategory(category, request);
            category.setSlug(slug);

            if (request.getImage() != null && !request.getImage().isEmpty()) {
                if (category.getImageUrl() != null) {
                    cloudinaryutil.deleteFile(category.getImageUrl());
                }
                category.setImageUrl(cloudinaryutil.saveFile(request.getImage()));
            }
        }
        return categoryMapper.toCategoryResponse(categoryRepository.save(category));
    }

    public void UpdateCategoryStatus(Integer id, CategoryStatus status) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy danh mục!"));

        category.setStatus(status);
        categoryRepository.save(category);
    }
}