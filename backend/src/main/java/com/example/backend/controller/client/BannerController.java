package com.example.backend.controller.client;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.BannerResponse;
import com.example.backend.enums.BannerPlacement;
import com.example.backend.service.BannerService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    // API: Lấy banner hiển thị trên web (Phân theo vị trí)
    @GetMapping
    public APIResponse<List<BannerResponse>> getActiveBanners(
            @RequestParam BannerPlacement placement) {
        return APIResponse.success(bannerService.getActiveBanners(placement));
    }
}