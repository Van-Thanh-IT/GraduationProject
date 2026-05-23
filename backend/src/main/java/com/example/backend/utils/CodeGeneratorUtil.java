package com.example.backend.utils;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class CodeGeneratorUtil {

    private static final String CHARACTERS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private static final SecureRandom RANDOM = new SecureRandom();

    private CodeGeneratorUtil() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String generateVoucherCode() {
        return "VCH-" + generateRandomString(6);
    }

    public static String generateOrderCode() {
        String datePart = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyMMdd"));
        String randomPart = generateRandomString(4);
        return "ORD-" + datePart + "-" + randomPart;
    }

    private static String generateRandomString(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int randomIndex = RANDOM.nextInt(CHARACTERS.length());
            sb.append(CHARACTERS.charAt(randomIndex));
        }
        return sb.toString();
    }
}
