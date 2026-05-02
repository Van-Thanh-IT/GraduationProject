package com.example.backend.service;

import com.example.backend.dto.request.ProductVariantRequest;
import com.example.backend.dto.response.ProductVariantImageResponse;
import com.example.backend.dto.response.ProductVariantResponse;
import com.example.backend.dto.response.VariantSimpleResponse;
import com.example.backend.entity.*;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.*;
import com.example.backend.utils.Cloudinaryutil;
import com.example.backend.utils.SkuUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantImageRepository productVariantImageRepository;
    private final ProductMapper productMapper;
    private final Cloudinaryutil cloudinaryutil;


    public List<VariantSimpleResponse> searchSimpleVariantsForDropdown(String keyword, int limit) {
        Pageable pageable = PageRequest.of(0, limit);

        return productVariantRepository.searchSimpleVariants(keyword, pageable)
                .stream()
                .map(productMapper::toSimpleResponse)
                .toList();
    }

    // GET VARIANTS
    public List<ProductVariantResponse> getVariantsByProductId(Integer productId) {
        return productVariantRepository.findByProductId(productId)
                .stream()
                .map(productMapper::toResponse)
                .toList();
    }

    // CREATE VARIANTS
    @Transactional(rollbackFor = Exception.class)
    public List<ProductVariantResponse> createVariant(Integer productId, List<ProductVariantRequest> requests) {

        Product product = findProduct(productId);

        // 1. Kiểm tra toàn bộ logic trước khi lưu
        validateForCreation(productId, requests);

        List<ProductVariant> variants = new ArrayList<>();

        for (ProductVariantRequest request : requests) {
            ProductVariant variant = productMapper.toEntity(request);
            variant.setProduct(product);
            variant.setSku(generateUniqueSku(product, request));
            variants.add(variant);
        }

        List<ProductVariant> saved = productVariantRepository.saveAll(variants);
        return productMapper.toResponse(saved);
    }

    // UPDATE VARIANT
    @Transactional(rollbackFor = Exception.class)
    public ProductVariantResponse updateVariant(Integer id, ProductVariantRequest request) {
        ProductVariant variant = findVariant(id);

        // 1. Kiểm tra logic trước khi cập nhật (Chỉ kiểm tra trùng Option)
        validateForUpdate(variant, request);

        // 2. LOGIC TỰ ĐỘNG: Nếu biến thể này được bật làm mặc định,
        // thì tắt TẤT CẢ các biến thể khác của sản phẩm này.
        if (Boolean.TRUE.equals(request.getIsDefault())) {
            resetOtherDefaultVariants(variant.getProduct().getId(), variant.getId());
        }

        productMapper.updateEntity(variant, request);
        variant.setIsSerialRequired(request.getIsSerialRequired());

        return productMapper.toResponse(productVariantRepository.save(variant));
    }

    // DELETE VARIANT
    @Transactional(rollbackFor = Exception.class)
    public void softDeleteVariant(Integer id) {
        ProductVariant variant = findVariant(id);
        productVariantRepository.delete(variant);
    }

    // UPLOAD VARIANT IMAGES
    @Transactional(rollbackFor = Exception.class)
    public List<ProductVariantImageResponse> uploadVariantImages(Integer variantId, List<MultipartFile> files) {

        ProductVariant variant = findVariant(variantId);

        if (files == null || files.isEmpty()) {
            throw new RuntimeException("Vui lòng chọn ít nhất 1 ảnh!");
        }

        List<ProductVariantImage> imagesToSave = new ArrayList<>();
        List<ProductVariantImage> existingImages = productVariantImageRepository.findByVariantId(variantId);
        int sortOrder = existingImages.size();

        boolean hasThumbnail = existingImages.stream()
                .anyMatch(img -> Boolean.TRUE.equals(img.getIsThumbnail()));

        for (int i = 0; i < files.size(); i++) {
            MultipartFile file = files.get(i);
            String imageUrl = cloudinaryutil.saveFile(file);

            if (imageUrl == null) {
                throw new RuntimeException("Upload ảnh thất bại!");
            }

            ProductVariantImage image = new ProductVariantImage();
            image.setVariant(variant);
            image.setImageUrl(imageUrl);
            image.setSortOrder(sortOrder++);
            image.setIsThumbnail(false);

            if (!hasThumbnail && i == 0) {
                image.setIsThumbnail(true);
                updateProductThumbnail(variant.getProduct(), imageUrl);
                hasThumbnail = true;
            }

            imagesToSave.add(image);
        }

        return productVariantImageRepository.saveAll(imagesToSave).stream()
                .map(productMapper::toResponse)
                .toList();
    }

    // DELETE IMAGE
    @Transactional(rollbackFor = Exception.class)
    public void deleteVariantImage(Integer imageId) {
        ProductVariantImage image = productVariantImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh!"));

        cloudinaryutil.deleteFile(image.getImageUrl());
        productVariantImageRepository.delete(image);
    }

    // SET THUMBNAIL
    @Transactional(rollbackFor = Exception.class)
    public ProductVariantImageResponse setThumbnail(Integer imageId) {
        ProductVariantImage image = productVariantImageRepository.findById(imageId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh!"));

        resetThumbnail(image.getVariant().getId());

        image.setIsThumbnail(true);
        ProductVariantImage saved = productVariantImageRepository.save(image);
        updateProductThumbnail(image.getVariant().getProduct(), saved.getImageUrl());

        return productMapper.toResponse(saved);
    }


    /* =========================================================
     * PRIVATE VALIDATION METHODS
     * ========================================================= */

    private Product findProduct(Integer productId) {
        return productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy sản phẩm!"));
    }

    private ProductVariant findVariant(Integer id) {
        return productVariantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy biến thể!"));
    }

    // TỐI ƯU HÓA: Kiểm tra khi Thêm Mới nhiều biến thể
    private void validateForCreation(Integer productId, List<ProductVariantRequest> requests) {
        Set<String> requestKeys = new HashSet<>();
        boolean hasDefaultInRequest = false;

        for (ProductVariantRequest request : requests) {
            validatePrice(request);

            // 1. Kiểm tra trùng Option ngay trong mảng Request gửi lên
            String key = (request.getOption1Value() + "-" + request.getOption2Value() + "-" + request.getOption3Value()).toLowerCase();
            if (!requestKeys.add(key)) {
                throw new RuntimeException("Lỗi: Các biến thể thêm mới không được trùng tùy chọn với nhau!");
            }

            // 2. Kiểm tra trùng Option với các biến thể ĐÃ CÓ trong DB
            if (productVariantRepository.existsByProductIdAndOption1ValueAndOption2ValueAndOption3Value(
                    productId, request.getOption1Value(), request.getOption2Value(), request.getOption3Value())) {
                throw new RuntimeException("Lỗi: Biến thể " + key + " đã tồn tại trong sản phẩm!");
            }

            // 3. Đếm số lượng isDefault = true trong mảng Request gửi lên
            if (Boolean.TRUE.equals(request.getIsDefault())) {
                if (hasDefaultInRequest) {
                    throw new RuntimeException("Lỗi: Chỉ được cấu hình 1 biến thể mặc định trong danh sách thêm mới!");
                }
                hasDefaultInRequest = true;
            }
        }

        // 4. Nếu gửi lên có chứa isDefault = true, kiểm tra xem DB đã có mặc định chưa
        if (hasDefaultInRequest && productVariantRepository.existsByProductIdAndIsDefaultTrue(productId)) {
            throw new RuntimeException("Lỗi: Sản phẩm này đã có biến thể mặc định trên hệ thống!");
        }
    }

    // TỐI ƯU HÓA: Kiểm tra khi Cập nhật 1 biến thể
    private void validateForUpdate(ProductVariant existingVariant, ProductVariantRequest request) {
        validatePrice(request);
        Integer productId = existingVariant.getProduct().getId();

        // Chỉ kiểm tra xem Option có bị đổi thành trùng với biến thể KHÁC trong DB không
        boolean optionsChanged = !Objects.equals(existingVariant.getOption1Value(), request.getOption1Value()) ||
                !Objects.equals(existingVariant.getOption2Value(), request.getOption2Value()) ||
                !Objects.equals(existingVariant.getOption3Value(), request.getOption3Value());

        if (optionsChanged) {
            boolean existsDuplicate = productVariantRepository.existsByProductIdAndIdNotAndOption1ValueAndOption2ValueAndOption3Value(
                    productId, existingVariant.getId(),
                    request.getOption1Value(), request.getOption2Value(), request.getOption3Value()
            );
            if (existsDuplicate) {
                throw new RuntimeException("Lỗi: Giá trị tùy chọn bị trùng với một biến thể khác đã tồn tại!");
            }
        }
    }

    // Tự động tắt (set về false) tất cả các biến thể khác của sản phẩm này
    private void resetOtherDefaultVariants(Integer productId, Integer currentVariantId) {
        List<ProductVariant> otherVariants = productVariantRepository.findByProductId(productId);
        for (ProductVariant v : otherVariants) {
            // Nếu KHÔNG PHẢI là biến thể đang sửa, và nó đang có isDefault = true
            if (!v.getId().equals(currentVariantId) && Boolean.TRUE.equals(v.getIsDefault())) {
                v.setIsDefault(false);
                productVariantRepository.save(v);
            }
        }
    }

    private void validatePrice(ProductVariantRequest request) {
        if (request.getOriginalPrice() != null && request.getOriginalPrice().compareTo(request.getPrice()) < 0) {
            throw new RuntimeException("Lỗi: Giá gốc phải lớn hơn hoặc bằng giá bán!");
        }
    }

    private String generateUniqueSku(Product product, ProductVariantRequest request) {
        String sku = SkuUtil.generateSku(
                product.getName(),
                request.getOption1Value(),
                request.getOption2Value(),
                request.getOption3Value()
        );

        String baseSku = sku;
        int counter = 1;
        while (productVariantRepository.existsBySku(sku)) {
            sku = baseSku + "-" + counter++;
        }
        return sku;
    }

    private void resetThumbnail(Integer variantId) {
        List<ProductVariantImage> images = productVariantImageRepository.findByVariantId(variantId);
        for (ProductVariantImage img : images) {
            if (Boolean.TRUE.equals(img.getIsThumbnail())) {
                img.setIsThumbnail(false);
                productVariantImageRepository.save(img);
            }
        }
    }

    private void updateProductThumbnail(Product product, String url) {
        product.setThumbnail(url);
        productRepository.save(product);
    }
}