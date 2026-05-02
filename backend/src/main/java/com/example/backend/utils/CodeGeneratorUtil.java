package com.example.backend.utils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CodeGeneratorUtil {

    // Tập ký tự an toàn: Đã loại bỏ các chữ dễ nhìn nhầm như O (chữ o) và 0 (số không), I và 1.
    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    /**
     * Sinh mã Voucher ngẫu nhiên (VD: VCH-K8A9P2)
     */
    public static String generateVoucherCode() {
        return "VCH-" + generateRandomString(6);
    }

    /**
     * Sinh mã Đơn hàng chuẩn Shopee/Tiki (VD: ORD-260318-X8F2)
     * Chứa ngày tháng năm hiện tại để dễ truy vết + 4 mã ngẫu nhiên
     */
    public static String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomPart = generateRandomString(4);
        return "ORD-" + datePart + "-" + randomPart;
    }

    // Hàm dùng chung để lấy chuỗi ngẫu nhiên
    private static String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = RANDOM.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(randomIndex));
        }
        return sb.toString();
    }
}