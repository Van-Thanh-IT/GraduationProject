package com.example.backend.controller.management;

import java.util.List;

import com.example.backend.dto.response.admin.ProductResponse;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.ProductAttributeValueRequest;
import com.example.backend.dto.request.ProductRequest;
import com.example.backend.dto.request.ProductVariantRequest;
import com.example.backend.dto.response.*;
import com.example.backend.dto.response.admin.ProductAttributeValueResponse;
import com.example.backend.enums.ProductStatus;
import com.example.backend.service.ProductService;
import com.example.backend.service.ProductVariantService;

import lombok.RequiredArgsConstructor;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/management/products")
public class ProductManagementController {

    private final ProductService productService;
    private final ProductVariantService productVariantService;

    // PRODUCT

    @GetMapping
    public APIResponse<List<ProductResponse>> getAllProducts() {
        return APIResponse.success(productService.getAllProducts());
    }

    @PostMapping
    public APIResponse<ProductResponse> createProduct(@Valid @RequestBody ProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return APIResponse.<ProductResponse>builder()
                .code(201)
                .messages("Thêm sản phẩm thành công")
                .data(response)
                .build();
    }

    @PutMapping("/{id}")
    public APIResponse<ProductResponse> updateProduct(
            @PathVariable Integer id, @Valid @RequestBody ProductRequest request) {
        return APIResponse.success(productService.updateProduct(id, request));
    }

    @PatchMapping("/{id}/status")
    public APIResponse<ProductResponse> updateProductStatus(
            @PathVariable Integer id, @RequestParam ProductStatus status) {
        return APIResponse.success(productService.updateProductStatus(id, status));
    }

    // PRODUCT ATTRIBUTE

    @GetMapping("/{productId}/attributes")
    public APIResponse<List<ProductAttributeValueResponse>> getAttributesByProductId(@PathVariable Integer productId) {
        return APIResponse.success(productService.getAttributesByProductId(productId));
    }

    @PostMapping("/{productId}/attributes")
    public APIResponse<ProductAttributeValueResponse> addAttributeToProduct(
            @PathVariable Integer productId, @Valid @RequestBody ProductAttributeValueRequest request) {
        ProductAttributeValueResponse response = productService.CreateProductAttributeValue(productId, request);
        return APIResponse.<ProductAttributeValueResponse>builder()
                .code(201)
                .messages("Thêm thông số cho sản phẩm thành công!")
                .data(response)
                .build();
    }

    @PutMapping("/attributes/{attributeId}")
    public APIResponse<ProductAttributeValueResponse> updateProductAttribute(
            @PathVariable Integer attributeId, @Valid @RequestBody ProductAttributeValueRequest request) {
        return APIResponse.success(productService.updateProductAttributeValue(attributeId, request));
    }

    @DeleteMapping("/attributes/{attributeId}")
    public APIResponse<Void> deleteProductAttribute(@PathVariable Integer attributeId) {
        productService.deleteProductAttributeValue(attributeId);
        return APIResponse.<Void>builder()
                .code(200)
                .messages("Đã xóa thông số khỏi sản phẩm thành công!")
                .build();
    }

    // PRODUCT VARIANT

    @GetMapping("/variants/search-simple")
    public APIResponse<List<VariantSimpleResponse>> searchSimpleVariants(
            @RequestParam(name = "keyword", defaultValue = "") String keyword,
            @RequestParam(name = "limit", defaultValue = "20") int limit) {
        return APIResponse.success(productVariantService.searchSimpleVariantsForDropdown(keyword, limit));
    }

    @GetMapping("/{productId}/variants")
    public APIResponse<List<ProductVariantResponse>> getVariantsByProduct(@PathVariable Integer productId) {
        return APIResponse.success(productVariantService.getVariantsByProductId(productId));
    }

    @PostMapping("/{productId}/variants")
    public APIResponse<List<ProductVariantResponse>> createVariant(
            @PathVariable Integer productId, @Valid @RequestBody List<ProductVariantRequest> request) {
        List<ProductVariantResponse> response = productVariantService.createVariant(productId, request);
        return APIResponse.<List<ProductVariantResponse>>builder()
                .code(201)
                .messages("Thêm biến thể thành công!")
                .data(response)
                .build();
    }

    @PutMapping("/variants/{variantId}")
    public APIResponse<ProductVariantResponse> updateVariant(
            @PathVariable Integer variantId, @Valid @RequestBody ProductVariantRequest request) {
        return APIResponse.success(productVariantService.updateVariant(variantId, request));
    }

    @DeleteMapping("/variants/{variantId}")
    public APIResponse<Void> softDeleteVariant(@PathVariable Integer variantId) {
        productVariantService.softDeleteVariant(variantId);
        return APIResponse.<Void>builder()
                .code(200)
                .messages("Xóa biến thể sản phẩm thành công!")
                .build();
    }

    // PRODUCT VARIANT IMAGES

    @PostMapping("/variants/{variantId}/images")
    public APIResponse<List<ProductVariantImageResponse>> uploadImages(
            @PathVariable Integer variantId, @RequestParam("files") List<MultipartFile> files) {
        List<ProductVariantImageResponse> response = productVariantService.uploadVariantImages(variantId, files);
        return APIResponse.<List<ProductVariantImageResponse>>builder()
                .code(201)
                .messages("Upload danh sách ảnh thành công!")
                .data(response)
                .build();
    }

    @DeleteMapping("/images/{imageId}")
    public APIResponse<Void> deleteImage(@PathVariable Integer imageId) {
        productVariantService.deleteVariantImage(imageId);
        return APIResponse.<Void>builder()
                .code(200)
                .messages("Xóa ảnh thành công!")
                .build();
    }

    @PutMapping("/images/{imageId}/thumbnail")
    public APIResponse<ProductVariantImageResponse> setAsThumbnail(@PathVariable Integer imageId) {
        ProductVariantImageResponse response = productVariantService.setThumbnail(imageId);
        return APIResponse.<ProductVariantImageResponse>builder()
                .code(200)
                .messages("Cập nhật ảnh đại diện thành công!")
                .data(response)
                .build();
    }
}
