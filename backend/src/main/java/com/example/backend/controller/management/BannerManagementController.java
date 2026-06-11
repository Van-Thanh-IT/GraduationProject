package com.example.backend.controller.management;

import jakarta.validation.Valid;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.BannerRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.admin.AdminBannerResponse;
import com.example.backend.service.BannerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin/banners")
@RequiredArgsConstructor
public class BannerManagementController {

    private final BannerService bannerService;

    @GetMapping
    public APIResponse<Page<AdminBannerResponse>> getAllBanners(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        return APIResponse.success(bannerService.getAllBanners(PageRequest.of(page, size)));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<AdminBannerResponse> createBanner(@Valid @ModelAttribute BannerRequest request) {
        return APIResponse.success(bannerService.createBanner(request));
    }

    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public APIResponse<AdminBannerResponse> updateBanner(
            @PathVariable Integer id, @Valid @ModelAttribute BannerRequest request) {
        return APIResponse.success(bannerService.updateBanner(id, request));
    }

    @DeleteMapping("/{id}")
    public APIResponse<String> deleteBanner(@PathVariable Integer id) {
        bannerService.deleteBanner(id);
        return APIResponse.success("Đã xóa banner thành công!");
    }
}
