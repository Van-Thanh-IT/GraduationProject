package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class BrandRequest {

    @NotBlank(message = "Tên thương hiệu không được để trống!")
    @Size(max = 100, message = "Tên thương hiệu không quá 100 ký tự!")
    @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-]+$",
            message = "Tên chỉ chứa chữ, số, khoảng trắng và dấu -"
    )
    private String name;

    private MultipartFile logo;

    @Size(max = 500, message = "Mô tả không quá 500 ký tự!")
    private String description;
}
