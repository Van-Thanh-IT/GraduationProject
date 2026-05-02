//package com.example.backend.controller.auth;
//
//import com.example.backend.dto.request.*;
//import com.example.backend.dto.response.APIResponse;
//import com.example.backend.dto.response.AuthenticationResponse;
//import com.example.backend.dto.response.UserResponse;
//import com.example.backend.service.AuthService;
//import com.example.backend.service.UserService;
//
//import jakarta.validation.Valid;
//import lombok.AccessLevel;
//import lombok.RequiredArgsConstructor;
//import lombok.experimental.FieldDefaults;
//
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.*;
//
//@RestController
//@RequiredArgsConstructor
//@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
//@RequestMapping("/api/auth")
//public class AuthController {
//
//    AuthService authService;
//    UserService userService;
//
//    // AUTH BASIC
//    @PostMapping("/register")
//    public APIResponse<?> register(@RequestBody @Valid RegisterRequest request) {
//
//        authService.register(request);
//
//        return APIResponse.builder()
//                .code(200)
//                .messages("Đăng ký thành công!")
//                .build();
//    }
//
//    @PostMapping("/login")
//    public APIResponse<AuthenticationResponse> login(
//            @RequestBody AuthenticationRequest request
//    ) {
//
//        AuthenticationResponse response = authService.login(request);
//
//        return APIResponse.<AuthenticationResponse>builder()
//                .code(200)
//                .messages("Đăng nhập thành công!")
//                .data(response)
//                .build();
//    }
//
//    @PostMapping("/refresh-token")
//    public ResponseEntity<AuthenticationResponse> refreshToken(
//            @Valid @RequestBody RefreshTokenRequest request
//    ) {
//
//        AuthenticationResponse response =
//                authService.refreshToken(request.getRefreshToken());
//
//        return ResponseEntity.ok(response);
//    }
//
//
//    // USER INFO
//    @GetMapping("/info")
//    public APIResponse<UserResponse> getInfo() {
//        return APIResponse.success(userService.getInfo());
//    }
//
//
//    //  OTP & RESET PASSWORD
//    @PostMapping("/otp/send")
//    public ResponseEntity<?> sendOtp(@RequestParam String email) {
//        authService.sendOtp(email);
//        return ResponseEntity.ok("Đã gửi OTP");
//    }
//
//    @PostMapping("/otp/verify")
//    public ResponseEntity<?> verifyOtp(
//            @RequestParam String email,
//            @RequestParam String otp
//    ) {
//        boolean result = authService.verifyOtp(email, otp);
//        if (!result) {
//            return ResponseEntity.badRequest().body("OTP không đúng");
//        }
//        return ResponseEntity.ok("Xác thực thành công");
//    }
//
//    @PostMapping("/reset-password")
//    public ResponseEntity<?> resetPassword(
//            @RequestBody ResetPasswordRequest request
//    ) {
//        authService.resetPassword(request);
//        return ResponseEntity.ok("Quên mật khẩu thành công");
//    }
//
//
//    //SOCIAL LOGIN
//    @PostMapping("/google-login")
//    public APIResponse<AuthenticationResponse> loginWithGoogle(
//            @RequestBody GoogleLoginRequest request
//    ) {
//
//        AuthenticationResponse response =
//                authService.loginWithGoogle(request.getIdToken());
//
//        return APIResponse.<AuthenticationResponse>builder()
//                .code(200)
//                .messages("Đăng nhập Google thành công!")
//                .data(response)
//                .build();
//    }
//
//    @PostMapping("/facebook-login")
//    public APIResponse<AuthenticationResponse> loginWithFacebook(
//            @RequestBody FacebookLoginRequest request
//    ) {
//        AuthenticationResponse response =
//                authService.loginWithFacebook(request.getAccessToken());
//
//        return APIResponse.<AuthenticationResponse>builder()
//                .code(200)
//                .messages("Đăng nhập Facebook thành công!")
//                .data(response)
//                .build();
//    }
//}
package com.example.backend.controller.auth;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.UserResponse;
import com.example.backend.service.AuthService;
import com.example.backend.service.UserService;

