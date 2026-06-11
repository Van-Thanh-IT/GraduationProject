package com.example.backend.dto.request;

import java.math.BigDecimal;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import lombok.Data;

@Data
public class ProductVariantRequest {

    @Size(max = 50, message = "Tùy chọn 1 không vượt quá 50 ký tự!")
    private String option1Value;

    @Size(max = 50, message = "Tùy chọn 2 không vượt quá 50 ký tự!")
    private String option2Value;

    @Size(max = 50, message = "Tùy chọn 3 không vượt quá 50 ký tự!")
    private String option3Value;

    @NotNull(message = "Giá bán không được để trống!")
    @DecimalMin(value = "0.0", inclusive = true, message = "Giá bán không được nhỏ hơn 0!")
    private BigDecimal price;

    @DecimalMin(value = "0.0", inclusive = true, message = "Giá gốc không được nhỏ hơn 0!")
    private BigDecimal originalPrice;

    @DecimalMin(value = "0.0", inclusive = true, message = "Cân nặng không được là số âm!")
    private BigDecimal weight;

    @NotNull(message = "Phải xác định đây có phải biến thể mặc định không!")
    private Boolean isDefault;

    @NotNull(message = "Bắt buộc phải tích có serial hay không!")
    private Boolean isSerialRequired;
}
