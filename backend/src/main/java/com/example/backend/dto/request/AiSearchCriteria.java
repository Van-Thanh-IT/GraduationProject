package com.example.backend.dto.request;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AiSearchCriteria {
    private String intent;

    private String keyword;

    private String brandName;

    private String categoryName;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;
}
