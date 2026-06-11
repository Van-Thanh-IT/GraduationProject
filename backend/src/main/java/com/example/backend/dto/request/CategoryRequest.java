package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống!")
    @Size(max = 100, message = "Tên danh mục không quá 100 ký tự!")
    @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-]+$",
            message = "Tên chỉ chứa chữ, số, khoảng trắng và dấu -"
    )
    private String name;

    @Positive(message = "parentId phải > 0")
    private Integer parentId;

    @Size(max = 500, message = "Mô tả không quá 500 ký tự!")
    private String description;

    private MultipartFile image;
}
