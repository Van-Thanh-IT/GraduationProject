package com.example.backend.service;

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
import com.example.backend.utils.Cloudinaryutil;
import com.example.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final Cloudinaryutil cloudinaryutil;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserResponse getInfo() {
        String email = SecurityUtils.getCurrentUserEmail();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        return userMapper.toUserResponse(user);
    }

    public List< UserResponse> getAllUsers(){
        Pageable pageable = PageRequest.of(0, 10);
        return userRepository.findAll(pageable)
                .getContent()
                .stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public List<UserResponse> getUsersByRole(RoleName role) {
        return userRepository.findByRoles_Name(role.name())
                .stream()
                .map(userMapper::toUserResponse)
                .toList();
    }

    public UserResponse updateUserStatus(Integer userId, UserStatus status){
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        if(user.getStatus() == UserStatus.TERMINATED){
            throw new CustomException(ErrorCode.USER_ALREADY_TERMINATED);
        }

        user.setStatus(status);

        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    public UserResponse createStaffAccount(CreateUserRequest request){

        if(userRepository.existsByEmail(request.getEmail())){
            throw new CustomException(ErrorCode.USER_EMAIL_EXISTED);
        }

        if(!request.getPassword().equals(request.getConfirmPassword())){
            throw new CustomException(ErrorCode.AUTH_PASSWORD_NOT_MATCH);
        }

        if(userRepository.existsByPhone(request.getPhone())){
            throw new CustomException(ErrorCode.USER_PHONE_EXISTED);
        }

        String avatarUrl = null;

        if (request.getAvatar() != null && !request.getAvatar().isEmpty()) {
            avatarUrl = cloudinaryutil.saveFile(request.getAvatar());
        }

        Role defaultRole = roleRepository.findByName(RoleName.STAFF.name())
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.STAFF.name());
                    return roleRepository.save(role);
                });

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = userMapper.toCreateStaff(request);
        user.setPassword(passwordHash);
        user.setStatus(UserStatus.ACTIVE);
        user.setAvatar(avatarUrl);
        user.setRoles(new HashSet<>(Set.of(defaultRole)));
        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    public UserResponse updateProfile(Integer userId, UpdateProfileRequest request){
        User user = userRepository.findById(userId).orElseThrow(
                () -> new CustomException(ErrorCode.USER_NOT_FOUND)
        );

        if(!user.getEmail().equals(request.getEmail())
                && userRepository.existsByEmail(request.getEmail())){
            throw new CustomException(ErrorCode.USER_EMAIL_EXISTED);
        }

        if(!user.getPhone().equals(request.getPhone())
                && userRepository.existsByPhone(request.getPhone())){
            throw new CustomException(ErrorCode.USER_PHONE_EXISTED);
        }

        if(!request.getPassword().equals(request.getConfirmPassword())){
            throw new CustomException(ErrorCode.AUTH_PASSWORD_NOT_MATCH);
        }

        if(request.getAvatar() != null && !request.getAvatar().isEmpty()){
            if(user.getAvatar() != null){
                cloudinaryutil.deleteFile(user.getAvatar());
            }
            user.setAvatar(cloudinaryutil.saveFile(request.getAvatar()));
        }
        String passwordHash = passwordEncoder.encode(request.getPassword());

        userMapper.updateUser(user,request);
        user.setPassword(passwordHash);


        userRepository.save(user);

        return  userMapper.toUserResponse(user);
    }

}
