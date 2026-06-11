package com.example.backend.controller.client;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.VoucherResponse;
import com.example.backend.service.VoucherService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/vouchers")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping("/available")
    public APIResponse<List<VoucherResponse>> getValidVouchersForUser() {
        return APIResponse.success(voucherService.getValidVouchersForUser());
    }

    @GetMapping("/preview-discount")
    public APIResponse<?> previewDiscount(@RequestParam String code, @RequestParam BigDecimal orderTotal) {
        try {
            BigDecimal discount = voucherService.calculateDiscountAmount(code, orderTotal);

            Map<String, Object> result = new HashMap<>();
            result.put("appliedCode", code.toUpperCase());
            result.put("discountAmount", discount);
            result.put("finalAmount", orderTotal.subtract(discount));

            return APIResponse.success(result);
        } catch (IllegalStateException | IllegalArgumentException e) {
            return APIResponse.error(400, e.getMessage());
        }
    }
}
