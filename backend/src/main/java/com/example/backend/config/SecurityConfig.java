package com.example.backend.config;

import java.util.Collection;
import java.util.List;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.authentication.JwtGrantedAuthoritiesConverter;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.backend.dto.response.UserPrincipal;
import com.example.backend.enums.RoleName;

import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {
    @Value("${spring.jwt.secret}")
    private String secret;

    private static final String[] PUBLIC_ENDPOINT = {"/api/public/**", "/api/auth/**", "/ws/chat/**", "/api/chat/**"};

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10);
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity, CustomExceptionHandler exceptionHandler)
            throws Exception {
        httpSecurity
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csr -> csr.disable())
                .authorizeHttpRequests(auth -> auth.requestMatchers(PUBLIC_ENDPOINT)
                        .permitAll()
                        .requestMatchers("/api/admin/**")
                        .hasRole(RoleName.ADMIN.name())
                        .requestMatchers("/api/management/**")
                        .hasAnyRole(RoleName.STAFF.name(), RoleName.ADMIN.name())
                        .requestMatchers("/api/user/**")
                        .authenticated()
                        .anyRequest()
                        .authenticated())
                .oauth2ResourceServer(
                        auth2 -> auth2.authenticationEntryPoint(exceptionHandler.authenticationEntryPoint())
                                .accessDeniedHandler(exceptionHandler.accessDeniedHandler())
                                .jwt(jwt -> jwt.decoder(jwtDecoder())
                                        // Gọi Converter đã được Custom ở bên dưới
                                        .jwtAuthenticationConverter(customJwtAuthenticationConverter())));
        return httpSecurity.build();
    }

    @Bean
    public Converter<Jwt, AbstractAuthenticationToken> customJwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter grantedAuthoritiesConverter = new JwtGrantedAuthoritiesConverter();
        grantedAuthoritiesConverter.setAuthoritiesClaimName("roles");
        grantedAuthoritiesConverter.setAuthorityPrefix("ROLE_");

        return jwt -> {
            Collection<GrantedAuthority> authorities = grantedAuthoritiesConverter.convert(jwt);
            String email = jwt.getSubject();

            Integer userId = null;
            if (jwt.hasClaim("userId")) {
                userId = Integer.valueOf(jwt.getClaim("userId").toString());
            }

            UserPrincipal principal = new UserPrincipal(userId, email, authorities);

            return new UsernamePasswordAuthenticationToken(principal, jwt, authorities);
        };
    }

    @Bean
    JwtDecoder jwtDecoder() {
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(), "HS512");
        return NimbusJwtDecoder.withSecretKey(secretKey)
                .macAlgorithm(MacAlgorithm.HS512)
                .build();
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
