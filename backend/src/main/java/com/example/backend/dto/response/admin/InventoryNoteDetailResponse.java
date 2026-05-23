package com.example.backend.dto.response.admin;

import java.math.BigDecimal;
import java.util.List;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryNoteDetailResponse {

    private Integer id;

    private Integer productVariantId;

    private Integer quantity;

    private BigDecimal price;

    private List<String> serialNumbers;
}
