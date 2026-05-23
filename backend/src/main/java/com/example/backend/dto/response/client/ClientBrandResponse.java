package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;

@Builder
@Data
public class ClientBrandResponse {
    private Integer id;
    private String name;
    private String slug;
    private String logoUrl;
}
