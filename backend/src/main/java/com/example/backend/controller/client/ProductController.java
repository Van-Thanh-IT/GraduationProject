package com.example.backend.controller.client;

import java.math.BigDecimal;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.client.ProductCardResponse;
import com.example.backend.dto.response.client.ProductDetailResponse;
import com.example.backend.service.ProductService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    @GetMapping
    public APIResponse<PageResponse<ProductCardResponse>> getShopProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String brand,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "false") boolean isFlashSale,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        PageResponse<ProductCardResponse> response = productService.getShopProducts(
                keyword, category, brand, minPrice, maxPrice, sortBy, isFlashSale, page, limit);

        return APIResponse.<PageResponse<ProductCardResponse>>builder()
                .code(200)
                .data(response)
                .build();
    }

    @GetMapping("/{slug}")
    public APIResponse<ProductDetailResponse> getProductDetail(@PathVariable String slug) {
        return APIResponse.success(productService.getProductDetailBySlug(slug));
    }
}
