package com.example.backend.dto.response;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.example.backend.enums.DiscountType;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VoucherResponse {
    private Integer id;
    private String name;
    private String code;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal maxDiscountValue;
    private BigDecimal minOrderValue;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Integer usageLimit;
    private Integer usedCount;
    private Boolean isValid;
}
