package com.example.backend.dto.response.client;

import com.fasterxml.jackson.annotation.JsonInclude; // <--- Import cái này
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data @Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ProductCardResponse {
    private Integer id;
    private String name;
    private String slug;
    private String thumbnail;
    private BigDecimal price;
    private BigDecimal originalPrice;
    private Double rating;
    private Integer reviewCount;
    private Integer stockQuantity;
    private Integer soldCount;
    private Boolean isNew;
    private List<String> specs;
    private FlashSaleInfo flashSale;

}