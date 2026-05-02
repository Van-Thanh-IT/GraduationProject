package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class DashboardResponse {
    private KpiDto kpis;
    private List<ChartDataDto> revenueChart; // Biểu đồ doanh thu 7 ngày
    private List<CategoryShareDto> categoryChart; // Biểu đồ tròn danh mục
    private List<TopProductDto> topProducts;
    private List<RecentOrderDto> recentOrders;
    private List<RecentReviewDto> recentReviews;
    private List<AlertDto> alerts;


    @Data @Builder
    public static class KpiDto {
        private BigDecimal totalRevenue;
        private Double revenueGrowth; // % tăng trưởng so với tháng trước
        private Long newOrders; // Đơn đang chờ xử lý (PENDING)
        private Long totalCustomers;
        private Long productsSold;
    }

    @Data @Builder
    public static class ChartDataDto {
        private String date;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class CategoryShareDto {
        private String categoryName;
        private BigDecimal revenue;
    }

    @Data @Builder
    public static class TopProductDto {
        private String productName;
        private Long totalSold;
    }

    @Data @Builder
    public static class RecentOrderDto {
        private String orderCode;
        private String customerName;
        private BigDecimal finalAmount;
        private String status;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class RecentReviewDto {
        private String productName;
        private Integer rating;
        private String comment;
        private LocalDateTime createdAt;
    }

    @Data @Builder
    public static class AlertDto {
        private String type; // LOW_STOCK, FLASH_SALE_ENDING
        private String message;
    }
}