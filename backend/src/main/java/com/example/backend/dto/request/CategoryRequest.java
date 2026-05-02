package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống!")
    @Size(max = 100, message = "Tên danh mục không quá 100 ký tự!")
    private String name;

    // Truyền ID của danh mục cha (Nếu là danh mục gốc thì truyền null hoặc không truyền)
    private Integer parentId;

    @Size(max = 500, message = "Mô tả không quá 500 ký tự!")
    private String description;

    private MultipartFile image;
}