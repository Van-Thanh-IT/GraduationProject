package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryNoteDetailResponse {
    private Integer id;
    private Integer productVariantId;
    private Integer quantity;
    private BigDecimal price;

    // Nếu có quản lý IMEI, trả về danh sách IMEI để Frontend hiển thị
    private List<String> serialNumbers;
}