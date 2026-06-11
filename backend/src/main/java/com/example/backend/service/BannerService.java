package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.CompletableFuture;

import com.example.backend.dto.response.client.ClientBannerResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.BannerRequest;
import com.example.backend.dto.response.admin.AdminBannerResponse;
import com.example.backend.entity.Banner;
import com.example.backend.enums.BannerPlacement;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.BannerMapper;
import com.example.backend.repository.BannerRepository;
import com.example.backend.utils.CloudinaryUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final CloudinaryUtil cloudinaryutil;

    private static final int MAX_IMAGE_SIZE = 5 * 1024 * 1024;

    @Transactional(readOnly = true)
    public List<ClientBannerResponse> getActiveBanners(BannerPlacement placement) {
        return bannerRepository.findActiveBannersByPlacement(placement, LocalDateTime.now()).stream()
                .map(bannerMapper::toClientBannerResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public Page<AdminBannerResponse> getAllBanners(Pageable pageable) {
        return bannerRepository.findAll(pageable).map(bannerMapper::toAdminBannerResponse);
    }

    @Transactional
    public AdminBannerResponse createBanner(BannerRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        if (request.getStartDate() != null && request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.BANNER_START_DATE_IN_PAST);

        }

        if (request.getDesktopImage() == null || request.getDesktopImage().isEmpty()) {
            throw new CustomException(ErrorCode.BANNER_DESKTOP_IMAGE_REQUIRED);
        }

        Banner banner = bannerMapper.toBanner(request);
        banner.setImageUrl(uploadImageSafely(request.getDesktopImage()));

        if (request.getMobileImage() != null && !request.getMobileImage().isEmpty()) {
            banner.setMobileImageUrl(uploadImageSafely(request.getMobileImage()));
        }

        return bannerMapper.toAdminBannerResponse(bannerRepository.save(banner));
    }

    @Transactional
    public AdminBannerResponse updateBanner(Integer id, BannerRequest request) {
        Banner banner = getBannerOrThrow(id);
        validateDates(request.getStartDate(), request.getEndDate());

        bannerMapper.updateBanner(request, banner);

        if (request.getDesktopImage() != null && !request.getDesktopImage().isEmpty()) {
            String oldDesktopImage = banner.getImageUrl();
            banner.setImageUrl(uploadImageSafely(request.getDesktopImage()));
            deleteImageAsync(oldDesktopImage);
        }

        if (request.getMobileImage() != null && !request.getMobileImage().isEmpty()) {
            String oldMobileImage = banner.getMobileImageUrl();
            banner.setMobileImageUrl(uploadImageSafely(request.getMobileImage()));
            deleteImageAsync(oldMobileImage);
        }

        return bannerMapper.toAdminBannerResponse(bannerRepository.save(banner));
    }

    @Transactional
    public void deleteBanner(Integer id) {
        Banner banner = getBannerOrThrow(id);

        String desktopImg = banner.getImageUrl();
        String mobileImg = banner.getMobileImageUrl();

        bannerRepository.delete(banner);
        log.info("Đã xóa hoàn toàn Banner ID: {} khỏi Database", id);

        deleteImageAsync(desktopImg);
        deleteImageAsync(mobileImg);
    }

    private Banner getBannerOrThrow(Integer id) {
        return bannerRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.BANNER_NOT_FOUND));
    }

    private void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new CustomException(ErrorCode.BANNER_INVALID_DATES);
        }
    }

    private String uploadImageSafely(MultipartFile file) {
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new CustomException(ErrorCode.INVALID_FILE_TYPE);
        }

        if (file.getSize() > MAX_IMAGE_SIZE) {
            throw new CustomException(ErrorCode.FILE_SIZE_EXCEEDED);
        }

        try {
            return cloudinaryutil.saveFile(file);
        } catch (Exception e) {
            log.error("Upload banner thất bại: ", e);
            throw new CustomException(ErrorCode.UPLOAD_FAILED);
        }
    }

    private void deleteImageAsync(String imageUrl) {
        if (imageUrl != null && !imageUrl.isEmpty()) {
            CompletableFuture.runAsync(() -> {
                try {
                    cloudinaryutil.deleteFile(imageUrl);
                    log.info("Đã dọn dẹp ảnh trên Cloudinary: {}", imageUrl);
                } catch (Exception e) {
                    log.error("Lỗi khi xóa ảnh trên Cloudinary: {}", imageUrl, e);
                }
            });
        }
    }
}
