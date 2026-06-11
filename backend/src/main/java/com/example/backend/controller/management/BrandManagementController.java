package com.example.backend.controller.management;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.BrandRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.BrandResponse;
import com.example.backend.enums.BrandStatus;
import com.example.backend.service.BrandService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/brands")
@RequiredArgsConstructor
public class BrandManagementController {

    private final BrandService brandService;

    @GetMapping
    public APIResponse<List<BrandResponse>> getAllBrands() {
        return APIResponse.success(brandService.getAllBrands());
    }

    @PostMapping
    public APIResponse<BrandResponse> createBrand(@Valid @ModelAttribute BrandRequest request) {
        BrandResponse response = brandService.createBrand(request);
        return APIResponse.<BrandResponse>builder()
                .code(201)
                .data(response)
                .messages("Thêm thương hiệu thành công!")
                .build();
    }

    @PutMapping("/{id}")
    public APIResponse<BrandResponse> updateBrand(
            @PathVariable Integer id, @Valid @ModelAttribute BrandRequest request) {
        BrandResponse response = brandService.updateBrand(id, request);
        return APIResponse.<BrandResponse>builder()
                .code(200)
                .data(response)
                .messages("Cập nhật thương hiệu thành công!")
                .build();
    }

    @PatchMapping("/{id}/status")
    public APIResponse<Void> updateStatus(@PathVariable Integer id, @RequestParam BrandStatus status) {

        brandService.updateBrandStatus(id, status);

        String message = (status == BrandStatus.ACTIVE)
                ? "Đã kích hoạt thương hiệu thành công!"
                : "Đã ẩn thương hiệu thành công!";

        return APIResponse.<Void>builder().code(200).messages(message).build();
    }
}
