package com.example.backend.service;

import java.util.List;
import java.util.Objects;
import java.util.Set;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import com.example.backend.dto.request.CreateUserRequest;
import com.example.backend.dto.request.UpdateProfileRequest;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.RoleName;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.example.backend.utils.CloudinaryUtil;
import com.example.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final CloudinaryUtil cloudinaryutil;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public UserResponse getInfo() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        Pageable pageable = PageRequest.of(0, 10);
        return userRepository.findAll(pageable).getContent().stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(RoleName role) {
        return userRepository.findByRoles_Name(role.name()).stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    @Transactional
    public UserResponse updateUserStatus(Integer userId, UserStatus status) {
        User user = userRepository.findById(userId).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() == UserStatus.TERMINATED) {
            log.warn("Attempted to change status of TERMINATED user ID: {}", userId);
            throw new CustomException(ErrorCode.USER_ALREADY_TERMINATED);
        }

        user.setStatus(status);

        return userMapper.toUserResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse createStaffAccount(CreateUserRequest request) {
        validateCreateUser(request);

        Role defaultRole = roleRepository.findByName(RoleName.STAFF.name()).orElseGet(() -> {
            log.info("Role STAFF not found, creating a new one");
            Role role = new Role();
            role.setName(RoleName.STAFF.name());
            return roleRepository.save(role);
        });

        User user = userMapper.toCreateStaff(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setStatus(UserStatus.ACTIVE);
        user.setAvatar(uploadAvatar(null, request.getAvatar()));
        user.setRoles(Set.of(defaultRole));

        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    @Transactional
    public UserResponse updateProfile(Integer userId, UpdateProfileRequest request) {
        User user = getUserOrThrow(userId);

        validateUpdateUser(user, request);

        userMapper.updateUser(user, request);

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            validatePassword(request.getPassword(), request.getConfirmPassword());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        user.setAvatar(uploadAvatar(user.getAvatar(), request.getAvatar()));

        return userMapper.toUserResponse(userRepository.save(user));
    }

    private User getUserOrThrow(Integer id) {
        return userRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
    }

    private void validateCreateUser(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.USER_EMAIL_EXISTED);
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new CustomException(ErrorCode.USER_PHONE_EXISTED);
        }

        if (request.getPassword() != null) {
            validatePassword(request.getPassword(), request.getConfirmPassword());
        }
    }

    private void validateUpdateUser(User user, UpdateProfileRequest request) {
        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.USER_EMAIL_EXISTED);
        }

        if (!Objects.equals(user.getPhone(), request.getPhone())
                && request.getPhone() != null
                && userRepository.existsByPhone(request.getPhone())) {
            throw new CustomException(ErrorCode.USER_PHONE_EXISTED);
        }

        if (request.getPassword() != null) {
            validatePassword(request.getPassword(), request.getConfirmPassword());
        }
    }

    private void validatePassword(String password, String confirmPassword) {
        if (password == null) return;

        if (!password.equals(confirmPassword)) {
            throw new CustomException(ErrorCode.AUTH_PASSWORD_NOT_MATCH);
        }
    }

    private String uploadAvatar(String oldAvatar, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            return oldAvatar;
        }

        if (oldAvatar != null && !oldAvatar.isBlank()) {
            try {
                cloudinaryutil.deleteFile(oldAvatar);
            } catch (Exception e) {
                log.error("Failed to delete old avatar on Cloudinary: {}", oldAvatar, e);
            }
        }

        return cloudinaryutil.saveFile(file);
    }

}
