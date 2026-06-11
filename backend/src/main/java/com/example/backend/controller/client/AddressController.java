package com.example.backend.controller.client;

import java.util.List;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.AddressRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.client.AddressResponse;
import com.example.backend.service.AddressService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    @GetMapping
    public APIResponse<List<AddressResponse>> getMyAddresses() {
        return APIResponse.success(addressService.getMyAddresses());
    }

    @PostMapping
    public APIResponse<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request) {
        return APIResponse.success(addressService.createAddress(request));
    }

    @PutMapping("/{id}")
    public APIResponse<AddressResponse> updateAddress(
            @PathVariable Integer id, @Valid @RequestBody AddressRequest request) {
        return APIResponse.success(addressService.updateAddress(id, request));
    }

    @DeleteMapping("/{id}")
    public APIResponse<Void> deleteAddress(@PathVariable Integer id) {
        addressService.deleteAddress(id);

        return APIResponse.<Void>builder()
                .code(200)
                .messages("Đã xóa địa chỉ thành công")
                .build();
    }

    @PatchMapping("/{id}/default")
    public APIResponse<Void> setDefaultAddress(@PathVariable Integer id) {
        addressService.setDefaultAddress(id);

        return APIResponse.<Void>builder()
                .code(200)
                .messages("Đã cập nhật địa chỉ mặc định thành công")
                .build();
    }
}
