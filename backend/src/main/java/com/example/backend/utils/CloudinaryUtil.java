package com.example.backend.utils;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.stream.Collectors;

import jakarta.annotation.PreDestroy;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;

import lombok.extern.slf4j.Slf4j;

@Slf4j
@Component
public class CloudinaryUtil {

    private final Cloudinary cloudinary;
    private static final String FOLDER_NAME = "uploads";

    private final ExecutorService executorService = Executors.newFixedThreadPool(10);

    public CloudinaryUtil(
            @Value("${spring.cloudinary.cloud_name}") String cloudName,
            @Value("${spring.cloudinary.api_key}") String apiKey,
            @Value("${spring.cloudinary.api_secret}") String apiSecret) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    public String saveFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return null;
        }

        try {
            Map<?, ?> uploadResult = cloudinary
                    .uploader()
                    .upload(file.getBytes(), ObjectUtils.asMap("folder", FOLDER_NAME, "resource_type", "auto"));

            String url = uploadResult.get("secure_url").toString();
            log.info("Upload thành công! URL: {}", url);
            return url;

        } catch (IOException e) {
            log.error("Lỗi I/O khi đọc file multipart: {}", file.getOriginalFilename(), e);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        } catch (Exception e) {
            log.error("Lỗi từ server Cloudinary khi upload: {}", file.getOriginalFilename(), e);
            throw new CustomException(ErrorCode.FILE_UPLOAD_FAILED);
        }
    }

    public List<String> uploadMultipleFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty()) {
            return List.of();
        }

        List<CompletableFuture<String>> uploadFutures = files.stream()
                .filter(file -> file != null && !file.isEmpty())
                .map(file -> CompletableFuture.supplyAsync(
                        () -> {
                            try {
                                return saveFile(file);
                            } catch (Exception e) {
                                log.error(
                                        "Lỗi khi upload song song file {}: {}",
                                        file.getOriginalFilename(),
                                        e.getMessage());
                                return null;
                            }
                        },
                        executorService))
                .toList();

        return uploadFutures.stream()
                .map(CompletableFuture::join)
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
    }

    public boolean deleteFile(String imageUrl) {
        if (imageUrl == null || imageUrl.isBlank()) return false;

        try {
            String publicId = extractPublicId(imageUrl);
            cloudinary.uploader().destroy(publicId, ObjectUtils.emptyMap());

            return true;
        } catch (Exception e) {
            log.error("Lỗi khi xóa ảnh Cloudinary (URL: {}): {}", imageUrl, e.getMessage(), e);
            return false;
        }
    }

    /**
     * Hàm helper bóc tách public_id chính xác, bất chấp cấu trúc thư mục con
     */
    private String extractPublicId(String imageUrl) {
        int folderIndex = imageUrl.indexOf(FOLDER_NAME + "/");
        if (folderIndex == -1) {
            String[] parts = imageUrl.split("/");
            String lastPart = parts[parts.length - 1];
            return lastPart.substring(0, lastPart.lastIndexOf('.'));
        }

        String publicIdWithExt = imageUrl.substring(folderIndex);
        int lastDotIndex = publicIdWithExt.lastIndexOf('.');

        return lastDotIndex != -1 ? publicIdWithExt.substring(0, lastDotIndex) : publicIdWithExt;
    }

    @PreDestroy
    public void shutdown() {
        if (!executorService.isShutdown()) {
            log.info("Shutting down Cloudinary Executor Service...");
            executorService.shutdown();
        }
    }
}
