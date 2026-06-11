package com.example.backend.dto.response.client;

import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class HomeResponse {
    private List<ClientBrandResponse> brands;
    private List<CategoryResponse> categories;
    private List<ProductCardResponse> flashSales;
    private List<ProductCardResponse> bestSellers;
    private List<ProductCardResponse> defaultProducts;
}
