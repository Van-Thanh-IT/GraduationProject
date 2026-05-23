package com.example.backend.dto.response;

import java.math.BigDecimal;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VariantSimpleResponse {
    private Integer id;
    private String sku;
    private String productName;
    private String options;
    private BigDecimal price;
}
