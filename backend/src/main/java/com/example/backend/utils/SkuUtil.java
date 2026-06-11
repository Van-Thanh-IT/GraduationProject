package com.example.backend.utils;

import java.text.Normalizer;
import java.util.Random;
import java.util.regex.Pattern;

public class SkuUtil {

    private static final Random RANDOM = new Random();

    private SkuUtil() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static String generateSku(String productName, String option1, String option2, String option3) {
        String productCode = generateProductCode(productName);
        StringBuilder sku = new StringBuilder(productCode);

        appendOption(sku, option1);
        appendOption(sku, option2);
        appendOption(sku, option3);

        sku.append("-").append(generate6DigitNumber());

        return sku.toString().toUpperCase();
    }

    private static void appendOption(StringBuilder sb, String option) {
        if (option != null && !option.isBlank()) {
            String normalized = normalize(option);
            if (!normalized.isEmpty()) {
                sb.append("-").append(normalized);
            }
        }
    }

    private static String generateProductCode(String name) {
        if (name == null || name.isBlank()) return "PROD";

        String cleanName = removeAccent(name);
        cleanName = cleanName.replaceAll("[^a-zA-Z0-9 ]", "");

        String[] words = cleanName.trim().split("\\s+");
        StringBuilder code = new StringBuilder();

        for (String word : words) {
            if (word.isBlank()) continue;

            if (word.matches(".*\\d.*")) {
                code.append(word);
            } else {

                code.append(word.charAt(0));
            }
        }
        return code.toString().toUpperCase();
    }

    private static String normalize(String input) {
        if (input == null || input.isBlank()) return "";
        return removeAccent(input).replaceAll("[^a-zA-Z0-9]", "").toUpperCase();
    }

    private static String removeAccent(String s) {
        if (s == null) return "";

        String temp = s.replace("Đ", "D").replace("đ", "d");

        String nfdNormalizedString = Normalizer.normalize(temp, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        return pattern.matcher(nfdNormalizedString).replaceAll("");
    }

    private static String generate6DigitNumber() {
        return String.format("%06d", RANDOM.nextInt(1000000));
    }
}
