package com.example.backend.controller.client;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.WarrantyResponse;
import com.example.backend.dto.response.client.HomeResponse;
import com.example.backend.service.HomeService;
import com.example.backend.service.WarrantyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/public")
@RequiredArgsConstructor
public class HomeController {

    private final HomeService homeService;
    private final WarrantyService warrantyService;

    @GetMapping("/home")
    public APIResponse<HomeResponse> getHomeProducts() {
        return APIResponse.success(homeService.getHomePageData());
    }

    @GetMapping("/warranty/lookup")
    public APIResponse<List<WarrantyResponse>> lookup(@RequestParam String keyword) {
        return APIResponse.success(warrantyService.lookupWarranty(keyword));
    }
}
