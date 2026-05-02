package com.example.backend.controller.management;

import com.example.backend.dto.request.CreateUserRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.enums.RoleName;
import com.example.backend.enums.UserStatus;
import com.example.backend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/users")
public class UserManagementController {
    private final UserService userService;

    // Lấy người dùng theo role
    @GetMapping
    public APIResponse<List<UserResponse>> getUsers(
            @RequestParam(required = false) RoleName role) {

        List<UserResponse> users = (role != null)
                ? userService.getUsersByRole(role)
                : userService.getAllUsers();

        return APIResponse.success(users);
    }

    // Tạo Nhân viên
    @PostMapping
    public APIResponse<UserResponse> createStaff(@ModelAttribute @Valid CreateUserRequest request){
        UserResponse response = userService.createStaffAccount(request);
        return APIResponse.<UserResponse>builder()
                .code(201)
                .data(response)
                .messages("Tạo nhân viên thành công!")
                .build();
    }

    // Cập nhật trạng thái TK
    @PatchMapping("/{userId}/status")
    public APIResponse<UserResponse> updateUserStatus(
            @PathVariable Integer userId,
            @RequestParam UserStatus status) {

        UserResponse response = userService.updateUserStatus(userId, status);
        return APIResponse.<UserResponse>builder()
                .code(200)
                .data(response)
                .messages("Cập nhật trạng thái thành công!")
                .build();
    }
}