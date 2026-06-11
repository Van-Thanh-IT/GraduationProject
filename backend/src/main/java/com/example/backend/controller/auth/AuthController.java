package com.example.backend.controller.auth;

import com.example.backend.enums.OtpType;
import jakarta.validation.Valid;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.service.AuthService;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.text.ParseException;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/auth")
public class AuthController {

    AuthService authService;

    @PostMapping("/introspect")
    public APIResponse<IntrospectResponse> introspect(@RequestBody IntrospectRequest request) {
        var result = authService.introspect(request);
        return APIResponse.<IntrospectResponse>builder()
                .code(200)
                .data(result)
                .build();
    }

    @PostMapping("/login")
    public ResponseEntity<APIResponse<AuthenticationResponse>> login(@RequestBody AuthenticationRequest request) {
        AuthenticationResponse response = authService.login(request);
        return buildAuthCookieResponse(response, "Đăng nhập thành công!");
    }

    @PostMapping("/google-login")
    public ResponseEntity<APIResponse<AuthenticationResponse>> loginWithGoogle(
            @RequestBody GoogleLoginRequest request) {
        AuthenticationResponse response = authService.loginWithGoogle(request.getIdToken());
        return buildAuthCookieResponse(response, "Đăng nhập Google thành công!");
    }

    @PostMapping("/facebook-login")
    public ResponseEntity<APIResponse<AuthenticationResponse>> loginWithFacebook(
            @RequestBody FacebookLoginRequest request) {
        AuthenticationResponse response = authService.loginWithFacebook(request.getAccessToken());
        return buildAuthCookieResponse(response, "Đăng nhập Facebook thành công!");
    }

    @PostMapping("/refresh-token")
    public ResponseEntity<APIResponse<AuthenticationResponse>> refreshToken(
            @CookieValue(name = "refreshToken") String refreshToken) throws ParseException {

        AuthenticationResponse response = authService.refreshToken(refreshToken);
        return buildAuthCookieResponse(response, "Làm mới token thành công!");
    }

    @PostMapping("/logout")
    public ResponseEntity<APIResponse<String>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken,
            @RequestBody(required = false) LogoutRequest request) throws ParseException {

        if (request != null && request.getToken() != null) {
            authService.logout(request.getToken());
        }

        if (refreshToken != null && !refreshToken.isBlank()) {
            authService.logout(refreshToken);
        }

        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("None")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(APIResponse.<String>builder()
                        .code(200)
                        .messages("Đăng xuất thành công, đã dọn sạch phiên đăng nhập!")
                        .build());
    }

    @PostMapping("/register")
    public APIResponse<String> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
        return APIResponse.<String>builder()
                .code(200)
                .messages("Đăng ký thành công! Vui lòng kiểm tra email để lấy mã OTP xác thực.")
                .build();
    }

    @PostMapping("/register/verify")
    public APIResponse<String> verifyRegisterOtp(@RequestParam String email, @RequestParam String otp) {
        authService.verifyRegistrationOtp(email, otp);
        return APIResponse.<String>builder()
                .code(200)
                .messages("Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.")
                .build();
    }

    @PostMapping("/register/resend-otp")
    public APIResponse<String> resendRegisterOtp(@RequestParam String email) {
        authService.sendOtp(email, OtpType.REGISTER);
        return APIResponse.<String>builder()
                .code(200)
                .messages("Đã gửi lại mã OTP đăng ký đến email của bạn.")
                .build();
    }

    @PostMapping("/otp/send")
    public APIResponse<String> sendOtp(@RequestParam String email) {
        authService.sendOtp(email, OtpType.RESET_PASSWORD);
        return APIResponse.<String>builder()
                .code(200)
                .messages("Đã gửi mã OTP đặt lại mật khẩu đến email của bạn.")
                .build();
    }

    @PostMapping("/otp/verify")
    public APIResponse<String> verifyOtp(@RequestParam String email, @RequestParam String otp) {
        authService.verifyOtp(email, otp);
        return APIResponse.<String>builder()
                .code(200)
                .messages("Xác thực OTP thành công. Vui lòng nhập mật khẩu mới.")
                .build();
    }

    @PostMapping("/reset-password")
    public APIResponse<String> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return APIResponse.<String>builder()
                .code(200)
                .messages("Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.")
                .build();
    }

    private ResponseEntity<APIResponse<AuthenticationResponse>> buildAuthCookieResponse(
            AuthenticationResponse authResponse, String successMessage) {

        ResponseCookie cookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(7 * 24 * 60 * 60)
                .sameSite("None")
                .build();

        authResponse.setRefreshToken(null);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(APIResponse.<AuthenticationResponse>builder()
                        .code(200)
                        .messages(successMessage)
                        .data(authResponse)
                        .build());
    }
}