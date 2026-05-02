package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

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