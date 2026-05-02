package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Builder;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
@Builder
public class BrandRequest {
    @NotBlank(message = "Tên thương hiệu không được để trống!")
    @Size(max = 100, message = "Tên thương hiệu không quá 100 ký tự! ")
    private String name;

    private MultipartFile logo;

    @Size(max = 500, message = "Mô tả không quá 500 ký tự!")
    private String description;
}
