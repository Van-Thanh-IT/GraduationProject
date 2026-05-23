package com.example.backend.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import com.example.backend.enums.Gender;
import com.example.backend.validation.constraint.VietnamPhone;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProfileRequest {

    @NotBlank(message = "Họ và tên không được để trống!")
    @Size(min = 8, max = 30, message = "Họ tên phải từ 8 đến 30 ký tự!")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Họ tên chỉ được chứa chữ cái và khoảng trắng!")
    private String username;

    @NotBlank(message = "Email không được để trống!")
    @Email(message = "Email không hợp lệ!")
    private String email;

    @NotBlank(message = "Số điện thoại không được để trống!")
    @VietnamPhone
    private String phone;

    private Gender gender;

    private MultipartFile avatar;

    private LocalDate dateOfBirth;

    @Pattern(regexp = "^$|.{8,}", message = "Mật khẩu mới phải có ít nhất 8 ký tự!")
    private String password;

    private String confirmPassword;
}
