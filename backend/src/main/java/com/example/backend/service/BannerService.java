package com.example.backend.service;

import com.example.backend.dto.request.BannerRequest;
import com.example.backend.dto.response.BannerResponse;
import com.example.backend.entity.Banner;
import com.example.backend.enums.BannerPlacement;
import com.example.backend.mapper.BannerMapper;
import com.example.backend.repository.BannerRepository;
import com.example.backend.utils.Cloudinaryutil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;
    private final BannerMapper bannerMapper;
    private final Cloudinaryutil cloudinaryutil;

    // ==========================================
    // 1. CLIENT: LẤY DANH SÁCH BANNER ĐỂ HIỂN THỊ
    // ==========================================
    public List<BannerResponse> getActiveBanners(BannerPlacement placement) {
        List<Banner> activeBanners = bannerRepository.findActiveBannersByPlacement(placement, LocalDateTime.now());
        return activeBanners.stream().map(bannerMapper::toResponse).collect(Collectors.toList());
    }

    // ==========================================
    // 2. ADMIN: XEM TẤT CẢ BANNER
    // ==========================================
    public Page<BannerResponse> getAllBanners(Pageable pageable) {
        return bannerRepository.findAll(pageable).map(bannerMapper::toResponse);
    }

    // ==========================================
    // 3. ADMIN: TẠO MỚI BANNER (UPLOAD CLOUD)
    // ==========================================
    @Transactional
    public BannerResponse createBanner(BannerRequest request) {
        validateDates(request.getStartDate(), request.getEndDate());

        // Tạo mới thì BẮT BUỘC phải có ảnh Desktop
        if (request.getDesktopImage() == null || request.getDesktopImage().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng tải lên ảnh Banner cho giao diện máy tính (Desktop)!");
        }

        Banner banner = bannerMapper.toEntity(request);

        // 3.1. Upload ảnh Desktop (Bắt buộc)
        banner.setImageUrl(uploadImageSafely(request.getDesktopImage()));

        // 3.2. Upload ảnh Mobile (Nếu Admin có tải lên)
        if (request.getMobileImage() != null && !request.getMobileImage().isEmpty()) {
            banner.setMobileImageUrl(uploadImageSafely(request.getMobileImage()));
        }

        return bannerMapper.toResponse(bannerRepository.save(banner));
    }

    // ==========================================
    // 4. ADMIN: CẬP NHẬT BANNER (UPLOAD MỚI & XÓA CŨ)
    // ==========================================
    @Transactional
    public BannerResponse updateBanner(Integer id, BannerRequest request) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Banner!"));

        validateDates(request.getStartDate(), request.getEndDate());

        // 4.1 Cập nhật thông tin chữ
        banner.setTitle(request.getTitle());
        banner.setTargetUrl(request.getTargetUrl());
        banner.setPlacement(request.getPlacement());
        banner.setSortOrder(request.getSortOrder());
        banner.setIsActive(request.getIsActive());
        banner.setStartDate(request.getStartDate());
        banner.setEndDate(request.getEndDate());

        // 4.2 Xử lý ảnh Desktop
        if (request.getDesktopImage() != null && !request.getDesktopImage().isEmpty()) {
            String oldDesktopImage = banner.getImageUrl(); // Lưu nháp link cũ

            // Tải ảnh mới lên Cloud và gán vào Entity
            banner.setImageUrl(uploadImageSafely(request.getDesktopImage()));

            // Xóa ảnh cũ trên Cloudinary để giải phóng dung lượng
            if (oldDesktopImage != null) {
                cloudinaryutil.deleteFile(oldDesktopImage);
            }
        }

        // 4.3 Xử lý ảnh Mobile
        if (request.getMobileImage() != null && !request.getMobileImage().isEmpty()) {
            String oldMobileImage = banner.getMobileImageUrl(); // Lưu nháp link cũ

            banner.setMobileImageUrl(uploadImageSafely(request.getMobileImage()));

            if (oldMobileImage != null) {
                cloudinaryutil.deleteFile(oldMobileImage);
            }
        }

        return bannerMapper.toResponse(bannerRepository.save(banner));
    }

    // ==========================================
    // 5. ADMIN: XÓA BANNER (XÓA DB RỒI XÓA CLOUD)
    // ==========================================
    @Transactional
    public void deleteBanner(Integer id) {
        Banner banner = bannerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Banner không tồn tại!"));

        // Giữ lại link ảnh trước khi xóa bản ghi
        String desktopImg = banner.getImageUrl();
        String mobileImg = banner.getMobileImageUrl();

        // Xóa bản ghi trong Database TRƯỚC
        bannerRepository.deleteById(id);

        // Sau khi DB xóa thành công, tiến hành xóa ảnh trên Cloud SAU
        if (desktopImg != null) {
            cloudinaryutil.deleteFile(desktopImg);
        }
        if (mobileImg != null) {
            cloudinaryutil.deleteFile(mobileImg);
        }

        log.info("Đã xóa hoàn toàn Banner ID: {} và dọn dẹp ảnh Cloudinary", id);
    }

    // ==========================================
    // HÀM HỖ TRỢ NỘI BỘ
    // ==========================================
    private void validateDates(LocalDateTime startDate, LocalDateTime endDate) {
        if (startDate != null && endDate != null && endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("Thời gian kết thúc (EndDate) không được trước thời gian bắt đầu (StartDate)!");
        }
    }

    private String uploadImageSafely(MultipartFile file) {
        // Kiểm tra định dạng (Chỉ cho phép ảnh)
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new IllegalArgumentException("File tải lên bắt buộc phải là hình ảnh (JPG, PNG...)!");
        }

        // Kiểm tra dung lượng (Max 5MB để không tốn băng thông)
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("Dung lượng ảnh không được vượt quá 5MB");
        }

        try {
            return cloudinaryutil.saveFile(file);
        } catch (Exception e) {
            log.error("Upload banner thất bại: ", e);
            throw new RuntimeException("Tải ảnh lên máy chủ thất bại, vui lòng thử lại!");
        }
    }
}