package com.example.backend.dto.request;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ProductRequest {

    @Positive(message = "Thương hiệu không hợp lệ!")
    private Integer brandId;

    @Positive(message = "Danh mục không hợp lệ!")
    private Integer categoryId;

    @NotBlank(message = "Vui lòng nhập tên sản phẩm (VD: iPhone 15 Pro Max 256GB)!")
    @Size(max = 255, message = "Tên sản phẩm không được vượt quá 255 ký tự!")
    @Size(min = 5, message = "Tên sản phẩm phải có ít nhất 4 ký tự!")
    private String name;

    @Size(max = 100, message = "Thời gian bảo hành tối đa 100 ký tự (VD: 12 tháng chính hãng)!")
    private String warrantyPeriod;

    @Size(max = 5000, message = "Mô tả sản phẩm không được vượt quá 5000 ký tự!")
    private String description;

    @Size(max = 50, message = "Tên tùy chọn 1 không được vượt quá 50 ký tự (VD: Màu sắc)!")
    private String option1Name;

    @Size(max = 50, message = "Tên tùy chọn 2 không được vượt quá 50 ký tự (VD: RAM)!")
    private String option2Name;

    @Size(max = 50, message = "Tên tùy chọn 3 không được vượt quá 50 ký tự (VD: Bộ nhớ)!")
    private String option3Name;
}