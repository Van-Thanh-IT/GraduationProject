package com.example.backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.backend.dto.response.WarrantyResponse;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.projection.WarrantyProjection;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WarrantyService {

    private final OrderRepository orderRepository;

    private static final Pattern NUMBER_PATTERN = Pattern.compile("\\d+");

    private static final int DEFAULT_WARRANTY_MONTHS = 12;
    private static final int LIFETIME_WARRANTY_YEARS = 100;

    private static final String STATUS_VALID = "HỢP LỆ (CÒN BẢO HÀNH)";
    private static final String STATUS_EXPIRED = "ĐÃ HẾT HẠN";
    private static final String STATUS_NO_WARRANTY = "KHÔNG BẢO HÀNH";

    private static final String DEFAULT_WARRANTY_TEXT = "Mặc định 12 tháng";
    private static final String NO_IMEI_TEXT = "Không có";

    @Transactional(readOnly = true)
    public List<WarrantyResponse> lookupWarranty(String keyword) {

        if (!StringUtils.hasText(keyword)) {
            throw new CustomException(ErrorCode.WARRANTY_KEYWORD_REQUIRED);
        }

        List<WarrantyProjection> results = orderRepository.searchWarranty(keyword.trim());

        if (results.isEmpty()) {
            throw new CustomException(ErrorCode.WARRANTY_NOT_FOUND);
        }

        LocalDateTime now = LocalDateTime.now();

        return results.stream().map(p -> mapToResponse(p, now)).toList();
    }

    private WarrantyResponse mapToResponse(WarrantyProjection p, LocalDateTime now) {
        LocalDateTime expireDate = calculateExpireDate(p.getPurchaseDate(), p.getWarrantyPeriodText());
        String status = determineWarrantyStatus(expireDate, now);

        return WarrantyResponse.builder()
                .orderCode(p.getOrderCode())
                .customerName(p.getCustomerName())
                .phone(p.getPhone())
                .productName(p.getProductName())
                .thumbnail(p.getThumbnail())
                .imei(StringUtils.hasText(p.getImei()) ? p.getImei() : NO_IMEI_TEXT)
                .warrantyText(
                        StringUtils.hasText(p.getWarrantyPeriodText())
                                ? p.getWarrantyPeriodText()
                                : DEFAULT_WARRANTY_TEXT)
                .purchaseDate(p.getPurchaseDate())
                .expireDate(expireDate)
                .status(status)
                .build();
    }

    private String determineWarrantyStatus(LocalDateTime expireDate, LocalDateTime now) {
        if (expireDate == null) {
            return STATUS_NO_WARRANTY;
        }
        return expireDate.isAfter(now) ? STATUS_VALID : STATUS_EXPIRED;
    }

    private LocalDateTime calculateExpireDate(LocalDateTime purchaseDate, String warrantyText) {
        if (purchaseDate == null) return null;

        if (!StringUtils.hasText(warrantyText)) {
            return purchaseDate.plusMonths(DEFAULT_WARRANTY_MONTHS);
        }

        String lowerText = warrantyText.toLowerCase();

        Matcher matcher = NUMBER_PATTERN.matcher(lowerText);
        int number = matcher.find() ? Integer.parseInt(matcher.group()) : 0;

        if (lowerText.contains("năm") && number > 0) {
            return purchaseDate.plusYears(number);
        }
        if (lowerText.contains("tháng") && number > 0) {
            return purchaseDate.plusMonths(number);
        }
        if (lowerText.contains("trọn đời") || lowerText.contains("life time")) {
            return purchaseDate.plusYears(LIFETIME_WARRANTY_YEARS);
        }

        return purchaseDate.plusMonths(DEFAULT_WARRANTY_MONTHS); // Fallback an toàn
    }
}
