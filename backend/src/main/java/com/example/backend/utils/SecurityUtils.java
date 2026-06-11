package com.example.backend.utils;

import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import com.example.backend.dto.response.UserPrincipal;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;

public class SecurityUtils {

    private SecurityUtils() {
        throw new UnsupportedOperationException("Utility class");
    }

    public static Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return Objects.requireNonNull(principal, "Principal is null").getUserId();
    }

    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomException(ErrorCode.AUTH_UNAUTHENTICATED);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return Objects.requireNonNull(principal, "Principal is null").getEmail();
    }
}
