package com.example.backend.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CartRequest {
    @NotNull(message = "Thiếu ID sản phẩm biến thể")
    private Integer productVariantId;

    @NotNull(message = "Thiếu số lượng")
    @Min(value = 1, message = "Số lượng phải lớn hơn 0")
    private Integer quantity;
}