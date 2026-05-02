package com.example.backend.controller.client;

import com.example.backend.dto.request.AddressRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.AddressResponse;
import com.example.backend.service.AddressService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/addresses")
@RequiredArgsConstructor
public class AddressController {

    private final AddressService addressService;

    // 1. Lấy danh sách địa chỉ của tôi
    @GetMapping
    public APIResponse<List<AddressResponse>> getMyAddresses() {
        return APIResponse.success(addressService.getMyAddresses());
    }

    // 2. Thêm địa chỉ mới
    @PostMapping
    public APIResponse<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request) {
        return APIResponse.success(addressService.createAddress(request));
    }

    // 3. Sửa địa chỉ
    @PutMapping("/{id}")
    public APIResponse<AddressResponse> updateAddress(@PathVariable Integer id, @Valid @RequestBody AddressRequest request) {
        return APIResponse.success(addressService.updateAddress(id, request));
    }

    // 4. Xóa địa chỉ
    @DeleteMapping("/{id}")
    public APIResponse<Void> deleteAddress(@PathVariable Integer id) {
        addressService.deleteAddress(id);

        return APIResponse.<Void>builder()
                .code(200)
                .messages("Đã xóa địa chỉ thành công")
                .build();
    }

    // 5. Cài đặt làm địa chỉ mặc định nhanh
    @PatchMapping("/{id}/default")
    public APIResponse<Void> setDefaultAddress(@PathVariable Integer id) {
        addressService.setDefaultAddress(id);

        return APIResponse.<Void>builder()
                .code(200)
                .messages("Đã cập nhật địa chỉ mặc định thành công")
                .build();
    }
}