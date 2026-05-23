package com.example.backend.controller.management;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.DashboardResponse;
import com.example.backend.repository.*;
import com.example.backend.service.DashboardService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/management/dashboard")
@RequiredArgsConstructor
public class DashboardManagementController {
    private final ProductRepository productRepo;
    private final ProductVariantRepository variantRepo;
    private final ProductVariantImageRepository imageRepo;
    private final ProductAttributeValueRepository productAttributeValueRepo;
    private final DashboardService dashboardService;

    @GetMapping
    public APIResponse<DashboardResponse> getDashboardOverview() {
        return APIResponse.success(dashboardService.getDashboardData());
    }

    @GetMapping("/stats")
    public APIResponse<Map<String, Long>> getStats() {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalProducts", productRepo.count());
        stats.put("totalVariants", variantRepo.count());
        stats.put("totalImages", imageRepo.count());
        stats.put("totalAttributes", productAttributeValueRepo.count());

        return APIResponse.success(stats);
    }

    @GetMapping("/stats/{productId}")
    public APIResponse<Map<String, Long>> getProductStats(@PathVariable Integer productId) {
        Map<String, Long> stats = new HashMap<>();
        stats.put("totalProducts", productRepo.count());
        stats.put("totalVariants", variantRepo.countByProductId(productId));
        stats.put("totalImages", imageRepo.countByVariantProductId(productId));
        stats.put("totalAttributes", productAttributeValueRepo.countByProductId(productId));

        return APIResponse.success(stats);
    }
}
