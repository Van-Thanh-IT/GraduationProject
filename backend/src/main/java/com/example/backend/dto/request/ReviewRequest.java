package com.example.backend.dto.request;

import java.util.List;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class ReviewRequest {

    @NotNull(message = "ID Chi tiết đơn hàng (OrderItem) không được để trống")
    private Integer orderItemId;

    @NotNull(message = "Vui lòng chọn số sao đánh giá (1-5)")
    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    private Integer rating;

    private String comment;

    private List<MultipartFile> images;
}
