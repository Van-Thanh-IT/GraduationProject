package com.example.backend.utils;

import com.example.backend.dto.response.UserPrincipal;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {

    // Lấy UserId KHÔNG cần chạm vào Database
    public static Integer getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getUserId();
    }

    // Lấy Email KHÔNG cần chạm vào Database
    public static String getCurrentUserEmail() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new CustomException(ErrorCode.AUTH_UNAUTHENTICATED);
        }

        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        return principal.getEmail();
    }

}