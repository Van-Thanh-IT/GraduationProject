package com.example.backend.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtUtils {

    // Lấy Key bảo mật từ file application.yml
    @Value("${spring.jwt.secret}")
    private String secretKey;

    // Lấy thời gian sống của token từ application.yml
    @Value("${spring.jwt.expiration}")
    private long jwtExpiration;

    // ==========================================
    // 1. EXTRACT USERNAME (Lấy Email/Username từ Token)
    // ==========================================
    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    // ==========================================
    // 2. VALIDATE TOKEN (Kiểm tra Token có hợp lệ và khớp với User không)
    // ==========================================
    public boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        // Token hợp lệ nếu Email trong token khớp với Email trong DB VÀ chưa hết hạn
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    // ==========================================
    // 3. TẠO TOKEN (Dùng cho lúc Login)
    // ==========================================
    public String generateToken(UserDetails userDetails) {
        return generateToken(new HashMap<>(), userDetails);
    }

    public String generateToken(Map<String, Object> extraClaims, UserDetails userDetails) {
        return Jwts.builder()
                .setClaims(extraClaims)
                .setSubject(userDetails.getUsername())
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // ==========================================
    // CÁC HÀM PHỤ TRỢ (Dùng để giải mã Token)
    // ==========================================
    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSignInKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSignInKey() {
        byte[] keyBytes = secretKey.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }
}