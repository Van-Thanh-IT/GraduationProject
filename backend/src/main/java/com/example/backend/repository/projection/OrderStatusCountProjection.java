package com.example.backend.repository.projection;

public interface OrderStatusCountProjection {
    String getStatus();
    Long getCount();
}