package com.example.backend.service;

import java.security.SecureRandom;
import java.text.ParseException;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.TimeUnit;

import jakarta.transaction.Transactional;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.CollectionUtils;
import org.springframework.web.client.RestTemplate;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.AuthenticationResponse;
import com.example.backend.dto.response.IntrospectResponse;
import com.example.backend.entity.InvalidatedToken;
import com.example.backend.entity.PasswordResetCode;
import com.example.backend.entity.Role;
import com.example.backend.entity.User;
import com.example.backend.enums.AuthProvider;
import com.example.backend.enums.RoleName;
import com.example.backend.enums.UserStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.UserMapper;
import com.example.backend.repository.InvalidatedTokenRepository;
import com.example.backend.repository.PasswordResetCodeRepository;
import com.example.backend.repository.RoleRepository;
import com.example.backend.repository.UserRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import com.nimbusds.jose.*;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jose.crypto.MACVerifier;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final SecureRandom SECURE_RANDOM = new SecureRandom();
    private static final int MAX_ATTEMPTS = 5;
    private static final int OTP_VALID_MINUTES = 5;

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final InvalidatedTokenRepository invalidatedTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private final PasswordResetCodeRepository otpRepository;
    private final JavaMailSender mailSender;

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

        User user = userMapper.toRegister(request);
        user.setPassword(passwordHash);

        Role defaultRole = roleRepository.findByName(RoleName.USER.name()).orElseGet(() -> {
            Role role = new Role();
            role.setName(RoleName.USER.name());
            return roleRepository.save(role);
        });

        user.setRoles(new HashSet<>(Set.of(defaultRole)));
        userRepository.save(user);
    }

    private User findOrCreateSocialUser(String providerId, String email, String username, AuthProvider provider) {
        return userRepository
                .findUserByProviderId(providerId)
                .or(() -> email != null ? userRepository.findByEmail(email) : Optional.empty())
                .map(user -> {
                    if (user.getProviderId() == null) {
                        user.setProviderId(providerId);
                        user.setProvider(provider);
                    }
                    return userRepository.save(user);
                })
                .orElseGet(() -> {
                    Role userRole = roleRepository
                            .findByName(RoleName.USER.name())
                            .orElseThrow(() -> new CustomException(ErrorCode.ROLE_NOT_FOUND));

                    User newUser = new User();
                    newUser.setProviderId(providerId);
                    newUser.setUsername(username);
                    newUser.setProvider(provider);
                    newUser.setStatus(UserStatus.ACTIVE);
                    newUser.setEmail(email != null ? email : providerId + "@social.com");
                    newUser.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
                    newUser.setRoles(Set.of(userRole));

                    return userRepository.save(newUser);
                });
    }

    public AuthenticationResponse login(AuthenticationRequest request) {
        var user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND, "Email hoặc mật khẩu không đúng!"));

        boolean authenticated = passwordEncoder.matches(request.getPassword(), user.getPassword());
        if (!authenticated) {
            throw new CustomException(ErrorCode.AUTH_PASSWORD_NOT_MATCH, "Email hoặc mật khẩu không đúng!");
        }

        var token = generateToken(user, expiration);
        var refreshToken = generateToken(user, refreshExpiration);

        log.info("token: {}", token);
        log.info("refreshToken: {}", refreshToken);
        AuthenticationResponse response = userMapper.toResponse(user);
        response.setToken(token);
        response.setRefreshToken(refreshToken);

        return response;
    }

    public AuthenticationResponse loginWithGoogle(String idTokenString) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
                    new NetHttpTransport(), GsonFactory.getDefaultInstance())
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

            User user = findOrCreateSocialUser(googleId, email, username, AuthProvider.GOOGLE);

            var token = generateToken(user, expiration);
            var refreshToken = generateToken(user, refreshExpiration);

            AuthenticationResponse response = userMapper.toResponse(user);
            response.setToken(token);
            response.setRefreshToken(refreshToken);

            return response;

        } catch (Exception e) {
            log.error("Lỗi xác thực Token Google từ Client: ", e);
            throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
        }
    }

    @SuppressWarnings("unchecked")
    public AuthenticationResponse loginWithFacebook(String userAccessToken) {
        try {
            RestTemplate restTemplate = new RestTemplate();

            String debugUrl = "https://graph.facebook.com/debug_token" + "?input_token="
                    + userAccessToken + "&access_token="
                    + appId + "|" + facebookSecret;

            Map<String, Object> debugResult = restTemplate.getForObject(debugUrl, Map.class);
            if (debugResult == null) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID, "Không nhận được phản hồi kiểm tra token từ Facebook");
            }

            Map<String, Object> data = (Map<String, Object>) debugResult.get("data");

            if (data == null || !(Boolean) data.get("is_valid")) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
            }

            String url = "https://graph.facebook.com/me?fields=id,name,email&access_token=" + userAccessToken;
            Map<String, Object> fbUser = restTemplate.getForObject(url, Map.class);

            if (fbUser == null) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID, "Không lấy được thông tin từ Facebook");
            }

            String facebookId = (String) fbUser.get("id");
            String name = (String) fbUser.get("name");
            String email = (String) fbUser.get("email");

            User user = findOrCreateSocialUser(facebookId, email, name, AuthProvider.FACEBOOK);

            user.setLastLogin(LocalDateTime.now());
            userRepository.save(user);

            var token = generateToken(user, expiration);
            var refreshToken = generateToken(user, refreshExpiration);

            AuthenticationResponse response = userMapper.toResponse(user);
            response.setToken(token);
            response.setRefreshToken(refreshToken);

            return response;

        } catch (Exception e) {
            log.error("Lỗi xác thực Token facebook từ Client: ", e);
            throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
        }
    }

    public IntrospectResponse introspect(IntrospectRequest request) {
        var token = request.getToken();
        boolean isValid = true;

        try {
            verifyToken(token);
        } catch (CustomException e) {
            isValid = false;
        }

        return IntrospectResponse.builder().valid(isValid).build();
    }

    public AuthenticationResponse refreshToken(String refreshToken) throws ParseException {
        var signToken = verifyToken(refreshToken);

        String jit = signToken.getJWTClaimsSet().getJWTID();
        Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

        //blacklist
        InvalidatedToken invalidateToken = InvalidatedToken.builder()
                .id(jit)
                .expiryTime(expiryTime)
                .build();
        invalidatedTokenRepository.save(invalidateToken);

        String email = signToken.getJWTClaimsSet().getSubject();

        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new CustomException(ErrorCode.USER_DISABLED);
        }


        String newAccessToken = generateToken(user, expiration);
         String newRefreshToken = generateToken(user, refreshExpiration);

        return AuthenticationResponse.builder()
                .token(newAccessToken)
                .refreshToken(newRefreshToken)
                .build();
    }

    public void logout(String token) throws ParseException {
        try {
            var signToken = verifyToken(token);

            String jit = signToken.getJWTClaimsSet().getJWTID();
            Date expiryTime = signToken.getJWTClaimsSet().getExpirationTime();

            InvalidatedToken invalidateToken = InvalidatedToken.builder()
                    .id(jit)
                    .expiryTime(expiryTime)
                    .build();

            invalidatedTokenRepository.save(invalidateToken);
        } catch (CustomException ex) {
            log.info("Token đã hết hạn", ex);
        }
    }

    private SignedJWT verifyToken(String token) {
        try {
            JWSVerifier verifier = new MACVerifier(secret.getBytes());
            SignedJWT signedJWT = SignedJWT.parse(token);

            boolean verified = signedJWT.verify(verifier);
            if (!verified) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID);
            }

            Date expiryTime = signedJWT.getJWTClaimsSet().getExpirationTime();
            if (expiryTime == null || expiryTime.before(new Date())) {
                throw new CustomException(ErrorCode.AUTH_TOKEN_EXPIRED);
            }

            String jwtId = signedJWT.getJWTClaimsSet().getJWTID();
            if (jwtId == null || invalidatedTokenRepository.existsById(jwtId)) {
                throw new CustomException(ErrorCode.AUTH_UNAUTHENTICATED);
            }

            return signedJWT;

        } catch (ParseException | JOSEException e) {
            log.error("Lỗi khi xác minh Token: {}", e.getMessage());
            throw new CustomException(ErrorCode.AUTH_UNAUTHENTICATED);
        }
    }

    private String generateToken(User user, long durationSeconds) {
        JWSHeader header = new JWSHeader(JWSAlgorithm.HS512);

        JWTClaimsSet jwtClaimsSet = new JWTClaimsSet.Builder()
                .subject(user.getEmail())
                .issuer("vanthanh.com")
                .issueTime(Date.from(Instant.now()))
                .expirationTime(new Date(System.currentTimeMillis() + TimeUnit.SECONDS.toMillis(durationSeconds)))
                .claim("userId", user.getId())
                .claim("roles", buildScope(user))
                .jwtID(UUID.randomUUID().toString())
                .build();

        Payload payload = new Payload(jwtClaimsSet.toJSONObject());
        JWSObject jwsObject = new JWSObject(header, payload);

        try {
            jwsObject.sign(new MACSigner(secret.getBytes()));
            return jwsObject.serialize();
        } catch (JOSEException ex) {
            log.error("Lỗi sinh Access Token: ", ex);
            throw new CustomException(ErrorCode.AUTH_TOKEN_INVALID, "Lỗi hệ thống khi sinh Token");
        }
    }

    private String buildScope(User user) {
        StringJoiner stringJoiner = new StringJoiner(" ");
        if (!CollectionUtils.isEmpty(user.getRoles())) {
            user.getRoles().forEach(role -> stringJoiner.add(role.getName()));
        }
        return stringJoiner.toString();
    }

    @Transactional
    public void sendOtp(String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        otpRepository.deleteByUser(user);

        String rawOtp = String.valueOf(100000 + SECURE_RANDOM.nextInt(900000));
        String hashedOtp = passwordEncoder.encode(rawOtp);

        PasswordResetCode resetCode = PasswordResetCode.builder()
                .user(user)
                .code(hashedOtp)
                .expiredAt(LocalDateTime.now().plusMinutes(OTP_VALID_MINUTES))
                .attempts(0)
                .used(false)
                .build();

        otpRepository.save(resetCode);

        sendMail(user.getEmail(), rawOtp);
    }

    @Transactional
    public void verifyOtp(String email, String otp) {
        validateAndGetOtp(email, otp);
    }

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

    private PasswordResetCode validateAndGetOtp(String email, String otp) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));

        PasswordResetCode resetCode = otpRepository
                .findFirstByUserAndUsedFalseOrderByCreatedAtDesc(user)
                .orElseThrow(() -> new CustomException(ErrorCode.AUTH_OTP_INVALID));

        if (resetCode.getExpiredAt().isBefore(LocalDateTime.now())) {
            throw new CustomException(ErrorCode.AUTH_OTP_EXPIRED);
        }

        if (resetCode.getAttempts() >= MAX_ATTEMPTS) {
            throw new CustomException(ErrorCode.AUTH_ACCOUNT_LOCKED);
        }

        if (!passwordEncoder.matches(otp, resetCode.getCode())) {
            resetCode.setAttempts(resetCode.getAttempts() + 1);
            otpRepository.save(resetCode);
            throw new CustomException(ErrorCode.AUTH_OTP_INVALID);
        }
        return resetCode;
    }

    private void sendMail(String to, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("lovanthanh34523@gmail.com");
        message.setTo(to);
        message.setSubject("[TECH STORE] Mã OTP xác thực đặt lại mật khẩu");
        message.setText("Xin chào,\n\n"
                + "Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản liên kết với email này.\n\n"
                + "Mã xác thực (OTP) của bạn là: "
                + otp + "\n\n" + "Mã OTP có hiệu lực trong "
                + OTP_VALID_MINUTES + " phút. Tuyệt đối KHÔNG chia sẻ mã này cho bất kỳ ai.\n\n"
                + "Nếu bạn không thực hiện yêu cầu này, vui lòng bỏ qua email và kiểm tra lại bảo mật tài khoản.\n\n"
                + "Trân trọng,\n"
                + "Đội ngũ TECH STORE");
        mailSender.send(message);
    }
}