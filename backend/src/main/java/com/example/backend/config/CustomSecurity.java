package com.example.backend.config;

import java.util.Objects;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;

@Component("customSecurity")
public class CustomSecurity {

    private final UserRepository userRepository;

    public CustomSecurity(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * Chek UserId login có phải chủ sở hữu hay ko
     */
    public boolean isOwner(Integer targetUserId) {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        String currentEmail = auth.getName();
        User loggedInUser = userRepository.findByEmail(currentEmail).orElse(null);
        if (loggedInUser == null) {
            return false;
        }

        return Objects.equals(loggedInUser.getId(), targetUserId);
    }
}
