package com.example.backend.config;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.example.backend.enums.UserStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.example.backend.dto.response.UserPrincipal;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.RoleName;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.transaction.annotation.Transactional;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class Application {
    private final PasswordEncoder passwordEncoder;

    @Value("${spring.admin.email}")
    private String adminEmail;

    @Value("${spring.admin.password}")
    private String adminPassword;

    @Value("${spring.admin.username}")
    private String adminUsername;

    @Value("${spring.admin.phone}")
    private String adminPhone;

    @Bean
    @Transactional
    public ApplicationRunner applicationRunner(UserRepository userRepository, RoleRepository roleRepository) {
        return args -> {

            for (RoleName roleName : RoleName.values()) {
                if (roleRepository.findByName(roleName.name()).isEmpty()) {
                    Role newRole = new Role();
                    newRole.setName(roleName.name());
                    roleRepository.save(newRole);

                    log.info("Created role: {}", roleName.name());
                } else {
                    log.info("Role already exists: {}", roleName.name());
                }
            }

            Role adminRole = roleRepository
                    .findByName(RoleName.ADMIN.name())
                    .orElseThrow(() -> new CustomException(ErrorCode.ROLE_NOT_FOUND));

            if (userRepository.findByEmail(adminEmail).isEmpty()) {
                User adminDefault = User.builder()
                        .username(adminUsername)
                        .email(adminEmail)
                        .status(UserStatus.ACTIVE)
                        .password(passwordEncoder.encode(adminPassword))
                        .phone(adminPhone)
                        .roles(new HashSet<>(Set.of(adminRole)))
                        .build();

                userRepository.save(adminDefault);
                log.info("Default admin account created successfully!");
            } else {
                log.info("Default admin already exists.");
            }
        };
    }

    /**
     * KHAI BÁO USER_DETAILS_SERVICE ĐỂ FIX LỖI WEBSOCKET
     */
    @Bean
    public UserDetailsService userDetailsService(UserRepository userRepository) {
        return username -> {
            User user = userRepository
                    .findByEmail(username)
                    .orElseThrow(
                            () -> new UsernameNotFoundException("Không tìm thấy tài khoản với email: " + username));

            List<SimpleGrantedAuthority> authorities = user.getRoles().stream()
                    .map(role -> new org.springframework.security.core.authority.SimpleGrantedAuthority(role.getName()))
                    .toList();

            return new UserPrincipal(user.getId(), user.getEmail(), authorities);
        };
    }
}
