package com.example.backend.enums;

public enum OrderStatus {
    PENDING,
    CONFIRMED,
    READY_TO_SHIP,
    SHIPPING,
    DELIVERED,
    COMPLETED,
    CANCELLED,
    RETURNED;

    public boolean canConfirm() {
        return this == PENDING;
    }
}
