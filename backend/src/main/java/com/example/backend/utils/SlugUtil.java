package com.example.backend.utils;

import java.text.Normalizer;
import java.util.Locale;
import java.util.regex.Pattern;

public class SlugUtil {

    private static final Pattern NONLATIN = Pattern.compile("[^\\w-]");
    private static final Pattern WHITESPACE = Pattern.compile("[\\s]");

    public static String toSlug(String input) {

        if (input == null) {
            return null;
        }

        String noAccent = Normalizer.normalize(input, Normalizer.Form.NFD);
        noAccent = noAccent.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");

        String lowerCase = noAccent.toLowerCase(Locale.ENGLISH);

        String hyphenated = WHITESPACE.matcher(lowerCase).replaceAll("-");

        return NONLATIN.matcher(hyphenated).replaceAll("");
    }
}