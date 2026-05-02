package com.example.backend.enums;

// Phân định rõ ai là người gửi tin nhắn này
public enum SenderRole {
    ADMIN,      // Quản trị viên
    STAFF,      // Nhân viên CSKH
    USER,       // Khách hàng có tài khoản
    GUEST       // Khách vãng lai (Chưa đăng nhập)
}