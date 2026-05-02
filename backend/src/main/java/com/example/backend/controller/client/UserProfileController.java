package com.example.backend.controller.client;

import com.example.backend.dto.request.UpdateProfileRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RequiredArgsConstructor
@RequestMapping("/api/profile")
@RestController
public class UserProfileController {
    private final UserService userService;

    // Lấy thông tin cá nhân
    @GetMapping("/me")
    public APIResponse<UserResponse> getMyProfile() {
        return APIResponse.success(userService.getInfo());
    }

    // Cập nhật thông tin
    @PreAuthorize("hasRole('ADMIN') or @customSecurity.isOwner(#userId)")
    @PutMapping("/{userId}")
    public APIResponse<UserResponse> updateProfile(
            @PathVariable Integer userId,
            @ModelAttribute UpdateProfileRequest request) {

        UserResponse response = userService.updateProfile(userId, request);
        return APIResponse.<UserResponse>builder()
                .code(200)
                .data(response)
                .messages("Cập nhật thông tin thành công!")
                .build();
    }

}
