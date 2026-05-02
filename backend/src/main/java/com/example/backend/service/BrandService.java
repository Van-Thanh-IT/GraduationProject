package com.example.backend.service;

import com.example.backend.dto.request.BrandRequest;
import com.example.backend.dto.response.BrandResponse;
import com.example.backend.entity.Brand;
import com.example.backend.enums.BrandStatus;
import com.example.backend.mapper.BrandMapper;
import com.example.backend.repository.BrandRepository;
import com.example.backend.utils.Cloudinaryutil;
import com.example.backend.utils.SlugUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class BrandService {

    private final BrandRepository brandRepository;
    private final BrandMapper brandMapper;
    private final Cloudinaryutil cloudinaryutil;

    public List<BrandResponse> getAllBrands() {
        return brandRepository.findAll()
                .stream()
                .map(brandMapper::toBrandResponse)
                .toList();
    }


    public BrandResponse createBrand(BrandRequest request) {
        if (brandRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại!");
        }

        String slug = SlugUtil.toSlug(request.getName());
        if (brandRepository.existsBySlug(slug)) {
            throw new RuntimeException("Đường dẫn (Slug) đã tồn tại!");
        }

        Brand brand = brandMapper.toBrand(request);
        brand.setSlug(slug);

        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            brand.setLogoUrl(cloudinaryutil.saveFile(request.getLogo()));
        }

        brand.setStatus(BrandStatus.ACTIVE);
        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    public BrandResponse updateBrand(Integer id, BrandRequest request) {
        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu!"));

        if (request.getName() != null && !request.getName().equals(brand.getName())
                && brandRepository.existsByName(request.getName())) {
            throw new RuntimeException("Tên thương hiệu đã tồn tại!");
        }

        if (request.getName() != null) {
            String baseSlug = SlugUtil.toSlug(request.getName());
            if (!baseSlug.equals(brand.getSlug())
                    && brandRepository.existsBySlug(baseSlug)) {
                throw new RuntimeException("Đường dẫn (Slug) đã tồn tại!");
            }

            brandMapper.updateBrand(brand, request);
            brand.setSlug(baseSlug);

        }

        if (request.getLogo() != null && !request.getLogo().isEmpty()) {
            if (brand.getLogoUrl() != null) {
                cloudinaryutil.deleteFile(brand.getLogoUrl());
            }
            brand.setLogoUrl(cloudinaryutil.saveFile(request.getLogo()));
        }

        return brandMapper.toBrandResponse(brandRepository.save(brand));
    }

    public void updateBrandStatus(Integer id, BrandStatus status) {

        Brand brand = brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thương hiệu!"));

        brand.setStatus(status);
        brandRepository.save(brand);
    }
}