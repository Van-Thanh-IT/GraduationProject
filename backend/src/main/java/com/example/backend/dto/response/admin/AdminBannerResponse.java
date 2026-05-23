package com.example.backend.dto.response.admin;

import java.time.LocalDateTime;

import com.example.backend.enums.BannerPlacement;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminBannerResponse {
    private Integer id;
    private String title;
    private String imageUrl;
    private String mobileImageUrl;
    private String targetUrl;
    private BannerPlacement placement;
    private Integer sortOrder;

    private Boolean isActive;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
}
