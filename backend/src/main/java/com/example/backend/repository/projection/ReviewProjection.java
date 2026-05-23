package com.example.backend.repository.projection;

import java.time.LocalDateTime;

public interface ReviewProjection {
    Integer getId();

    String getCustomerName();

    String getCustomerAvatar();

    Integer getRating();

    String getComment();

    String getVariantSpecs();

    String getImages();

    LocalDateTime getCreatedAt();
}
