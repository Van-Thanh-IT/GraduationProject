package com.example.backend.dto.response;

import com.example.backend.entity.Role;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.Gender;
import com.example.backend.enums.UserStatus;
import lombok.Builder;
import lombok.Data;


import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
public class UserResponse {

    private Integer id;

    private String username;

    private String email;

    private String avatar;

    private String phone;

    private Gender gender;

    private LocalDate dateOfBirth;

    private AuthProvider provider;

    private UserStatus status;

    private LocalDateTime lastLogin;

    private LocalDateTime createdAt;

    private Set<Role> roles;
}
