package com.example.backend.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.function.Predicate;
import java.util.regex.Pattern;

public final class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    private SlugUtil() {
        throw new UnsupportedOperationException("Utility class - Không được khởi tạo!");
    }

    /**
     * Chuyển đổi chuỗi text bất kỳ thành Slug chuẩn SEO
     */
    public static String toSlug(String input) {
        if (input == null || input.trim().isEmpty()) {
            return "";
        }

        String preProcessed = input.trim().replace("Đ", "D").replace("đ", "d").replace("Ð", "D");

        String noAccent = Normalizer.normalize(preProcessed, Normalizer.Form.NFD);
        noAccent = noAccent.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String lowerCase = noAccent.toLowerCase(Locale.ENGLISH);

        String hyphenated = WHITESPACE.matcher(lowerCase).replaceAll("-");

        String cleaned = NONLATIN.matcher(hyphenated).replaceAll("");

        return cleaned.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
    }

    /**
     * Tạo Slug duy nhất (Unique) bằng cách kiểm tra Database qua Predicate
     */
    public static String generateUniqueSlug(String name, Predicate<String> existsChecker) {
        String baseSlug = toSlug(name);

        if (baseSlug.isEmpty()) {
            baseSlug = "item-" + System.currentTimeMillis();
        }

        String slug = baseSlug;
        int count = 1;

        while (existsChecker.test(slug)) {
            slug = baseSlug + "-" + count++;
        }

        return slug;
    }
}
