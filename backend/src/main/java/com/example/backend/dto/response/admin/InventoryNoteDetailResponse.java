package com.example.backend.dto.response.admin;

import java.math.BigDecimal;
import java.util.List;

import com.example.backend.enums.SerialStatus;
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

    private String productName;

    private String sku;

    private String variantAttributes;

    private Integer quantity;

    private BigDecimal price;

    private List<SerialInfo> serials;

    @Data
    @Builder
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SerialInfo {
        private String serialNumber;
        private SerialStatus status;
    }
}
