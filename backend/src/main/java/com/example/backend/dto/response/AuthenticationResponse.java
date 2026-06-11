package com.example.backend.dto.response;

import java.util.Set;

import com.example.backend.enums.UserStatus;

import lombok.*;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthenticationResponse {
    private String token;
    private String refreshToken;
    private String email;
    private UserStatus status;
    private Set<String> roles;
}
