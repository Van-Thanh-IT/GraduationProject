package com.example.backend.dto.request;

import java.math.BigDecimal;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class AiSearchCriteria {
    private Boolean isVague;

    private String clarifyMessage;

    private String intent;

    private String keyword;

    private String brandName;

    private String categoryName;

    private BigDecimal minPrice;

    private BigDecimal maxPrice;
}
