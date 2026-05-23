package com.example.backend.mapper;

import java.util.Set;
import java.util.stream.Collectors;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.CreateUserRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.request.UpdateProfileRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;

@Mapper(componentModel = "spring")
public interface UserMapper {
    User toRegister(RegisterRequest request);

    @Mapping(target = "avatar", ignore = true)
    User toCreateStaff(CreateUserRequest request);

    @Mapping(target = "avatar", ignore = true)
    @Mapping(target = "password", ignore = true)
    void updateUser(@MappingTarget User user, UpdateProfileRequest request);

    UserResponse toUserResponse(User user);

    @Mapping(target = "token", ignore = true)
    @Mapping(target = "refreshToken", ignore = true)
    @Mapping(target = "roles", expression = "java(mapRoles(user.getRoles()))")
    AuthenticationResponse toResponse(User user);

    default Set<String> mapRoles(Set<Role> roles) {
        if (roles == null) return Set.of();

        return roles.stream().map(Role::getName).collect(Collectors.toSet());
    }
}
