package com.example.backend.enums;

public enum OrderStatus {
    PENDING,         // Chờ xác nhận (Khách mới đặt)
    CONFIRMED,       // Đã xác nhận (Shop đang nhặt hàng)
    READY_TO_SHIP,   // Chờ lấy hàng (Đã đóng gói, đã bắn đơn sang Goship lấy Tracking Number)
    SHIPPING,        // Đang giao hàng (Bưu tá đã lấy, đang trên đường giao)
    DELIVERED,       // Đã giao thành công (Goship báo 905, nhưng chưa đối soát tiền)
    COMPLETED,       // Hoàn thành (Goship báo 913 hoặc Đã nhận được tiền COD)
    CANCELLED,       // Đã hủy (Khách hủy hoặc Shop hủy)
    RETURNED         // Chuyển hoàn (Goship báo 908 - Khách bom hàng, trả về kho)
}