import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequestMapping("/api/auth")
public class AuthController {

    AuthService authService;
    UserService userService;

    // ==========================================
    // 1. NHÓM ĐĂNG NHẬP (DÙNG CHUNG HELPER)
    // ==========================================

    @PostMapping("/login")
    public ResponseEntity<APIResponse<AuthenticationResponse>> login(
            @RequestBody AuthenticationRequest request) {
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

    // ==========================================
    // 2. LÀM MỚI TOKEN (ĐỌC TỪ COOKIE)
    // ==========================================

    @PostMapping("/refresh-token")
    public ResponseEntity<APIResponse<AuthenticationResponse>> refreshToken(
            @CookieValue(name = "refreshToken") String refreshToken) {
        // Lấy refreshToken từ Cookie trình duyệt gửi lên, không lấy từ Body nữa
        AuthenticationResponse response = authService.refreshToken(refreshToken);
        return buildAuthCookieResponse(response, "Làm mới token thành công!");
    }

    // ==========================================
    // 5. ĐĂNG XUẤT (XÓA SẠCH COOKIE)
    // ==========================================

    @PostMapping("/logout")
    public ResponseEntity<APIResponse<String>> logout(
            @CookieValue(name = "refreshToken", required = false) String refreshToken) {

        // 2. Tạo một Cookie "Tử thần" đè lên Cookie cũ
        ResponseCookie deleteCookie = ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true) // Nên set true nếu chạy HTTPS
                .path("/")
                .maxAge(0) // MA THUẬT NẰM Ở ĐÂY: Max-Age = 0 sẽ lệnh cho trình duyệt xóa ngay lập tức
                .sameSite("Strict")
                .build();

        // 3. Trả về Response
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, deleteCookie.toString())
                .body(APIResponse.<String>builder()
                        .code(200)
                        .messages("Đăng xuất thành công, đã dọn sạch Token!")
                        .build());
    }

    // ==========================================
    // 3. NHÓM ĐĂNG KÝ & THÔNG TIN
    // ==========================================

    @PostMapping("/register")
    public APIResponse<?> register(@RequestBody @Valid RegisterRequest request) {
        authService.register(request);
        return APIResponse.builder()
                .code(200)
                .messages("Đăng ký thành công!")
                .build();
    }

    // ==========================================
    // 4. NHÓM OTP & QUÊN MẬT KHẨU
    // ==========================================

    @PostMapping("/otp/send")
    public ResponseEntity<?> sendOtp(@RequestParam String email) {
        authService.sendOtp(email);
        return ResponseEntity.ok("Đã gửi OTP");
    }

    @PostMapping("/otp/verify")
    public ResponseEntity<?> verifyOtp(
            @RequestParam String email,
            @RequestParam String otp) {
        boolean result = authService.verifyOtp(email, otp);
        if (!result) {
            return ResponseEntity.badRequest().body("OTP không đúng");
        }
        return ResponseEntity.ok("Xác thực thành công");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        return ResponseEntity.ok("Quên mật khẩu thành công");
    }

    // ==========================================
    // 🛠 HÀM HELPER ĐÓNG GÓI COOKIE BẢO MẬT
    // ==========================================

    private ResponseEntity<APIResponse<AuthenticationResponse>> buildAuthCookieResponse(
            AuthenticationResponse authResponse, String successMessage) {

        // 1. Gói Refresh Token vào HttpOnly Cookie
        ResponseCookie cookie = ResponseCookie.from("refreshToken", authResponse.getRefreshToken())
                .httpOnly(true)
                .secure(true) // Nên set true nếu chạy HTTPS
                .path("/")
                .maxAge(7 * 24 * 60 * 60) // 7 ngày
                .sameSite("Strict")
                .build();

        // 2. Xóa Refresh Token khỏi Body trước khi trả về Frontend (Ngăn XSS)
        authResponse.setRefreshToken(null);

        // 3. Trả về kết quả
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(APIResponse.<AuthenticationResponse>builder()
                        .code(200)
                        .messages(successMessage)
                        .data(authResponse)
                        .build());
    }
}