package com.example.backend.dto.response.client;

import java.util.List;
import java.util.Map;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class OrderPageResponse {
    private Map<String, Long> statusSummary;

    private List<ClientOrderResponse> content;
    private int currentPage;
    private int totalPages;
    private long totalElements;
    private boolean isLast;
}
