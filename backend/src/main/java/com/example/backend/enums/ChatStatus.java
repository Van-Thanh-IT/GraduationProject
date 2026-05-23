package com.example.backend.enums;

public enum ChatStatus {
    WAITING, // Chờ tiếp nhận (Nằm ở Tab 1 - Khách chờ)
    ASSIGNED, // Đã có Admin/Staff nhận (Nằm ở Tab 2 - Đang hỗ trợ)
    CLOSED // Đã giải quyết xong (Đóng chat để làm sạch giao diện)
}
