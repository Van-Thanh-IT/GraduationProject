package com.example.backend.service;

import com.example.backend.dto.request.AiSearchCriteria;
import com.example.backend.dto.request.ProductAttributeValueRequest;
import com.example.backend.dto.request.ProductRequest;
import com.example.backend.dto.response.AiProductResult;
import com.example.backend.dto.response.PageResponse;
import com.example.backend.dto.response.ProductAttributeValueResponse;
import com.example.backend.dto.response.ProductResponse;
import com.example.backend.dto.response.client.FlashSaleInfo;
import com.example.backend.dto.response.client.ProductDetailResponse;
import com.example.backend.dto.response.client.ProductCardResponse;
import com.example.backend.dto.response.client.ReviewClientResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.ProductStatus;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.*;
import com.example.backend.repository.projection.ProductCardProjection;
import com.example.backend.repository.projection.ReviewProjection;
import com.example.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

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
    private final ReviewRepository reviewRepository;
    private final ProductMapper productMapper;
    private final FlashSaleService flashSaleService;

    public List<ProductResponse> getAllProducts() {
        return productRepository.findAll()
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional
    public ProductResponse createProduct(ProductRequest request) {

        validateOptions(request);

        String slug = SlugUtil.toSlug(request.getName());

        validateDuplicateProduct(request.getName(), slug);

        Product product = productMapper.toEntity(request);
        product.setSlug(slug);
        product.setStatus(ProductStatus.ACTIVE);

        setBrandAndCategory(product, request);

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProduct(Integer id, ProductRequest request) {

        Product product = findProduct(id);

        validateOptions(request);

        if (!request.getName().equals(product.getName())) {
            String newSlug = SlugUtil.toSlug(request.getName());
            validateDuplicateProduct(request.getName(), newSlug);
            product.setSlug(newSlug);
        }

        productMapper.updateEntity(product, request);

        setBrandAndCategory(product, request);

        return productMapper.toResponse(productRepository.save(product));
    }

    @Transactional
    public ProductResponse updateProductStatus(Integer id, ProductStatus status) {
        Product product = findProduct(id);
        product.setStatus(status);
        return productMapper.toResponse(productRepository.save(product));
    }

    public List<ProductAttributeValueResponse> getAttributesByProductId(Integer productId) {
        return productAttributeValueRepository.findByProductId(productId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    @Transactional
    public ProductAttributeValueResponse addAttributeToProduct(Integer productId, ProductAttributeValueRequest request) {

        Product product = findProduct(productId);

        Attribute attribute = attributeRepository.findById(request.getAttributeId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy định nghĩa thông số kỹ thuật!"));

        if (productAttributeValueRepository.existsByProductIdAndAttributeId(productId, request.getAttributeId())) {
            throw new RuntimeException("Sản phẩm đã có thông số này!");
        }

        ProductAttributeValue attributeValue = ProductAttributeValue.builder()
                .product(product)
                .attribute(attribute)
                .value(request.getValue())
                .build();

        return productMapper.toResponse(productAttributeValueRepository.save(attributeValue));
    }

    @Transactional
    public ProductAttributeValueResponse updateProductAttribute(Integer id, ProductAttributeValueRequest request) {

        ProductAttributeValue attributeValue = productAttributeValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giá trị thông số!"));

        if (!attributeValue.getAttribute().getId().equals(request.getAttributeId())) {

            boolean exists = productAttributeValueRepository
                    .existsByProductIdAndAttributeIdAndIdNot(
                            attributeValue.getProduct().getId(),
                            request.getAttributeId(),
                            id
                    );

            if (exists) {
                throw new RuntimeException("Thông số này đã tồn tại!");
            }

            Attribute attribute = attributeRepository.findById(request.getAttributeId())
                    .orElseThrow(() -> new RuntimeException("Không tìm thấy định nghĩa thông số!"));

            attributeValue.setAttribute(attribute);
        }

        attributeValue.setValue(request.getValue());

        return productMapper.toResponse(productAttributeValueRepository.save(attributeValue));
    }

    @Transactional
    public void deleteProductAttribute(Integer id) {
        ProductAttributeValue attributeValue = productAttributeValueRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy giá trị thông số!"));

        productAttributeValueRepository.delete(attributeValue);
    }


    //PRIVATE METHODS

    private Product findProduct(Integer id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));
    }

    private void validateDuplicateProduct(String name, String slug) {
        if (productRepository.existsByName(name)) {
            throw new RuntimeException("Tên sản phẩm đã tồn tại!");
        }

        if (productRepository.existsBySlug(slug)) {
            throw new RuntimeException("Slug sản phẩm đã tồn tại!");
        }
    }

    private void validateOptions(ProductRequest request) {
        Set<String> options = new HashSet<>();

        // Kiểm tra option 1
        if (StringUtils.hasText(request.getOption1Name())) {
            options.add(request.getOption1Name().trim().toLowerCase());
        }

        // Kiểm tra option 2
        if (StringUtils.hasText(request.getOption2Name())) {
            if (!options.add(request.getOption2Name().trim().toLowerCase())) {
                throw new RuntimeException("Phân loại sản phẩm không được trùng nhau!");
            }
        }

        // Kiểm tra option 3
        if (StringUtils.hasText(request.getOption3Name())) {
            if (!options.add(request.getOption3Name().trim().toLowerCase())) {
                throw new RuntimeException("Phân loại sản phẩm không được trùng nhau!");
            }
        }

        // (Tùy chọn thêm): Chuẩn hóa dữ liệu rỗng thành null để DB lưu cho sạch
        if (!StringUtils.hasText(request.getOption1Name())) request.setOption1Name(null);
        if (!StringUtils.hasText(request.getOption2Name())) request.setOption2Name(null);
        if (!StringUtils.hasText(request.getOption3Name())) request.setOption3Name(null);
    }

    private void setBrandAndCategory(Product product, ProductRequest request) {

        if (request.getBrandId() != null) {
            Brand brand = brandRepository.findById(request.getBrandId())
                    .orElseThrow(() -> new RuntimeException("Thương hiệu không tồn tại!"));
            product.setBrand(brand);
        } else {
            product.setBrand(null);
        }

        if (request.getCategoryId() != null) {
            Category category = categoryRepository.findById(request.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Danh mục không tồn tại!"));
            product.setCategory(category);
        } else {
            product.setCategory(null);
        }
    }

     ///PRODUCT CLIENT
     public PageResponse<ProductCardResponse> getShopProducts(
             String keyword, String categorySlug, String brandSlug,
             BigDecimal minPrice, BigDecimal maxPrice,
             String sortBy, boolean isFlashSale, int page, int limit) { // <-- 1. THÊM THAM SỐ isFlashSale

         Pageable pageable = PageRequest.of(page - 1, limit);
         String sqlSortBy = sortBy != null ? sortBy.toLowerCase() : "newest";

         // 2. Bơm đầy đủ tham số xuống DB (bao gồm cả isFlashSale)
         Page<ProductCardProjection> projectionPage = productRepository.searchAndFilterProducts(
                 keyword, categorySlug, brandSlug, minPrice, maxPrice, sqlSortBy, isFlashSale, pageable
         );

         // 3. Lấy danh sách ID để tra cứu Flash Sale đang hoạt động
         List<Integer> variantIds = projectionPage.getContent().stream()
                 .map(ProductCardProjection::getId)
                 .collect(Collectors.toList());

         Map<Integer, FlashSale> activeFlashSales = flashSaleService.getActiveFlashSalesForVariants(variantIds);

         // 4. Map dữ liệu sang DTO
         List<ProductCardResponse> dtoList = projectionPage.getContent().stream().map(p -> {
             List<String> specsList = p.getSpecsStr() != null && !p.getSpecsStr().trim().isEmpty()
                     ? Arrays.asList(p.getSpecsStr().split(",\\s*")) : null;

             ProductCardResponse dto = ProductCardResponse.builder()
                     .id(p.getId())
                     .name(p.getName())
                     .slug(p.getSlug())
                     .thumbnail(p.getThumbnail())
                     .price(p.getPrice())
                     .originalPrice(p.getOriginalPrice())
                     .rating(p.getRating() != null ? Math.round(p.getRating() * 10.0) / 10.0 : 0.0)
                     .reviewCount(p.getReviewCount() != null ? p.getReviewCount() : 0)
                     .soldCount(p.getSoldCount() != null ? p.getSoldCount() : 0)
                     .stockQuantity(p.getStockQuantity())
                     .isNew(p.getIsNew() != null && p.getIsNew() == 1)
                     .specs(specsList)
                     .build();

             // 5. NẾU SẢN PHẨM CÓ FLASH SALE -> GÁN THÊM THÔNG TIN VÀO DTO
             FlashSale sale = activeFlashSales.get(p.getId());
             if (sale != null) {
                 dto.setFlashSale(FlashSaleInfo.builder()
                         .flashSaleId(sale.getId())
                         .flashSalePrice(sale.getFlashSalePrice())
                         .discountPercentage(calculateDiscount(p.getOriginalPrice(), sale.getFlashSalePrice()))
                         .endTime(sale.getEndTime().toString())
                         .saleStockQuantity(sale.getSaleStockQuantity())
                         .soldQuantity(sale.getSoldQuantity())
                         .isActiveNow(true)
                         .build());
             }

             return dto;
         }).collect(Collectors.toList());

         return PageResponse.<ProductCardResponse>builder()
                 .items(dtoList)
                 .currentPage(page)
                 .totalPages(projectionPage.getTotalPages())
                 .totalElements(projectionPage.getTotalElements())
                 .hasNext(projectionPage.hasNext())
                 .build();
     }


    public ProductDetailResponse getProductDetail(String slug) {
        // 1. Lấy thông tin sản phẩm gốc
        Product product = productRepository.findDetailBySlug(slug)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm hoặc đã bị ẩn!"));

        Integer productId = product.getId();

        // 2. Lấy Đánh giá (Rating)
        ProductRepository.RatingProjection ratingObj = productRepository.getProductRating(productId);

        // 3. Lấy Thông số kỹ thuật
        List<ProductDetailResponse.SpecDto> specs = productAttributeValueRepository.findSpecsByProductId(productId)
                .stream().map(pav -> ProductDetailResponse.SpecDto.builder()
                        .name(pav.getAttribute().getName())
                        .value(pav.getValue())
                        .build())
                .collect(Collectors.toList());

        // 4. Lấy Biến thể & Hình ảnh
        List<ProductVariant> variants = variantRepository.findVariantsWithImagesByProductId(productId);

        // --- PHẦN MỚI: LẤY FLASH SALE TỐI ƯU ---
        // Lấy ID của tất cả các biến thể
        List<Integer> variantIds = variants.stream().map(ProductVariant::getId).collect(Collectors.toList());

        // Lấy Map chứa Flash Sale đang hoạt động (key = variantId, value = FlashSale)
        // Cần tạo hàm này trong FlashSaleService (xem hướng dẫn bên dưới)
        Map<Integer, FlashSale> activeFlashSales = flashSaleService.getActiveFlashSalesForVariants(variantIds);
        // ----------------------------------------

        List<ProductDetailResponse.VariantDto> variantDtos = variants.stream().map(v -> {

            // Tạo builder cho VariantDto
            ProductDetailResponse.VariantDto.VariantDtoBuilder variantBuilder = ProductDetailResponse.VariantDto.builder()
                    .id(v.getId())
                    .sku(v.getSku())
                    .option1Value(v.getOption1Value())
                    .option2Value(v.getOption2Value())
                    .option3Value(v.getOption3Value())
                    .price(v.getPrice())
                    .originalPrice(v.getOriginalPrice())
                    .stockQuantity(v.getStockQuantity())
                    .isDefault(v.getIsDefault())
                    .images(v.getImages().stream().map(img ->
                            ProductDetailResponse.ImageDto.builder()
                                    .id(img.getId())
                                    .imageUrl(img.getImageUrl())
                                    .isThumbnail(img.getIsThumbnail())
                                    .build()
                    ).collect(Collectors.toList()));

            // Ánh xạ Flash Sale nếu biến thể này đang được sale
            FlashSale sale = activeFlashSales.get(v.getId());
            if (sale != null) {
                variantBuilder.flashSale(FlashSaleInfo.builder()
                        .flashSalePrice(sale.getFlashSalePrice())
                        // Tính phần trăm giảm giá. Cần thêm hàm calculateDiscount() trong class này nếu chưa có
                        .discountPercentage(calculateDiscount(v.getPrice(), sale.getFlashSalePrice()))
                        .endTime(sale.getEndTime().toString())
                        .saleStockQuantity(sale.getSaleStockQuantity())
                        .soldQuantity(sale.getSoldQuantity())
                        .isActiveNow(true)
                        .build());

            }

            return variantBuilder.build();
        }).collect(Collectors.toList());

        // 5. Trả về DTO tổng
        return ProductDetailResponse.builder()
                .id(product.getId())
                .name(product.getName())
                .slug(product.getSlug())
                .warrantyPeriod(product.getWarrantyPeriod())
                .description(product.getDescription())
                .thumbnail(product.getThumbnail())

                // An toàn check null cho Brand và Category
                .brandName(product.getBrand() != null ? product.getBrand().getName() : null)
                .categoryName(product.getCategory() != null ? product.getCategory().getName() : null)
                .categorySlug(product.getCategory() != null ? product.getCategory().getSlug() : null)

                .averageRating(Math.round(ratingObj.getAvgRating() * 10.0) / 10.0)
                .totalReviews(ratingObj.getTotalReviews().intValue())

                .option1Name(product.getOption1Name())
                .option2Name(product.getOption2Name())
                .option3Name(product.getOption3Name())

                .variants(variantDtos)
                .specifications(specs)
                .build();
    }

    // Tiêm (Inject) ReviewRepository vào Service của bạn
    // private final ReviewRepository reviewRepository;

    public PageResponse<ReviewClientResponse> getProductReviews(
            Integer productId, String sortBy, int page, int limit) {

        // Validation cơ bản
        if (page < 1) page = 1;
        Pageable pageable = PageRequest.of(page - 1, limit);
        String sqlSortBy = sortBy != null ? sortBy.toLowerCase() : "newest";

        // Gọi DB
        Page<ReviewProjection> projectionPage = reviewRepository.getApprovedReviewsByProductId(
                productId, sqlSortBy, pageable
        );

        // Map sang DTO
        List<ReviewClientResponse> dtoList = projectionPage.getContent().stream()
                .map(r -> ReviewClientResponse.builder()
                        .id(r.getId())
                        // Che giấu một phần tên thật để bảo mật thông tin khách hàng (VD: Nguy*** Anh)
                        .customerName(maskCustomerName(r.getCustomerName()))
                        .customerAvatar(r.getCustomerAvatar())
                        .rating(r.getRating() != null ? r.getRating() : 5)
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();

        // Trả về cấu trúc phân trang chuẩn
        return PageResponse.<ReviewClientResponse>builder()
                .items(dtoList)
                .currentPage(page)
                .totalPages(projectionPage.getTotalPages())
                .totalElements(projectionPage.getTotalElements())
                .hasNext(projectionPage.hasNext())
                .build();
    }

    // (Helper) Hàm làm mờ tên khách hàng (Best Practice E-commerce)
    private String maskCustomerName(String name) {
        if (name == null || name.length() < 2) return "Khách hàng ẩn danh";
        String[] parts = name.trim().split(" ");
        if (parts.length == 1) return parts[0].charAt(0) + "***";
        return parts[0] + " *** " + parts[parts.length - 1]; // Trả về "Nguyễn *** Anh"
    }

    // Hàm hỗ trợ tính toán phần trăm giảm giá (nếu bạn chưa có)
    private Integer calculateDiscount(BigDecimal originalPrice, BigDecimal salePrice) {
        if (originalPrice == null || originalPrice.compareTo(BigDecimal.ZERO) == 0) return 0;
        return 100 - salePrice.multiply(new BigDecimal(100)).divide(originalPrice, BigDecimal.ROUND_HALF_UP).intValue();
    }

    /**
     * Hàm dành riêng cho AI Chatbot tìm kiếm 1 sản phẩm duy nhất
     */
    public AiProductResult findBestProductContextForAI(AiSearchCriteria criteria) {

        String safeKeyword = (criteria.getKeyword() != null && !criteria.getKeyword().isBlank())
                ? "%" + criteria.getKeyword().trim() + "%" : "%";
        String safeBrandName = (criteria.getBrandName() != null && !criteria.getBrandName().isBlank())
                ? "%" + criteria.getBrandName().trim() + "%" : "%";
        String safeCategoryName = (criteria.getCategoryName() != null && !criteria.getCategoryName().isBlank())
                ? "%" + criteria.getCategoryName().trim() + "%" : "%";

        // ==========================================
        // XỬ LÝ LOGIC "KHOẢNG GIÁ THÔNG MINH" (+/- 10%)
        // ==========================================
        BigDecimal finalMin = criteria.getMinPrice();
        BigDecimal finalMax = criteria.getMaxPrice();

        // Trường hợp 1: AI bắt được 1 mức giá cố định (Ví dụ: 30 củ)
        if (finalMin != null && finalMax != null && finalMin.compareTo(finalMax) == 0) {
            BigDecimal margin = finalMax.multiply(new BigDecimal("0.1")); // Dung sai 10%
            finalMin = finalMin.subtract(margin); // 30tr - 3tr = 27tr
            finalMax = finalMax.add(margin);      // 30tr + 3tr = 33tr
        }
        // Trường hợp 2: Khách nói "tầm 30 triệu đổ lại", AI chỉ lấy được maxPrice
        else if (finalMax != null && finalMin == null) {
            BigDecimal margin = finalMax.multiply(new BigDecimal("0.15")); // Xuống 15%
            finalMin = finalMax.subtract(margin); // Tìm từ 25.5tr đến 30tr
        }

        // In log ra để bạn dễ debug xem Java đã nới giá ra bao nhiêu
        log.info("🚀 SQL Sẽ chạy với: Keyword={}, MinPrice={}, MaxPrice={}", safeKeyword, finalMin, finalMax);

        // Gọi SQL với mức giá ĐÃ NỚI LỎNG
        Optional<ProductCardProjection> productOpt = productRepository.findBestMatchProductForAI(
                safeKeyword, safeBrandName, safeCategoryName, finalMin, finalMax
        );

        if (productOpt.isEmpty()) {
            return new AiProductResult(
                    "Hệ thống kiểm tra kho và KHÔNG TÌM THẤY sản phẩm nào khớp với yêu cầu. Hãy xin lỗi khách hàng và khéo léo gợi ý họ đổi tiêu chí tìm kiếm (ví dụ đổi khoảng giá hoặc hãng khác).",
                    null
            );
        }

        ProductCardProjection p = productOpt.get();

        String contextText = String.format(
                "=== KẾT QUẢ TÌM KIẾM TỪ HỆ THỐNG ===\n" +
                        "Tìm thấy 1 sản phẩm phù hợp nhất với yêu cầu:\n" +
                        "- Tên sản phẩm: %s\n" +
                        "- Giá bán hiện tại: %,.0f VNĐ\n" +
                        "- Giá gốc (chưa giảm): %,.0f VNĐ\n" +
                        "- Thông số / Tùy chọn: %s\n" +
                        "- Lượt bán đã chốt thành công: %s chiếc (Đây là sản phẩm uy tín, được nhiều người mua)\n" +
                        "======================================\n" +
                        "YÊU CẦU: Hãy dùng chính xác các thông tin trên (đặc biệt là Tên và Giá bán) để tư vấn cho khách. " +
                        "Nói chuyện tự nhiên, thuyết phục và kêu gọi khách chốt đơn.",
                p.getName(),
                p.getPrice(),
                p.getOriginalPrice() != null ? p.getOriginalPrice() : p.getPrice(),
                p.getSpecsStr() != null ? p.getSpecsStr() : "Bản tiêu chuẩn",
                p.getReviewCount() != null ? p.getReviewCount() : 0 // <-- Đã mở comment dòng này
        );

        return new AiProductResult(contextText, p);
    }

}