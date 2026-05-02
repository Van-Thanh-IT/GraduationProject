package com.example.backend.dto.response;

import com.example.backend.enums.UserStatus;
import lombok.*;

import java.util.Set;

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
