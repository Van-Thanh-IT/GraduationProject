package com.example.backend.service;

import java.math.BigDecimal;
import java.util.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.backend.dto.request.AiSearchCriteria;
import com.example.backend.dto.request.ProductAttributeValueRequest;
import com.example.backend.dto.request.ProductRequest;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.admin.ProductResponse;
import com.example.backend.dto.response.admin.ProductAttributeValueResponse;
import com.example.backend.dto.response.client.AiProductResult;
import com.example.backend.dto.response.client.ProductCardResponse;
import com.example.backend.dto.response.client.ProductDetailResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.ProductStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.FlashSaleMapper;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.*;
import com.example.backend.repository.projection.ProductCardProjection;
import com.example.backend.repository.projection.RatingProjection;
import com.example.backend.utils.SlugUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository variantRepository;
    private final BrandRepository brandRepository;
    private final CategoryRepository categoryRepository;
    private final ProductAttributeValueRepository productAttributeValueRepository;
    private final AttributeRepository attributeRepository;
    private final FlashSaleService flashSaleService;

    private final ProductMapper productMapper;
    private final FlashSaleMapper flashSaleMapper;

    @Transactional(readOnly = true)
    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll().stream()
                .map(productMapper::toProductResponse)
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {

        validateOptions(request);

        if (productRepository.existsByName(request.getName())) {
            throw new CustomException(ErrorCode.PRODUCT_NAME_EXISTS);
        }

        String slug = SlugUtil.generateUniqueSlug(request.getName(), productRepository::existsBySlug);

        Product product = productMapper.toProduct(request);
        product.setSlug(slug);

        product.setSlug(slug);
        product.setStatus(ProductStatus.ACTIVE);

        setBrandAndCategory(product, request);

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request) {

        Product product = getProductByIdOrThrow(id);

        validateOptions(request);

        if (request.getName() != null && !request.getName().equals(product.getName())) {
            if (productRepository.existsByNameAndIdNot(request.getName(), id)) {
                throw new CustomException(ErrorCode.PRODUCT_NAME_EXISTS);
            }
            product.setSlug(SlugUtil.generateUniqueSlug(request.getName(), productRepository::existsBySlug));
        }

        productMapper.updateProduct(product, request);

        setBrandAndCategory(product, request);

        return productMapper.toProductResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProductStatus(Integer id, ProductStatus status) {
        Product product = getProductByIdOrThrow(id);
        product.setStatus(status);
        return productMapper.toProductResponse(product);
    }

    public List<ProductAttributeValueResponse> getAttributesByProductId(Integer productId) {
        return productAttributeValueRepository.findByProductId(productId).stream()
                .map(productMapper::toAttributeValueponse)
                .toList();
    }

    @Transactional
    public ProductAttributeValueResponse CreateProductAttributeValue(
            Integer productId, ProductAttributeValueRequest request) {

        Product product = getProductByIdOrThrow(productId);

        Attribute attribute = attributeRepository
                .findById(request.getAttributeId())
                .orElseThrow(() -> new CustomException(ErrorCode.ATTRIBUTE_NOT_FOUND));

        if (productAttributeValueRepository.existsByProductIdAndAttributeId(productId, request.getAttributeId())) {
            throw new CustomException(ErrorCode.PRODUCT_ATTRIBUTE_EXISTS);
        }

        ProductAttributeValue attributeValue = ProductAttributeValue.builder()
                .product(product)
                .attribute(attribute)
                .value(request.getValue())
                .build();

        return productMapper.toAttributeValueponse(productAttributeValueRepository.save(attributeValue));
    }

    @Transactional
    public ProductAttributeValueResponse updateProductAttributeValue(Integer id, ProductAttributeValueRequest request) {

        ProductAttributeValue attributeValue = productAttributeValueRepository
                .findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_ATTRIBUTE_NOT_FOUND));

        if (!attributeValue.getAttribute().getId().equals(request.getAttributeId())) {

            boolean exists = productAttributeValueRepository.existsByProductIdAndAttributeIdAndIdNot(
                    attributeValue.getProduct().getId(), request.getAttributeId(), id);

            if (exists) {
                throw new CustomException(ErrorCode.PRODUCT_ATTRIBUTE_EXISTS);
            }

            Attribute attribute = attributeRepository
                    .findById(request.getAttributeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy định nghĩa thông số!"));

            attributeValue.setAttribute(attribute);
        }

        attributeValue.setValue(request.getValue());

        return productMapper.toAttributeValueponse(productAttributeValueRepository.save(attributeValue));
    }

    @Transactional
    public void deleteProductAttributeValue(Integer id) {
        ProductAttributeValue attributeValue = productAttributeValueRepository
                .findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_ATTRIBUTE_NOT_FOUND));

        productAttributeValueRepository.delete(attributeValue);
    }

    private Product getProductByIdOrThrow(Integer id) {
        return productRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private void validateOptions(ProductRequest request) {
        Set<String> options = new HashSet<>();

        if (StringUtils.hasText(request.getOption1Name())) {
            options.add(request.getOption1Name().trim().toLowerCase());
        }

        if (StringUtils.hasText(request.getOption2Name())
                && !options.add(request.getOption2Name().trim().toLowerCase())) {
            throw new CustomException(ErrorCode.PRODUCT_OPTION_DUPLICATE);
        }

        if (StringUtils.hasText(request.getOption3Name())
                && !options.add(request.getOption3Name().trim().toLowerCase())) {
            throw new CustomException(ErrorCode.PRODUCT_OPTION_DUPLICATE);
        }

        if (!StringUtils.hasText(request.getOption1Name())) request.setOption1Name(null);
        if (!StringUtils.hasText(request.getOption2Name())) request.setOption2Name(null);
        if (!StringUtils.hasText(request.getOption3Name())) request.setOption3Name(null);
    }

    private void setBrandAndCategory(Product product, ProductRequest request) {

        if (request.getBrandId() != null) {
            Brand brand = brandRepository
                    .findById(request.getBrandId())
                    .orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository
                    .findById(request.getCategoryId())
                    .orElseThrow(() -> new CustomException(ErrorCode.CATEGORY_NOT_FOUND));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
    }

    public PageResponse<ProductCardResponse> getShopProducts(
            String keyword,
            String categorySlug,
            String brandSlug,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            String sortBy,
            boolean isFlashSale,
            int page,
            int limit) {

        Pageable pageable = PageRequest.of(page - 1, limit);
        String sqlSortBy = sortBy != null ? sortBy.toLowerCase() : "newest";

        Page<ProductCardProjection> projectionPage = productRepository.searchAndFilterProducts(
                keyword, categorySlug, brandSlug, minPrice, maxPrice, sqlSortBy, isFlashSale, pageable);

        List<Integer> variantIds = projectionPage.getContent().stream()
                .map(ProductCardProjection::getDefaultVariantId)
                .toList();

        Map<Integer, FlashSale> activeFlashSales = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        List<ProductCardResponse> dtoList = projectionPage.getContent().stream()
                .map(p -> {
                    ProductCardResponse dto = productMapper.toProductCard(p);
                    FlashSale sale = activeFlashSales.get(p.getDefaultVariantId());
                    if (sale != null) {
                        dto.setFlashSale(flashSaleMapper.toFlashSaleInfo(sale, p.getOriginalPrice()));
                    }
                    return dto;
                })
                .toList();

        return PageResponse.<ProductCardResponse>builder()
                .items(dtoList)
                .currentPage(page)
                .totalPages(projectionPage.getTotalPages())
                .totalElements(projectionPage.getTotalElements())
                .hasNext(projectionPage.hasNext())
                .build();
    }

    public ProductDetailResponse getProductDetailBySlug(String slug) {
        Product product = productRepository
                .findDetailBySlug(slug)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));

        Integer productId = product.getId();

        RatingProjection ratingObj = productRepository.getProductRating(productId);

        List<ProductDetailResponse.SpecDto> specs =
                productAttributeValueRepository.findSpecsByProductId(productId).stream()
                        .map(pav -> ProductDetailResponse.SpecDto.builder()
                                .name(pav.getAttribute().getName())
                                .value(pav.getValue())
                                .build())
                        .toList();

        List<ProductVariant> variants = variantRepository.findVariantsWithImagesByProductId(productId);

        List<Integer> variantIds = variants.stream().map(ProductVariant::getId).toList();

        Map<Integer, FlashSale> activeFlashSales = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        List<ProductDetailResponse.VariantDto> variantDtos = variants.stream()
                .map(v -> {
                    ProductDetailResponse.VariantDto.VariantDtoBuilder variantBuilder =
                            ProductDetailResponse.VariantDto.builder()
                                    .id(v.getId())
                                    .sku(v.getSku())
                                    .option1Value(v.getOption1Value())
                                    .option2Value(v.getOption2Value())
                                    .option3Value(v.getOption3Value())
                                    .price(v.getPrice())
                                    .originalPrice(v.getOriginalPrice())
                                    .stockQuantity(v.getStockQuantity())
                                    .isDefault(v.getIsDefault())
                                    .images(v.getImages().stream()
                                            .map(img -> ProductDetailResponse.ImageDto.builder()
                                                    .id(img.getId())
                                                    .imageUrl(img.getImageUrl())
                                                    .isThumbnail(img.getIsThumbnail())
                                                    .build())
                                            .toList());

                    FlashSale sale = activeFlashSales.get(v.getId());
                    if (sale != null) {
                        variantBuilder.flashSale(flashSaleMapper.toFlashSaleInfo(sale, v.getOriginalPrice()));
                    }
                    return variantBuilder.build();
                })
                .toList();

        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .warrantyPeriod(product.getWarrantyPeriod())
                .description(product.getDescription())
                .thumbnail(product.getThumbnail())
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .categoryName(
                        product.getCategory() != null ? product.getCategory().getName() : null)
                .totalReviews(ratingObj.getTotalReviews().intValue())
                .averageRating(Math.round(ratingObj.getAvgRating() * 10.0) / 10.0)
                .option1Name(product.getOption1Name())
                .option2Name(product.getOption2Name())
                .option3Name(product.getOption3Name())
                .variants(variantDtos)
                .specifications(specs)
                .build();
    }

    /**
     * Hàm dành riêng cho AI Chatbot tìm kiếm 1 sản phẩm duy nhất
     */
    public AiProductResult findBestProductContextForAI(AiSearchCriteria criteria) {

        String safeKeyword =
                (criteria.getKeyword() != null && !criteria.getKeyword().isBlank())
                        ? "%" + criteria.getKeyword().trim() + "%"
                        : "%";
        String safeBrandName =
                (criteria.getBrandName() != null && !criteria.getBrandName().isBlank())
                        ? "%" + criteria.getBrandName().trim() + "%"
                        : "%";
        String safeCategoryName = (criteria.getCategoryName() != null
                        && !criteria.getCategoryName().isBlank())
                ? "%" + criteria.getCategoryName().trim() + "%"
                : "%";



        BigDecimal finalMin = criteria.getMinPrice();
        BigDecimal finalMax = criteria.getMaxPrice();


        /**
         * Chuẩn hóa khoảng giá từ dữ liệu AI phân tích.
         *
         * <p>Trường hợp 1: AI nhận diện giá cố định (min == max).
         * Ví dụ: "30 triệu"
         * → Mở rộng khoảng giá với biên độ ±10% để tăng khả năng tìm kiếm:
         *   30tr → [27tr, 33tr]
         *
         * <p>Trường hợp 2: Chỉ có maxPrice (ví dụ: "tầm 30 triệu đổ lại").
         * → Giảm xuống 15% để tạo khoảng tìm kiếm hợp lý:
         *   max = 30tr → [25.5tr, 30tr]
         */
        if (finalMin != null && finalMax != null && finalMin.compareTo(finalMax) == 0) {
            BigDecimal margin = finalMax.multiply(new BigDecimal("0.1"));
            finalMin = finalMin.subtract(margin);
            finalMax = finalMax.add(margin);
        }
        else if (finalMax != null && finalMin == null) {
            BigDecimal margin = finalMax.multiply(new BigDecimal("0.15"));
            finalMin = finalMax.subtract(margin);
        }


        log.info("SQL Sẽ chạy với: Keyword={}, MinPrice={}, MaxPrice={}", safeKeyword, finalMin, finalMax);

        Optional<ProductCardProjection> productOpt = productRepository.findBestMatchProductForAI(
                safeKeyword, safeBrandName, safeCategoryName, finalMin, finalMax);

        if (productOpt.isEmpty()) {
            return new AiProductResult(
                    "Hệ thống kiểm tra kho và KHÔNG TÌM THẤY sản phẩm nào khớp với yêu cầu. Hãy xin lỗi khách hàng và khéo léo gợi ý họ đổi tiêu chí tìm kiếm (ví dụ đổi khoảng giá hoặc hãng khác).",
                    null);
        }

        ProductCardProjection p = productOpt.get();

        String contextText = """
        === KẾT QUẢ TÌM KIẾM TỪ HỆ THỐNG ===
        Tìm thấy 1 sản phẩm phù hợp nhất với yêu cầu:
        - Tên sản phẩm: %s
        - Giá bán hiện tại: %,.0f VNĐ
        - Giá gốc (chưa giảm): %,.0f VNĐ
        - Thông số / Tùy chọn: %s
        - Lượt bán đã chốt thành công: %d chiếc (Đây là sản phẩm uy tín, được nhiều người mua)
        ======================================
        YÊU CẦU:
        Hãy dùng chính xác các thông tin trên (đặc biệt là Tên và Giá bán) để tư vấn cho khách.
        Nói chuyện tự nhiên, thuyết phục và kêu gọi khách chốt đơn.
        """
                .formatted(
                        p.getName(),
                        p.getPrice(),
                        p.getOriginalPrice() != null ? p.getOriginalPrice() : p.getPrice(),
                        p.getSpecsStr() != null ? p.getSpecsStr() : "Bản tiêu chuẩn",
                        p.getReviewCount() != null ? p.getReviewCount() : 0
                );

        return new AiProductResult(contextText, p);
    }
}
