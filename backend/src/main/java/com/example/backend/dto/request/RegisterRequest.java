package com.example.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.*;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {

    @NotBlank(message = "Họ tên người dùng không được để trống!")
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

}

