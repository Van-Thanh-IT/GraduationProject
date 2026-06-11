package com.example.backend.controller.client;

import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.GoshipDto;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.service.GoshipService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/goship")
@RequiredArgsConstructor
public class GoshipController {

    private static final Logger log = LoggerFactory.getLogger(GoshipController.class);
    private final GoshipService goshipService;

    @GetMapping("/cities")
    public ResponseEntity<Map<String, Object>> getCities() {
        return ResponseEntity.ok(goshipService.getCities());
    }

    @GetMapping("/cities/{cityCode}/districts")
    public ResponseEntity<Map<String, Object>> getDistrictsByCity(@PathVariable String cityCode) {
        return ResponseEntity.ok(goshipService.getDistrictsByCity(cityCode));
    }

    @GetMapping("/districts/{districtCode}/wards")
    public ResponseEntity<Map<String, Object>> getWardsByDistrict(@PathVariable String districtCode) {
        return ResponseEntity.ok(goshipService.getWardsByDistrict(districtCode));
    }

    @PostMapping("/calculate-fee")
    public APIResponse<List<Map<String, Object>>> calculateFee(@RequestBody GoshipDto.FeeRequest request) {

        List<Map<String, Object>> result = goshipService.calculateShippingFee(request);

        if (result != null && !result.isEmpty()) {
            return APIResponse.success(result);
        } else {
            return APIResponse.error(400, "Không tìm thấy tuyến đường cho ĐVVC này");
        }
    }
}
