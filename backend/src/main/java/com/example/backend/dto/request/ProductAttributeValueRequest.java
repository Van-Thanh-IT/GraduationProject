package com.example.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class ProductAttributeValueRequest {

    @NotNull(message = "ID Thông số (Attribute ID) không được để trống!")
    private Integer attributeId;

    @NotBlank(message = "Giá trị không được để trống!")
    @Size(max = 255, message = "Giá trị không được vượt quá 255 ký tự!")
    private String value;
}
