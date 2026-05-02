package com.example.backend.controller.management;

import com.example.backend.dto.request.FlashSaleRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.FlashSaleResponse;
import com.example.backend.service.FlashSaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/flash-sales")
@RequiredArgsConstructor
public class FlashSaleManagementController {

    private final FlashSaleService flashSaleService;

    // 1. Lấy danh sách toàn bộ Flash Sale
    @GetMapping
    public APIResponse<List<FlashSaleResponse>> getAll() {
        return APIResponse.success(flashSaleService.getAllFlashSales());
    }

    // 2. Tạo mới chiến dịch Flash Sale
    @PostMapping
    public APIResponse<FlashSaleResponse> create(@Valid @RequestBody FlashSaleRequest request) {
        return APIResponse.success(flashSaleService.createFlashSale(request));
    }

    // 3. Cập nhật thông tin (Giá, số lượng, thời gian)
    @PutMapping("/{id}")
    public APIResponse<FlashSaleResponse> update(
            @PathVariable Integer id,
            @Valid @RequestBody FlashSaleRequest request) {
        return APIResponse.success(flashSaleService.updateFlashSale(id, request));
    }

    // 4. Bật/Tắt nhanh chương trình (status: 1 = Bật, 0 = Tắt)
    @PatchMapping("/{id}/status")
    public APIResponse<Void> updateStatus(
            @PathVariable Integer id,
            @RequestParam Integer status) {
        flashSaleService.updateFlashSaleStatus(id, status);
        return APIResponse.success(null);
    }
}