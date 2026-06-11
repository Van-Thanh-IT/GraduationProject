package com.example.backend.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import java.util.List;

import com.example.backend.controller.management.UserManagementController;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.example.backend.dto.response.UserResponse;
import com.example.backend.enums.UserStatus;
import com.example.backend.service.UserService;

@WebMvcTest(UserManagementController.class)
@AutoConfigureMockMvc(addFilters = false)
class UserManagementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean // Bản mới của Spring Boot dùng MockitoBean thay cho MockBean
    private UserService userService;

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUsers_ShouldReturnUserList() throws Exception {
        // Arrange
        UserResponse user = new UserResponse();
        user.setUsername("Nguyen Van A");
        when(userService.getAllUsers()).thenReturn(List.of(user));

        // Act & Assert
        mockMvc.perform(get("/api/admin/users")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].username").value("Nguyen Van A"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createStaff_ValidRequest_ShouldReturn201() throws Exception {
        // Arrange
        UserResponse response = new UserResponse();
        response.setUsername("Staff 1");

        when(userService.createStaffAccount(any())).thenReturn(response);

        // Với @ModelAttribute, ta dùng multipart request
        MockMultipartFile file = new MockMultipartFile("avatar", "test.jpg", "image/jpeg", new byte[0]);

        // Act & Assert
        mockMvc.perform(multipart("/api/admin/users")
                        .file(file)
                        .param("username", "nhân viên")
                        .param("email", "staff@gmail.com")
                        .param("phone", "0353198531")
                        .param("password", "12345678")
                        .param("confirmPassword", "12345678"))
                .andExpect(status().isCreated())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.username").value("Staff 1"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateUserStatus_ValidStatus_ShouldReturn200() throws Exception {
        // Arrange
        UserResponse response = new UserResponse();
        response.setStatus(UserStatus.ACTIVE);

        when(userService.updateUserStatus(any(), any())).thenReturn(response);

        // Act & Assert
        mockMvc.perform(patch("/api/admin/users/1/status")
                        .param("status", "ACTIVE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.messages").value("Cập nhật trạng thái thành công!"));
    }
}