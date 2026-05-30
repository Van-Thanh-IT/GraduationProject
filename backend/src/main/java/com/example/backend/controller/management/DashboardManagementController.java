package com.example.backend.controller.management;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

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
    public APIResponse<DashboardResponse> getDashboard(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {

        return APIResponse.success(dashboardService.getDashboardData(startDate, endDate));
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
