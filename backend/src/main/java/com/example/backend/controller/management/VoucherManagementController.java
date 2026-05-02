package com.example.backend.controller.management;

import com.example.backend.dto.request.VoucherRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.VoucherResponse;
import com.example.backend.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/vouchers")
@RequiredArgsConstructor
public class VoucherManagementController {

    private final VoucherService voucherService;

    @GetMapping
    public APIResponse<List<VoucherResponse>> getAll() {
        return APIResponse.success(voucherService.getAllVouchersForAdmin());
    }

    @PostMapping
    public APIResponse<VoucherResponse> create(@Valid @RequestBody VoucherRequest request) {
        return APIResponse.success(voucherService.createVoucher(request));
    }

    @PutMapping("/{id}")
    public APIResponse<VoucherResponse> update(@PathVariable Integer id, @Valid @RequestBody VoucherRequest request) {
        return APIResponse.success(voucherService.updateVoucher(id, request));
    }

    @DeleteMapping("/{id}")
    public APIResponse<Void> delete(@PathVariable Integer id) {
        voucherService.softDeleteVoucher(id);
        return APIResponse.success(null);
    }
}