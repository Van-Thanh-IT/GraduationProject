package com.example.backend.enums;

public enum ReviewStatus {
    PENDING,    // Chờ Admin duyệt (Tránh chửi bậy, link rác)
    APPROVED,   // Đã duyệt (Được phép hiển thị lên Website)
    HIDDEN      // Bị ẩn do vi phạm tiêu chuẩn cộng đồng
}