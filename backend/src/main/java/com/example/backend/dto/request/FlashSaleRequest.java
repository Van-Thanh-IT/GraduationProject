package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import lombok.Data;

@Data
public class FlashSaleRequest {
    @NotNull(message = "Thiếu ID biến thể sản phẩm")
    private Integer productVariantId;

    @NotNull(message = "Giá Flash Sale không được để trống")
    @Min(value = 0, message = "Giá Flash Sale không hợp lệ")
    private BigDecimal flashSalePrice;

    @NotNull(message = "Thời gian bắt đầu không được để trống")
    @FutureOrPresent(message = "Thời gian bắt đầu không được nằm trong quá khứ")
    private LocalDateTime startTime;

    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Future(message = "Thời gian kết thúc phải ở tương lai")
    private LocalDateTime endTime;

    @NotNull(message = "Vui lòng nhập số lượng suất Sale")
    @Min(value = 1, message = "Số lượng kho sale phải từ 1 trở lên")
    private Integer saleStockQuantity;

    @Min(value = 1, message = "Mỗi người phải mua được ít nhất 1 sản phẩm")
    private Integer maxQuantityPerUser;
}
