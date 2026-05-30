package com.example.backend.service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import lombok.extern.slf4j.Slf4j;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import com.example.backend.dto.response.client.*;
import com.example.backend.entity.FlashSale;
import com.example.backend.mapper.BrandMapper;
import com.example.backend.mapper.FlashSaleMapper;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.BrandRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.projection.ProductCardProjection;

import lombok.RequiredArgsConstructor;
@Slf4j
@Service
@RequiredArgsConstructor

public class HomeService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final FlashSaleService flashSaleService;

    private final BrandMapper brandMapper;
    private final ProductMapper productMapper;
    private final FlashSaleMapper flashSaleMapper;

    @Cacheable(value = "homePageData", key = "'default'")
    public HomeResponse getHomePageData() {

        List<ProductCardProjection> bestSellerProjections = productRepository.getBestSellers();
        List<ProductCardResponse> bestSellers = processProducts(bestSellerProjections);

        Set<Integer> excludedIds =
                bestSellers.stream().map(ProductCardResponse::getId).collect(Collectors.toSet());

        if (excludedIds.isEmpty()) {
            excludedIds.add(-1);
        }

        List<ProductCardProjection> defaultProjections = productRepository.getDefaultProducts(excludedIds);
        List<ProductCardResponse> defaultProducts = processProducts(defaultProjections);

        Map<Integer, ProductCardResponse> flashSaleMap = Stream.concat(bestSellers.stream(), defaultProducts.stream())
                .filter(p -> p.getFlashSale() != null)
                .collect(Collectors.toMap(ProductCardResponse::getId, p -> p, (existing, rep) -> existing));

        return HomeResponse.builder()
                .brands(brandRepository.findAllActiveBrands().stream()
                        .map(brandMapper::toClientBrandResponse)
                        .toList())
                .categories(getFlatCategories())
                .flashSales(new ArrayList<>(flashSaleMap.values()))
                .bestSellers(bestSellers.stream()
                        .filter(p -> !flashSaleMap.containsKey(p.getId()))
                        .toList())
                .defaultProducts(defaultProducts.stream()
                        .filter(p -> !flashSaleMap.containsKey(p.getId()))
                        .toList())
                .build();
    }

    private List<ProductCardResponse> processProducts(List<ProductCardProjection> projections) {
        if (projections == null || projections.isEmpty()) return Collections.emptyList();

        List<Integer> variantIds = projections.stream()
                .map(ProductCardProjection::getDefaultVariantId)
                .toList();

        Map<Integer, FlashSale> activeSalesMap = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        return projections.stream()
                .map(p -> {
                    ProductCardResponse dto = productMapper.toProductCard(p);
                    FlashSale sale = activeSalesMap.get(p.getDefaultVariantId());
                    if (sale != null) {
                        dto.setFlashSale(flashSaleMapper.toFlashSaleInfo(sale, p.getOriginalPrice()));
                    }
                    return dto;
                })
                .toList();
    }

    @CacheEvict(value = "homePageData", allEntries = true)
    @Scheduled(fixedRateString = "180000")
    public void clearHomePageCache() {
        log.info("Đã dọn dẹp Cache trang chủ để cập nhật dữ liệu mới!");
    }

    private List<CategoryResponse> getFlatCategories() {
        return categoryRepository.findAllActiveCategories().stream()
                .map(c -> CategoryResponse.builder()
                        .id(c.getId())
                        .name(c.getName())
                        .slug(c.getSlug())
                        .imageUrl(c.getImageUrl())
                        .parentId(c.getParent() != null ? c.getParent().getId() : null)
                        .build())
                .toList();
    }
}
