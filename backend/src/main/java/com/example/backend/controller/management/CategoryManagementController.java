package com.example.backend.controller.management;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.CategoryRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.CategoryResponse;
import com.example.backend.enums.CategoryStatus;
import com.example.backend.service.CategoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/categories")
@RequiredArgsConstructor
public class CategoryManagementController {

    private final CategoryService categoryService;

    @GetMapping
    public APIResponse<List<CategoryResponse>> getAllCategories() {
        return APIResponse.success(categoryService.getAllCategories());
    }

    @PostMapping
    public APIResponse<CategoryResponse> createCategory(@Valid @ModelAttribute CategoryRequest request) {
        CategoryResponse response = categoryService.createCategory(request);
        return APIResponse.<CategoryResponse>builder()
                .code(201)
                .data(response)
                .messages("Thêm danh mục thành công!")
                .build();
    }

    @PutMapping("/{id}")
    public APIResponse<CategoryResponse> updateCategory(
            @PathVariable Integer id, @Valid @ModelAttribute CategoryRequest request) {
        CategoryResponse response = categoryService.updateCategory(id, request);
        return APIResponse.<CategoryResponse>builder()
                .code(200)
                .data(response)
                .messages("Cập nhật danh mục thành công!")
                .build();
    }

    @DeleteMapping("/{id}")
    public APIResponse<Void> updateCategoryStatus(@PathVariable Integer id, @RequestParam CategoryStatus status) {

        categoryService.updateCategoryStatus(id, status);
        String message =
                (status == CategoryStatus.ACTIVE) ? "Đã kích hoạt danh mục thành công!" : "Đã ẩn danh mục thành công!";

        return APIResponse.<Void>builder().code(200).messages(message).build();
    }
}
