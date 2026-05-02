package com.example.backend.config;

import com.example.backend.dto.response.APIResponse;
import com.example.backend.exception.ErrorCode;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import tools.jackson.databind.ObjectMapper;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.JwtValidationException;
import org.springframework.security.oauth2.jwt.BadJwtException;


@Configuration
public class CustomExceptionHandler {

    @Bean
    public AuthenticationEntryPoint authenticationEntryPoint() {
        return (request, response, authException) -> {

            response.setContentType("application/json;charset=UTF-8");
            response.setStatus(HttpStatus.UNAUTHORIZED.value());

            String message = "Bạn chưa đăng nhập";

            if (authException.getCause() instanceof JwtException jwtEx) {

                if (jwtEx instanceof BadJwtException) {
                    message = "Token không hợp lệ";
                } else if (jwtEx instanceof JwtValidationException) {
                    message = "Token đã hết hạn hoặc không hợp lệ";
                } else {
                    message = "Lỗi xác thực JWT";
                }

            } else if (authException.getMessage().contains("Full authentication")) {
                message = "Bạn chưa đăng nhập";
            }

            APIResponse<?> apiResponse = APIResponse.builder()
                    .code(401)
                    .messages(message)
                    .build();

            new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
        };
    }


    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, accessDeniedException) -> {
            response.setStatus(HttpStatus.FORBIDDEN.value());
            response.setContentType("application/json;charset=UTF-8");

            APIResponse<?> apiResponse = APIResponse.builder()
                    .code(ErrorCode.AUTH_FORBIDDEN.getCode())
                    .messages(ErrorCode.AUTH_FORBIDDEN.getMessage())
                    .build();

            new ObjectMapper().writeValue(response.getOutputStream(), apiResponse);
        };
    }
}
