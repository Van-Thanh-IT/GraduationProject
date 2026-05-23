package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttributeRequest {

    @NotBlank(message = "Tên thông số không được để trống!")
    @Size(max = 100, message = "Tên thông số không quá 100 ký tự!")
    @Pattern(
            regexp = "^[\\p{L}0-9\\s\\-]+$",
            message = "Tên chỉ chứa chữ, số, khoảng trắng và dấu -"
    )
    private String name;

    @Size(max = 50, message = "Nhóm bộ lọc không quá 50 ký tự!")
    private String filterGroup;
}
