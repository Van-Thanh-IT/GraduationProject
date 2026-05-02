package com.example.backend.service;

import com.example.backend.dto.response.client.*;
import com.example.backend.entity.Category;
import com.example.backend.entity.FlashSale;
import com.example.backend.mapper.HomeMapper;
import com.example.backend.repository.BrandRepository;
import com.example.backend.repository.CategoryRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.repository.projection.ProductCardProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final ProductRepository productRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final FlashSaleService flashSaleService;
    private final HomeMapper homeMapper;

    //    @Cacheable(value = "home", key = "'homepage'")
    public HomeResponse getHomePageData() {

        // 1. Lấy danh sách Bán chạy nhất từ DB trước
        List<ProductCardProjection> bestSellerProjections = productRepository.getBestSellers();
        List<ProductCardResponse> bestSellers = processProducts(bestSellerProjections);

        // 2. Gom tất cả ID của sản phẩm bán chạy để LÀM ĐIỀU KIỆN LOẠI TRỪ
        Set<Integer> excludedIds = bestSellers.stream()
                .map(ProductCardResponse::getId)
                .collect(Collectors.toSet());

        // Chống lỗi SQL Syntax: Nếu DB chưa có best seller nào (Set rỗng), thêm ID ảo -1
        if (excludedIds.isEmpty()) {
            excludedIds.add(-1);
        }

        // 3. Lấy Default Products, TRUYỀN Set ID VÀO ĐỂ BỎ QUA CÁC SẢN PHẨM ĐÃ LẤY Ở TRÊN
        List<ProductCardProjection> defaultProjections = productRepository.getDefaultProducts(excludedIds);
        List<ProductCardResponse> defaultProducts = processProducts(defaultProjections);

        // 4. Lọc mảng Flash Sale chung từ cả 2 list trên
        Map<Integer, ProductCardResponse> flashSaleMap = Stream.concat(bestSellers.stream(), defaultProducts.stream())
                .filter(p -> p.getFlashSale() != null)
                .collect(Collectors.toMap(ProductCardResponse::getId, p -> p, (existing, rep) -> existing));

        // 5. Build Response: Loại bỏ những sản phẩm đã hiển thị ở Flash Sale ra khỏi các list khác
        return HomeResponse.builder()
                .brands(brandRepository.findAllActiveBrands().stream().map(homeMapper::toBrandDto).toList())
                .categories(buildCategoryTree())
                .flashSales(new ArrayList<>(flashSaleMap.values()))
                .bestSellers(bestSellers.stream().filter(p -> !flashSaleMap.containsKey(p.getId())).toList())
                .defaultProducts(defaultProducts.stream().filter(p -> !flashSaleMap.containsKey(p.getId())).toList())
                .build();
    }

    // Luồng xử lý Gán Flash Sale vào Product (Giữ nguyên)
    private List<ProductCardResponse> processProducts(List<ProductCardProjection> projections) {
        if (projections == null || projections.isEmpty()) return Collections.emptyList();

        List<Integer> variantIds = projections.stream().map(ProductCardProjection::getId).toList();
        Map<Integer, FlashSale> activeSalesMap = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        return projections.stream().map(p -> {
            ProductCardResponse dto = homeMapper.toProductCard(p);
            FlashSale sale = activeSalesMap.get(p.getId());
            if (sale != null) {
                dto.setFlashSale(homeMapper.toFlashSaleInfo(sale, p.getOriginalPrice()));
            }
            return dto;
        }).toList();
    }

    // Đệ quy Cây danh mục (Giữ nguyên)
    private List<CategoryClientResponse> buildCategoryTree() {
        List<Category> allCategories = categoryRepository.findAllActiveCategories();
        Map<Integer, CategoryClientResponse> dtoMap = allCategories.stream()
                .collect(Collectors.toMap(Category::getId, c ->
                        CategoryClientResponse.builder()
                                .id(c.getId())
                                .name(c.getName())
                                .slug(c.getSlug())
                                .imageUrl(c.getImageUrl())
                                .children(new ArrayList<>())
                                .build()));

        List<CategoryClientResponse> roots = new ArrayList<>();
        allCategories.forEach(c -> {
            if (c.getParent() == null) roots.add(dtoMap.get(c.getId()));
            else Optional.ofNullable(dtoMap
                            .get(c.getParent()
                                    .getId()))
                    .ifPresent(parent -> parent
                            .getChildren()
                            .add(dtoMap.get(c.getId())));
        });
        return roots;
    }
}