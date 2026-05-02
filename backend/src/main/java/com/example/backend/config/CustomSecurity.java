package com.example.backend.config;
import com.example.backend.entity.User;
import com.example.backend.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import java.util.Objects;

@Component("customSecurity") // Đặt tên Bean để gọi trong @PreAuthorize
public class CustomSecurity {

    private final UserRepository userRepository;

    public CustomSecurity(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Chek UserId login có phải chủ sở hữu hay ko
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

        // So sánh ID của người đang đăng nhập với targetUserId truyền vào từ đường dẫn API
        return Objects.equals(loggedInUser.getId(), targetUserId);
    }
}