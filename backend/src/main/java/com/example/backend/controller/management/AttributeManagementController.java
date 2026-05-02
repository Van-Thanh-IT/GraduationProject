package com.example.backend.controller.management;

import com.example.backend.dto.request.AttributeRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.AttributeResponse;
import com.example.backend.enums.AttributeStatus;
import com.example.backend.service.AttributeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/attributes")
@RequiredArgsConstructor
public class AttributeManagementController {

    private final AttributeService attributeService;

    @GetMapping
    public APIResponse<List<AttributeResponse>> getAllAttributes() {
        return APIResponse.success(attributeService.getAllAttributes());
    }

    @GetMapping("/{id}")
    public APIResponse<AttributeResponse> getAttributeById(@PathVariable Integer id) {
        return APIResponse.success(attributeService.getAttributeById(id));
    }

    @PostMapping
    public APIResponse<AttributeResponse> createAttribute(@Valid @RequestBody AttributeRequest request) {
        AttributeResponse response = attributeService.createAttribute(request);
        return APIResponse.<AttributeResponse>builder()
                .code(201)
                .data(response)
                .messages("Thêm thông số kỹ thuật thành công!")
                .build();
    }

    // Dùng @RequestBody
    @PutMapping("/{id}")
    public APIResponse<AttributeResponse> updateAttribute(
            @PathVariable Integer id,
            @Valid @RequestBody AttributeRequest request) {
        AttributeResponse response = attributeService.updateAttribute(id, request);
        return APIResponse.<AttributeResponse>builder()
                .code(200)
                .data(response)
                .messages("Cập nhật thông số kỹ thuật thành công!")
                .build();
    }

    @PatchMapping("/{id}/status")
    public APIResponse<Void> updateAttributeStatus(@PathVariable Integer id, @RequestParam AttributeStatus status) {
        attributeService.updateAttributeStatus(id, status);
        String message = (status == AttributeStatus.ACTIVE)
                ? "Đã kích hoạt thông số kỹ thuật thành công!"
                : "Đã ẩn thông số kỹ thuật thành công!";

        return APIResponse.<Void>builder()
                .code(200)
                .messages(message)
                .build();
    }
}