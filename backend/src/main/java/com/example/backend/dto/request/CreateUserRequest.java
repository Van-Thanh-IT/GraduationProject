package com.example.backend.dto.request;

import java.time.LocalDate;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import com.example.backend.enums.Gender;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateUserRequest {

    @NotBlank(message = "Họ Và tên nhân viên không được để trống!")
    @Size(min = 8, message = "Họ tên phải có ít nhất 8 ký tự!")
    @Size(max = 30, message = "Họ tên không quá 30 ký tự")
    @Pattern(regexp = "^[a-zA-ZÀ-ỹ\\s]+$", message = "Họ tên chỉ được chứa chữ cái và khoảng trắng!")
    private String username;

    @NotBlank(message = "Email không được để trống!")
    @Email(message = "Email không hợp lệ!")
    private String email;

    @NotBlank(message = "Mật khẩu không được để trống!")
    @Size(min = 8, message = "Mật khẩu phải có ít nhất 8 ký tự!")
    private String password;

    @NotBlank(message = "Vui lòng nhập lại mật khẩu!")
    private String confirmPassword;

    @NotBlank(message = "Số điện thoại không được để trống!")
    @Pattern(regexp = "^(0[0-9]{9,10})$", message = "Số điện thoại không hợp lệ!")
    private String phone;

    private Gender gender;

    private MultipartFile avatar;

    private LocalDate dateOfBirth;
}
