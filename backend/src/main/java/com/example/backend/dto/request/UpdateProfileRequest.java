package com.example.backend.dto.request;

import com.example.backend.enums.Gender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;

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
    @Pattern(regexp = "^(0[0-9]{9,10})$", message = "Số điện thoại không hợp lệ!")
    private String phone;

    private Gender gender;

    private MultipartFile avatar;

    private LocalDate dateOfBirth;

    // Dùng Regex thay thế @Size: Chấp nhận chuỗi rỗng (^$) HOẶC (|) chuỗi từ 8 ký tự trở lên (.{8,})
    @Pattern(regexp = "^$|.{8,}", message = "Mật khẩu mới phải có ít nhất 8 ký tự!")
    private String password;

    private String confirmPassword;
}