package com.example.backend.dto.request;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class AiSearchCriteria {
    private String intent; // SEARCH, SYSTEM, CHAT, NAVIGATION
    private String keyword;
    private String brandName;
    private String categoryName;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
}