package com.example.backend.service;

import com.example.backend.dto.response.WarrantyResponse;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.projection.WarrantyProjection;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WarrantyService {

    private final OrderRepository orderRepository;

    public List<WarrantyResponse> lookupWarranty(String keyword) {
        if (keyword == null || keyword.trim().isEmpty()) {
            throw new RuntimeException("Vui lòng nhập Số điện thoại, Mã đơn hàng hoặc IMEI");
        }

        List<WarrantyProjection> results = orderRepository.searchWarranty(keyword.trim());

        if (results.isEmpty()) {
            throw new RuntimeException("Không tìm thấy dữ liệu bảo hành cho thông tin này! Vui lòng kiểm tra lại.");
        }

        LocalDateTime now = LocalDateTime.now();

        return results.stream().map(p -> {
            // 1. Tính toán ngày hết hạn
            LocalDateTime expireDate = calculateExpireDate(p.getPurchaseDate(), p.getWarrantyPeriodText());

            // 2. Xác định trạng thái
            String status;
            if (expireDate == null) {
                status = "KHÔNG BẢO HÀNH";
            } else {
                status = expireDate.isAfter(now) ? "HỢP LỆ (CÒN BẢO HÀNH)" : "ĐÃ HẾT HẠN";
            }

            return WarrantyResponse.builder()
                    .orderCode(p.getOrderCode())
                    .customerName(p.getCustomerName())
                    .phone(p.getPhone())
                    .productName(p.getProductName())
                    .thumbnail(p.getThumbnail())
                    .imei(p.getImei() != null ? p.getImei() : "Không có")
                    .warrantyText(p.getWarrantyPeriodText() != null ? p.getWarrantyPeriodText() : "Mặc định 12 tháng")
                    .purchaseDate(p.getPurchaseDate())
                    .expireDate(expireDate)
                    .status(status)
                    .build();
        }).collect(Collectors.toList());
    }

    // --- HÀM HELPER: BÓC TÁCH SỐ THÁNG TỪ CHUỖI TEXT ---
    private LocalDateTime calculateExpireDate(LocalDateTime purchaseDate, String warrantyText) {
        if (purchaseDate == null) return null;
        if (warrantyText == null || warrantyText.isBlank()) {
            return purchaseDate.plusMonths(12); // Mặc định 12 tháng nếu DB rỗng
        }

        String lowerText = warrantyText.toLowerCase();

        // Trích xuất các con số ra khỏi chuỗi (VD: "12 tháng" -> lấy số 12)
        Matcher matcher = Pattern.compile("\\d+").matcher(lowerText);
        int number = matcher.find() ? Integer.parseInt(matcher.group()) : 0;

        if (lowerText.contains("năm") && number > 0) {
            return purchaseDate.plusYears(number); // VD: "2 năm" -> +2 năm
        } else if (lowerText.contains("tháng") && number > 0) {
            return purchaseDate.plusMonths(number); // VD: "18 tháng" -> +18 tháng
        } else if (lowerText.contains("trọn đời") || lowerText.contains("life time")) {
            return purchaseDate.plusYears(100); // Trọn đời cho hẳn 100 năm
        }

        return purchaseDate.plusMonths(12); // Fallback an toàn
    }
}