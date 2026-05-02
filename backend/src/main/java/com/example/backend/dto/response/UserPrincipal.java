package com.example.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private Integer userId;
    private String email;
    private Collection<? extends GrantedAuthority> authorities;

    @Override
    public String getUsername() {
        return email; // Bắt buộc ghi đè hàm này để trả về email
    }

    @Override
    public String getPassword() {
        return null; // Không cần thiết vì xác thực bằng JWT
    }

    // Các hàm dưới mặc định trả về true
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return true; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return true; }
}