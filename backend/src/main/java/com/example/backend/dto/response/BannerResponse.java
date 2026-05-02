package com.example.backend.dto.response;

import com.example.backend.enums.BannerPlacement;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class BannerResponse {
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