package com.example.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.BrandRequest;
import com.example.backend.dto.response.BrandResponse;
import com.example.backend.entity.Brand;
import com.example.backend.enums.BrandStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BrandMapper;
import com.example.backend.repository.BrandRepository;
import com.example.backend.utils.CloudinaryUtil;
import com.example.backend.utils.SlugUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RequiredArgsConstructor
@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final CloudinaryUtil cloudinaryutil;

    @Transactional(readOnly = true)
    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll().stream()
                .map(brandMapper::toBrandResponse)
                .toList();
    }

    @Transactional
    public BrandResponse createBrand(BrandRequest request) {
        validateBrandNameNotExists(request.getName());

        String slug = SlugUtil.generateUniqueSlug(request.getName(), brandRepository::existsBySlug);
        Brand brand = brandMapper.toBrand(request);
        brand.setSlug(slug);
        brand.setStatus(BrandStatus.ACTIVE);

        handleLogoUpload(brand, request.getLogo());

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    @Transactional
    public BrandResponse updateBrand(Integer id, BrandRequest request) {
        Brand brand = getBrandOrThrow(id);

        if (request.getName() != null && !request.getName().equals(brand.getName())) {
            validateBrandNameNotExists(request.getName());

            String slug = SlugUtil.generateUniqueSlug(request.getName(), brandRepository::existsBySlug);
            brand.setSlug(slug);
        }

        brandMapper.updateBrand(brand, request);

        handleLogoUpload(brand, request.getLogo());

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    @Transactional
    public void updateBrandStatus(Integer id, BrandStatus status) {
        Brand brand = getBrandOrThrow(id);
        brand.setStatus(status);
        brandRepository.save(brand);
    }

    private Brand getBrandOrThrow(Integer id) {
        return brandRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.BRAND_NOT_FOUND));
    }

    private void validateBrandNameNotExists(String name) {
        if (brandRepository.existsByName(name)) {
            throw new CustomException(ErrorCode.BRAND_NAME_EXISTS);
        }
    }

    private void handleLogoUpload(Brand brand, MultipartFile logo) {
        if (logo != null && !logo.isEmpty()) {
            if (brand.getLogoUrl() != null) {
                try {
                    cloudinaryutil.deleteFile(brand.getLogoUrl());
                } catch (Exception e) {
                    log.error("Failed to delete old logo on Cloudinary: {}", brand.getLogoUrl(), e);
                }
            }

            String newLogoUrl = cloudinaryutil.saveFile(logo);
            if (newLogoUrl != null) {
                brand.setLogoUrl(newLogoUrl);
            }
        }
    }
}
