package com.example.backend.dto.request;

import com.example.backend.enums.DiscountType;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class VoucherRequest {
    @NotBlank(message = "Tên chương trình không được để trống")
    @Size(max = 150, message = "Tên không được vượt quá 150 ký tự")
    private String name;

    @Pattern(regexp = "^[A-Z0-9]*$", message = "Mã CODE chỉ được chứa chữ cái in hoa và số (không có khoảng trắng)")
    @Size(max = 50, message = "Mã CODE không được vượt quá 50 ký tự")
    private String code;

    @NotNull(message = "Loại giảm giá không được để trống")
    private DiscountType discountType;

    @NotNull(message = "Giá trị giảm không được để trống")
    @Min(value = 1, message = "Giá trị giảm phải lớn hơn 0")
    private BigDecimal discountValue;

    @Min(value = 0, message = "Số tiền giảm tối đa không được là số âm")
    private BigDecimal maxDiscountValue;

    @Min(value = 0, message = "Giá trị đơn tối thiểu không được là số âm")
    private BigDecimal minOrderValue;

    @NotNull(message = "Ngày bắt đầu không được để trống")
    private LocalDateTime startDate;

    @NotNull(message = "Ngày kết thúc không được để trống")
    @Future(message = "Ngày kết thúc phải ở tương lai")
    private LocalDateTime endDate;

    @Min(value = 0, message = "Giới hạn sử dụng không được là số âm (0 = Không giới hạn)")
    private Integer usageLimit;
}