package com.example.backend.config;

import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.RoleName;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
// THÊM 3 IMPORT NÀY CHO SPRING SECURITY
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import com.example.backend.dto.response.UserPrincipal; // <-- Import UserPrincipal của bạn

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class Application {
    private final PasswordEncoder passwordEncoder;

    // =========================================================
    // 1. TẠO DỮ LIỆU MẪU (ADMIN) KHI CHẠY APP
    // =========================================================
    @Bean
    public ApplicationRunner applicationRunner(
            UserRepository userRepository,
            RoleRepository roleRepository
    ) {
        return args -> {
            // Tạo role ADMIN nếu chưa có
            Role adminRole = roleRepository.findByName(RoleName.ADMIN.name())
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName(RoleName.ADMIN.name());
                        return roleRepository.save(role);
                    });

            String email = "lovanthanh34523@gmail.com";

            if (userRepository.findByEmail(email).isEmpty()) {
                User adminDefault = User.builder()
                        .username("vanthanh")
                        .email(email)
                        .password(passwordEncoder.encode("12345678"))
                        .phone("0353198531")
                        .roles(new HashSet<>(Set.of(adminRole)))
                        .build();

                userRepository.save(adminDefault);
                log.info("Default admin account created successfully!");
            } else {
                log.info("Default admin already exists.");
            }
        };
    }

    // =========================================================
    // 2. KHAI BÁO USER_DETAILS_SERVICE ĐỂ FIX LỖI WEBSOCKET
    // =========================================================
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            // 1. Tìm user trong Database bằng email
            User user = userRepository.findByEmail(username)
                    .orElseThrow(() -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + username));

            // 2. Chuyển đổi danh sách Role của User thành GrantedAuthority
            List<SimpleGrantedAuthority> authorities =
                    user.getRoles().stream()
                            // Nếu bạn lưu DB là "ADMIN", Spring thường chuộng thêm tiền tố "ROLE_"
                            // Nếu hệ thống phân quyền của bạn đang chạy tốt thì cứ để nguyên tiền tố bạn đang dùng
                            .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName()))
                            .collect(java.util.stream.Collectors.toList());

            // 3. Khởi tạo UserPrincipal đúng với @AllArgsConstructor
            return new UserPrincipal(
                    user.getId(),
                    user.getEmail(),
                    authorities
            );
        };
    }
}