package com.example.backend.dto.response;

import com.example.backend.enums.ReferenceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryHistoryResponse {
    private Integer id;
    private Integer productVariantId;
    private Integer previousQuantity;
    private Integer changeAmount;
    private Integer newQuantity;
    private ReferenceType referenceType;
    private Integer referenceId;
    private String note;
    private LocalDateTime createdAt;
}