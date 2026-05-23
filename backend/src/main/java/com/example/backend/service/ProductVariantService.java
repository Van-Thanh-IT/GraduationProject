package com.example.backend.service;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.ProductVariantRequest;
import com.example.backend.dto.response.ProductVariantImageResponse;
import com.example.backend.dto.response.ProductVariantResponse;
import com.example.backend.dto.response.VariantSimpleResponse;
import com.example.backend.entity.*;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.ProductMapper;
import com.example.backend.repository.*;
import com.example.backend.utils.CloudinaryUtil;
import com.example.backend.utils.SkuUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class ProductVariantService {

    private final ProductRepository productRepository;
    private final ProductVariantRepository productVariantRepository;
    private final ProductVariantImageRepository productVariantImageRepository;
    private final ProductMapper productMapper;
    private final CloudinaryUtil cloudinaryutil;

    @Transactional(readOnly = true)
    public List<VariantSimpleResponse> searchSimpleVariantsForDropdown(String keyword, int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        return productVariantRepository.searchSimpleVariants(keyword, pageable).stream()
                .map(productMapper::toSimpleResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ProductVariantResponse> getVariantsByProductId(Integer productId) {
        return productVariantRepository.findByProductId(productId).stream()
                .map(productMapper::toVariantResponse)
                .toList();
    }

    @Transactional
    public List<ProductVariantResponse> createVariant(Integer productId, List<ProductVariantRequest> requests) {
        Product product = getProductByIdOrThrow(productId);
        validateForCreation(productId, requests);

        List<ProductVariant> variants = new ArrayList<>();
        for (ProductVariantRequest request : requests) {
            ProductVariant variant = productMapper.toVariant(request);
            variant.setProduct(product);
            variant.setSku(generateUniqueSku(product, request));
            variants.add(variant);
        }

        return productMapper.toVariantResponse(productVariantRepository.saveAll(variants));
    }

    @Transactional
    public ProductVariantResponse updateVariant(Integer id, ProductVariantRequest request) {
        ProductVariant variant = getVariantByIdOrThrow(id);
        validateForUpdate(variant, request);

        if (Boolean.TRUE.equals(request.getIsDefault())) {
            productVariantRepository.resetDefaultVariants(variant.getProduct().getId(), variant.getId());
        }

        productMapper.updateVariant(variant, request);
        variant.setIsSerialRequired(Boolean.TRUE.equals(request.getIsSerialRequired()));

        return productMapper.toVariantResponse(variant);
    }

    @Transactional
    public void softDeleteVariant(Integer id) {
        ProductVariant variant = getVariantByIdOrThrow(id);
        productVariantRepository.delete(variant);
    }

    @Transactional
    public List<ProductVariantImageResponse> uploadVariantImages(Integer variantId, List<MultipartFile> files) {
        ProductVariant variant = getVariantByIdOrThrow(variantId);

        if (files == null || files.isEmpty()) {
            throw new CustomException(ErrorCode.VARIANT_EMPTY_IMAGE_UPLOAD);
        }

        List<String> imageUrls = cloudinaryutil.uploadMultipleFiles(files);
        if (imageUrls.isEmpty()) {
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }

        List<ProductVariantImage> existingImages =
                productVariantImageRepository.findByVariantIdOrderBySortOrderAsc(variantId);
        int sortOrder = existingImages.size();
        boolean hasThumbnail = existingImages.stream().anyMatch(img -> Boolean.TRUE.equals(img.getIsThumbnail()));

        List<ProductVariantImage> imagesToSave = new ArrayList<>();

        for (String url : imageUrls) {
            ProductVariantImage image = new ProductVariantImage();
            image.setVariant(variant);
            image.setImageUrl(url);
            image.setSortOrder(sortOrder++);

            if (!hasThumbnail) {
                image.setIsThumbnail(true);
                hasThumbnail = true;

                Product product = variant.getProduct();
                if (Boolean.TRUE.equals(variant.getIsDefault()) || product.getThumbnail() == null) {
                    product.setThumbnail(url);
                }

            } else {
                image.setIsThumbnail(false);
            }
            imagesToSave.add(image);
        }

        return productVariantImageRepository.saveAll(imagesToSave).stream()
                .map(productMapper::toVariantImageResponse)
                .toList();
    }

    @Transactional
    public void deleteVariantImage(Integer imageId) {
        ProductVariantImage image = getVariantImageByIdOrThrow(imageId);
        Integer variantId = image.getVariant().getId();
        boolean wasThumbnail = Boolean.TRUE.equals(image.getIsThumbnail());
        String urlToDelete = image.getImageUrl();

        productVariantImageRepository.delete(image);

        if (wasThumbnail) {
            List<ProductVariantImage> remainingImages =
                    productVariantImageRepository.findByVariantIdOrderBySortOrderAsc(variantId);
            if (!remainingImages.isEmpty()) {
                ProductVariantImage newThumbnail = remainingImages.getFirst();
                newThumbnail.setIsThumbnail(true);
                productVariantImageRepository.save(newThumbnail);
            }
        }

        CompletableFuture.runAsync(() -> {
            try {
                cloudinaryutil.deleteFile(urlToDelete);
            } catch (Exception e) {
                log.error("Lỗi khi xóa ảnh Variant trên Cloud: {}", urlToDelete, e);
            }
        });
    }

    @Transactional
    public ProductVariantImageResponse setThumbnail(Integer imageId) {
        ProductVariantImage image = getVariantImageByIdOrThrow(imageId);

        productVariantImageRepository.resetThumbnailsByVariantId(image.getVariant().getId());

        image.setIsThumbnail(true);

        Product product = image.getVariant().getProduct();
        if (Boolean.TRUE.equals(image.getVariant().getIsDefault()) || product.getThumbnail() == null) {
            product.setThumbnail(image.getImageUrl());
        }
        return productMapper.toVariantImageResponse(image);
    }

    private Product getProductByIdOrThrow(Integer productId) {
        return productRepository
                .findById(productId)
                .orElseThrow(() -> new CustomException(ErrorCode.PRODUCT_NOT_FOUND));
    }

    private ProductVariant getVariantByIdOrThrow(Integer id) {
        return productVariantRepository
                .findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VARIANT_NOT_FOUND));
    }

    private ProductVariantImage getVariantImageByIdOrThrow(Integer id) {
        return productVariantImageRepository
                .findById(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VARIANT_IMAGE_NOT_FOUND));
    }

    private void validateForCreation(Integer productId, List<ProductVariantRequest> requests) {
        Set<String> existingVariantKeys = productVariantRepository.findByProductId(productId).stream()
                .map(v -> buildVariantKey(v.getOption1Value(), v.getOption2Value(), v.getOption3Value()))
                .collect(Collectors.toSet());

        Set<String> requestKeys = new HashSet<>();
        boolean hasDefaultInRequest = false;

        for (ProductVariantRequest request : requests) {
            validatePrice(request);
            String key =
                    buildVariantKey(request.getOption1Value(), request.getOption2Value(), request.getOption3Value());

            if (!requestKeys.add(key)) {
                throw new CustomException(
                        ErrorCode.INVALID_INPUT, "Các biến thể thêm mới không được trùng tùy chọn (" + key + ")!");
            }

            if (existingVariantKeys.contains(key)) {
                throw new CustomException(ErrorCode.VARIANT_ALREADY_EXISTS, "Biến thể " + key + " đã tồn tại!");
            }

            if (Boolean.TRUE.equals(request.getIsDefault())) {
                if (hasDefaultInRequest) {
                    throw new CustomException(ErrorCode.VARIANT_MULTIPLE_DEFAULT);
                }
                hasDefaultInRequest = true;
            }
        }

        if (hasDefaultInRequest && productVariantRepository.existsByProductIdAndIsDefaultTrue(productId)) {
            throw new CustomException(ErrorCode.DEFAULT_VARIANT_ALREADY_EXISTS);
        }
    }

    private void validateForUpdate(ProductVariant existingVariant, ProductVariantRequest request) {
        validatePrice(request);

        String existingKey = buildVariantKey(
                existingVariant.getOption1Value(),
                existingVariant.getOption2Value(),
                existingVariant.getOption3Value());
        String newKey =
                buildVariantKey(request.getOption1Value(), request.getOption2Value(), request.getOption3Value());

        if (!existingKey.equals(newKey)) {
            boolean existsDuplicate =
                    productVariantRepository.existsByProductIdAndIdNotAndOption1ValueAndOption2ValueAndOption3Value(
                            existingVariant.getProduct().getId(),
                            existingVariant.getId(),
                            request.getOption1Value(),
                            request.getOption2Value(),
                            request.getOption3Value());
            if (existsDuplicate) {
                throw new CustomException(ErrorCode.VARIANT_ALREADY_EXISTS);
            }
        }
    }

    private void validatePrice(ProductVariantRequest request) {
        if (request.getOriginalPrice() != null && request.getOriginalPrice().compareTo(request.getPrice()) < 0) {
            throw new CustomException(ErrorCode.INVALID_INPUT, "Giá gốc phải lớn hơn hoặc bằng giá bán!");
        }
    }

    private String buildVariantKey(String opt1, String opt2, String opt3) {
        return java.util.stream.Stream.of(opt1, opt2, opt3)
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .map(String::toLowerCase)
                .collect(Collectors.joining("-"));
    }

    private String generateUniqueSku(Product product, ProductVariantRequest request) {
        String sku = SkuUtil.generateSku(
                product.getName(), request.getOption1Value(), request.getOption2Value(), request.getOption3Value());
        String baseSku = sku;
        int counter = 1;

        while (productVariantRepository.existsBySku(sku)) {
            sku = baseSku + "-" + counter++;
        }
        return sku;
    }
}
