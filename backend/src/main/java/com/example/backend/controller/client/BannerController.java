package com.example.backend.controller.client;

import java.util.List;

import com.example.backend.dto.response.client.ClientBannerResponse;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.enums.BannerPlacement;
import com.example.backend.service.BannerService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public/banners")
@RequiredArgsConstructor
public class BannerController {

    private final BannerService bannerService;

    @GetMapping
    public APIResponse<List<ClientBannerResponse>> getActiveBanners(@RequestParam BannerPlacement placement) {
        return APIResponse.success(bannerService.getActiveBanners(placement));
    }
}
