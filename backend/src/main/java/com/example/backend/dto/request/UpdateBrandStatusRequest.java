package com.example.backend.dto.request;

import com.example.backend.enums.BrandStatus;
import lombok.Data;

@Data
public class UpdateBrandStatusRequest {
    private BrandStatus status;
}
