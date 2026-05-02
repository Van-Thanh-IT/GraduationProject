package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class HomeResponse {
    private List<BrandClientResponse> brands;
    private List<CategoryClientResponse> categories;
    private List<ProductCardResponse> flashSales;
    private List<ProductCardResponse> bestSellers;
    private List<ProductCardResponse> defaultProducts;
}