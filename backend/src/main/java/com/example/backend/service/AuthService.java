package com.example.backend.service;

import com.example.backend.dto.request.AuthenticationRequest;
import com.example.backend.dto.request.RegisterRequest;
import com.example.backend.dto.request.ResetPasswordRequest;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.entity.PasswordResetCode;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.RoleName;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.PasswordResetCodeRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;

import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;

import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import java.text.ParseException;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final PasswordResetCodeRepository otpRepository;
    private final JavaMailSender mailSender;

    private static final int MAX_ATTEMPTS = 5;
    private static final int OTP_VALID_MINUTES = 5;

    @Value("${spring.jwt.expiration}")
    private long expiration;

    @Value("${spring.jwt.refresh-expiration}")
    private long refreshExpiration;

    @Value("${spring.jwt.secret}")
    private String secret;

    @Value("${spring.jwt.google-client-id}")
    private String googleClientd;

    @Value("${spring.jwt.facebook.app-id}")
    private String appId;

    @Value("${spring.jwt.facebook.secret}")
    private String facebookSecret;

    // Đăng ký tài khoản
    public void register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new CustomException(ErrorCode.USER_EMAIL_EXISTED);
        }

        if (userRepository.existsByPhone(request.getPhone())) {
            throw new CustomException(ErrorCode.USER_PHONE_EXISTED);
        }

        if (!(request.getPassword().equals(request.getConfirmPassword()))) {
            throw new CustomException(ErrorCode.AUTH_PASSWORD_NOT_MATCH);
        }

        String passwordHash = passwordEncoder.encode(request.getPassword());

        User user = userMapper.toRegisterRequest(request);
        user.setPassword(passwordHash);

        Role defaultRole = roleRepository.findByName(RoleName.USER.name())
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(RoleName.USER.name());
                    return roleRepository.save(role);
                });

        user.setRoles(new HashSet<>(Set.of(defaultRole)));
        userRepository.save(user);
    }

    // Đăng nhập hệ thống bằng Email và Mật khẩu
    public AuthenticationResponse login(AuthenticationRequest request) {
        var user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email hoặc mật khẩu không đúng!"));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new RuntimeException("Email hoặc mật khẩu không đúng!");
        }

        var token = generateToken(user);
        var refreshToken = generateRefreshToken(user);
        AuthenticationResponse response = userMapper.toResponse(user);
        response.setToken(token);
        response.setRefreshToken(refreshToken);

        return response;
    }

    // Đăng nhập bằng Google
    public AuthenticationResponse loginWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), JacksonFactory.getDefaultInstance())
                    .setAudience(Collections.singletonList(googleClientd))
                    .build();

            GoogleIdToken idToken = verifier.verify(idTokenString);
            if (idToken == null) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            String username = (String) payload.get("name");
            String googleId = payload.getSubject();

            User user = userRepository.findByEmail(email).orElseGet(() -> {
                User newUser = new User();
                newUser.setEmail(email);
                newUser.setUsername(username);
                newUser.setProviderId(googleId);
                newUser.setProvider(AuthProvider.GOOGLE);
                newUser.setRoles(new HashSet<>(Set.of(
                        roleRepository.findByName(RoleName.USER.name())
                                .orElseThrow(() -> new CustomException(ErrorCode.ROLE_NOT_FOUND))
                )));
                newUser.setStatus(UserStatus.ACTIVE);
                return userRepository.save(newUser);
            });

            if (user.getProviderId() == null) {
                user.setProviderId(googleId);
                user.setProvider(AuthProvider.GOOGLE);
                userRepository.save(user);
            }

            var token = generateToken(user);
            var refreshToken = generateRefreshToken(user);
            AuthenticationResponse response = userMapper.toResponse(user);
            response.setToken(token);
            response.setRefreshToken(refreshToken);

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Tài khoản chưa được xác thực: " + e.getMessage(), e);
        }
    }

    // Đăng nhập bằng Facebook
    public AuthenticationResponse loginWithFacebook(String userAccessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String debugUrl = "https://graph.facebook.com/debug_token" +
                    "?input_token=" + userAccessToken +
                    "&access_token=" + appId + "|" + facebookSecret;

            Map<String, Object> debugResult = restTemplate.getForObject(debugUrl, Map.class);
            Map<String, Object> data = (Map<String, Object>) debugResult.get("data");

            if (data == null || !(Boolean) data.get("is_valid")) {
                throw new RuntimeException("Invalid Facebook token");
            }

            String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + userAccessToken;
            Map<String, Object> fbUser = restTemplate.getForObject(url, Map.class);

            String facebookId = (String) fbUser.get("id");
            String name = (String) fbUser.get("name");
            String email = (String) fbUser.get("email");

            User user = userRepository.findUserByProviderId(facebookId)
                    .or(() -> email != null ? userRepository.findByEmail(email) : Optional.empty())
                    .orElseGet(() -> {
                        User newUser = new User();
                        newUser.setProviderId(facebookId);
                        newUser.setUsername(name);
                        newUser.setProvider(AuthProvider.FACEBOOK);
                        newUser.setStatus(UserStatus.ACTIVE);
                        newUser.setEmail(email != null ? email : facebookId + "@facebook.com");
                        newUser.setRoles(Set.of(
                                roleRepository.findByName(RoleName.USER.name())
                                        .orElseThrow(() -> new RuntimeException("Role USER not found"))
                        ));
                        return userRepository.save(newUser);
                    });

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            String token = generateToken(user);
            var refreshToken = generateRefreshToken(user);

            AuthenticationResponse response = userMapper.toResponse(user);
            response.setToken(token);
            response.setRefreshToken(refreshToken);

            return response;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Tài khoản chưa được xác thực: " + e.getMessage(), e);
        }
    }

    // Cấp lại Access Token mới từ Refresh Token
    public AuthenticationResponse refreshToken(String refreshToken) {
        try {
            SignedJWT signedJWT = SignedJWT.parse(refreshToken);

            JWSVerifier verifier = new MACVerifier(secret.getBytes());
            if (!signedJWT.verify(verifier)) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
            }

            Date expirationTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expirationTime.before(new Date())) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_EXPIRED);
            }

            String email = signedJWT.getJWTClaimsSet().getSubject();

            User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

            if (user.getStatus() != UserStatus.ACTIVE) {
                throw new CustomException(ErrorCode.USER_DISABLED);
            }

            String newAccessToken = generateToken(user);

            return AuthenticationResponse.builder()
                    .token(newAccessToken)
                    .refreshToken(refreshToken)
                    .build();

        } catch (ParseException | JOSEException e) {
            throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
        }
    }

    // Yêu cầu gửi mã OTP đặt lại mật khẩu về email
    @Transactional
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        otpRepository.deleteByUser(user);

        String otp = String.valueOf(100000 + new Random().nextInt(900000));
        PasswordResetCode resetCode = PasswordResetCode.builder()
                .user(user)
                .code(otp)
                .expiredAt(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES))
                .attempts(0)
                .used(false)
                .build();

        otpRepository.save(resetCode);

        sendMail(user.getEmail(), otp);
    }

    // Xác thực tính đúng đắn của mã OTP
    @Transactional
    public boolean verifyOtp(String email, String otp) {
        validateAndGetOtp(email, otp);
        return true;
    }

    // Đặt lại mật khẩu mới
    @Transactional
    public void resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new CustomException(ErrorCode.AUTH_PASSWORD_NOT_MATCH);
        }

        PasswordResetCode resetCode = validateAndGetOtp(request.getEmail(), request.getOtp());

        User user = resetCode.getUser();
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        resetCode.setUsed(true);
        otpRepository.save(resetCode);
    }

    // Kiểm tra và trả về bản ghi OTP hợp lệ
    private PasswordResetCode validateAndGetOtp(String email, String otp) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        PasswordResetCode resetCode = otpRepository.findFirstByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new CustomException(ErrorCode.AUTH_OTP_INVALID));

        if (resetCode.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.AUTH_OTP_EXPIRED);
        }

        if (resetCode.getAttempts() >= MAX_ATTEMPTS) {
            throw new CustomException(ErrorCode.AUTH_ACCOUNT_LOCKED);
        }

        if (!resetCode.getCode().equals(otp)) {
            resetCode.setAttempts(resetCode.getAttempts() + 1);
            otpRepository.save(resetCode);
            throw new CustomException(ErrorCode.AUTH_OTP_INVALID);
        }
        return resetCode;
    }

    // Gửi email chứa mã OTP
    private void sendMail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("lovanthanh34523@gmail.com");
        message.setTo(to);
        message.setSubject("[TECH STORE] Mã OTP xác thực đặt lại mật khẩu");
        message.setText(
                "Xin chào,\n\n" +
                        "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.\n\n" +
                        "Mã xác thực (OTP) của bạn là: " + otp + "\n\n" +
                        "Mã OTP có hiệu lực trong " + OTP_VALID_MINUTES + " phút. Tuyệt đối KHÔNG chia sẻ mã này cho bất kỳ ai.\n\n" +
                        "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và kiểm tra lại bảo mật tài khoản.\n\n" +
                        "Trân trọng,\n" +
                        "Đội ngũ TECH STORE"
        );
        mailSender.send(message);
    }

    // Tạo JWT Access Token
    private String generateToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("teamProject2.com")
                .expirationTime(new Date(System.currentTimeMillis() + expiration))
                .claim("userId", user.getId())
                .claim("roles", buildScope(user))
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException ex) {
            throw new RuntimeException(ex);
        }
    }

    // Tạo JWT Refresh Token
    private String generateRefreshToken(User user) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("teamProject2.com")
                .claim("userId", user.getId())
                .expirationTime(new Date(System.currentTimeMillis() + refreshExpiration))

                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException ex) {
            throw new RuntimeException("Lỗi sinh Refresh Token", ex);
        }
    }

    // Xây dựng chuỗi phân quyền (scope/roles) cho token
    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> stringJoiner.add(role.getName()));
        }
        return stringJoiner.toString();
    }

}