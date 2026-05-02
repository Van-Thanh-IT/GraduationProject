package com.example.backend.controller.client;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.client.ProductCardResponse;
import com.example.backend.dto.response.client.ProductDetailResponse;
import com.example.backend.dto.response.client.ReviewClientResponse;
import com.example.backend.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/public/products")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;


    @GetMapping
    public APIResponse<PageResponse<ProductCardResponse>> getShopProducts(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String categorySlug,
            @RequestParam(required = false) String brandSlug,
            @RequestParam(required = false) BigDecimal minPrice,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "newest") String sortBy,
            @RequestParam(defaultValue = "false") boolean isFlashSale, // <-- Thêm dòng này
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {

        PageResponse<ProductCardResponse> response = productService.getShopProducts(
                keyword, categorySlug, brandSlug, minPrice, maxPrice, sortBy, isFlashSale, page, limit
        );

        return APIResponse.<PageResponse<ProductCardResponse>>builder()
                .code(200)
                .data(response)
                .build();
    }

    @GetMapping("/{slug}")
    public APIResponse<ProductDetailResponse> getProductDetail(@PathVariable String slug) {
        return APIResponse.success(productService.getProductDetail(slug));
    }

//    @GetMapping("/{productId}/reviews")
//    public APIResponse<PageResponse<ReviewClientResponse>> getProductReviews(
//            @PathVariable Integer productId,
//            @RequestParam(defaultValue = "newest") String sortBy,
//            @RequestParam(defaultValue = "1") int page,
//            @RequestParam(defaultValue = "5") int limit) {
//
//        PageResponse<ReviewClientResponse> response = productService.getProductReviews(productId, sortBy, page, limit);
//
//        return APIResponse.success(response);
//    }
}