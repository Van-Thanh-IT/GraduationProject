package com.example.backend.dto.response.client;

import com.example.backend.enums.BannerPlacement;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class ClientBannerResponse {
    private Integer id;
    private String title;
    private String imageUrl;
    private String mobileImageUrl;
    private String targetUrl;
    private BannerPlacement placement;
    private Integer sortOrder;
}
