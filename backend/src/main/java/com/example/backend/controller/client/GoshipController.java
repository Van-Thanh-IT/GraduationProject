package com.example.backend.controller.client;

import com.example.backend.dto.request.GoshipDto;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.service.GoshipService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.JsonNode;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/public/goship")
@RequiredArgsConstructor
public class GoshipController {

    private final GoshipService goshipService;

    // ==========================================
    // 1. API LẤY DANH SÁCH TỈNH / THÀNH PHỐ
    // ==========================================
    @GetMapping("/cities")
    public ResponseEntity<Map<String, Object>> getCities() {
        return ResponseEntity.ok(goshipService.getCities());
    }

    // ==========================================
    // 2. API LẤY QUẬN / HUYỆN (Theo mã Tỉnh)
    // ==========================================
    @GetMapping("/cities/{cityCode}/districts")
    public ResponseEntity<Map<String, Object>> getDistrictsByCity(@PathVariable String cityCode) {
        return ResponseEntity.ok(goshipService.getDistrictsByCity(cityCode));
    }

    // ==========================================
    // 3. API LẤY PHƯỜNG / XÃ (Theo mã Huyện)
    // ==========================================
    @GetMapping("/districts/{districtCode}/wards")
    public ResponseEntity<Map<String, Object>> getWardsByDistrict(@PathVariable String districtCode) {
        return ResponseEntity.ok(goshipService.getWardsByDistrict(districtCode));
    }


    @PostMapping("/calculate-fee")
    // SỬA 4: Đổi từ APIResponse<JsonNode> thành APIResponse<List<JsonNode>>
    public APIResponse<List<JsonNode>> calculateFee(@RequestBody GoshipDto.FeeRequest request) {

        List<JsonNode> result = goshipService.calculateShippingFee(request);

        // Kiểm tra list không bị rỗng
        if (result != null && !result.isEmpty()) {
            return APIResponse.success(result);
        } else {
            return APIResponse.error(400, "Không tìm thấy tuyến đường cho ĐVVC này");
        }
    }
}