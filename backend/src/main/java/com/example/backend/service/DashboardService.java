package com.example.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import com.example.backend.dto.response.DashboardResponse;
import com.example.backend.dto.response.DashboardResponse.*;
import com.example.backend.entity.ProductVariant;
import com.example.backend.enums.OrderStatus;
import com.example.backend.repository.*;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ReviewRepository reviewRepository;
    private final ProductVariantRepository productVariantRepository;

    public DashboardResponse getDashboardData(LocalDate startDate, LocalDate endDate) {
        LocalDateTime now = LocalDateTime.now();

        // 1. CHUẨN HÓA DẢI NGÀY LỌC (Mặc định 7 ngày gần nhất nếu không truyền)
        LocalDate actualStartDate = (startDate != null) ? startDate : now.minusDays(6).toLocalDate();
        LocalDate actualEndDate = (endDate != null) ? endDate : now.toLocalDate();

        LocalDateTime startDateTime = actualStartDate.atStartOfDay();
        LocalDateTime endDateTime = actualEndDate.atTime(LocalTime.MAX);

        // ==========================================
        // 2. KPI TỔNG QUAN (ĐỒNG BỘ THEO NGÀY LỌC)
        // ==========================================
        // Tính khoảng thời gian tương đương trong quá khứ để so sánh tăng trưởng
        long secondsBetween = Duration.between(startDateTime, endDateTime).getSeconds();
        LocalDateTime prevStart = startDateTime.minusSeconds(secondsBetween);
        LocalDateTime prevEnd = startDateTime.minusSeconds(1);

        BigDecimal currentRevenue = orderRepository.sumRevenueBetweenDates(startDateTime, endDateTime);
        BigDecimal previousRevenue = orderRepository.sumRevenueBetweenDates(prevStart, prevEnd);

        if (currentRevenue == null) currentRevenue = BigDecimal.ZERO;
        if (previousRevenue == null) previousRevenue = BigDecimal.ZERO;

        double growth = 0.0;
        if (previousRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = currentRevenue.subtract(previousRevenue)
                    .divide(previousRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .doubleValue();
        } else if (currentRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = 100.0;
        }

        KpiDto kpis = DashboardResponse.KpiDto.builder()
                .totalRevenue(currentRevenue)
                .revenueGrowth(growth)
                .newOrders(orderRepository.countByOrderStatusAndCreatedAtBetween(OrderStatus.PENDING, startDateTime, endDateTime))
                .totalCustomers(userRepository.countByCreatedAtBetween(startDateTime, endDateTime))
                .productsSold(orderItemRepository.sumTotalProductsSoldBetweenDates(startDateTime, endDateTime))
                .build();

        // ==========================================
        // 3. BIỂU ĐỒ DOANH THU & DANH MỤC (BUCKETING 7 CỘT)
        // ==========================================
        // Ép tối thiểu 7 ngày để thuật toán Bucketing không bị lỗi layout
        long totalDays = ChronoUnit.DAYS.between(actualStartDate, actualEndDate) + 1;
        if (totalDays < 7) {
            actualStartDate = actualEndDate.minusDays(6);
            startDateTime = actualStartDate.atStartOfDay();
            totalDays = 7;
        }

        List<Object[]> rawChartData = orderRepository.getRevenueChartData(startDateTime, endDateTime);
        Map<LocalDate, BigDecimal> revenueMap = new HashMap<>();
        for (Object[] row : rawChartData) {
            LocalDate dbDate = (row[0] instanceof java.sql.Date)
                    ? ((java.sql.Date) row[0]).toLocalDate()
                    : LocalDate.parse(row[0].toString());
            revenueMap.put(dbDate, (BigDecimal) row[1]);
        }

        List<ChartDataDto> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        double step = (double) totalDays / 7;

        for (int i = 0; i < 7; i++) {
            long startOffset = Math.round(i * step);
            long endOffset = Math.round((i + 1) * step) - 1;

            LocalDate bucketStart = actualStartDate.plusDays(startOffset);
            LocalDate bucketEnd = actualStartDate.plusDays(endOffset);

            String label = bucketStart.format(formatter);
            if (!bucketStart.isEqual(bucketEnd)) {
                label += " - " + bucketEnd.format(formatter);
            }

            BigDecimal bucketRevenue = BigDecimal.ZERO;
            LocalDate curr = bucketStart;
            while (!curr.isAfter(bucketEnd)) {
                bucketRevenue = bucketRevenue.add(revenueMap.getOrDefault(curr, BigDecimal.ZERO));
                curr = curr.plusDays(1);
            }

            chartData.add(ChartDataDto.builder()
                    .date(label)
                    .revenue(bucketRevenue)
                    .build());
        }

        List<CategoryShareDto> categoryChart = orderItemRepository.getCategoryRevenueShare(startDateTime, endDateTime).stream()
                .map(row -> CategoryShareDto.builder()
                        .categoryName((String) row[0])
                        .revenue((BigDecimal) row[1])
                        .build())
                .toList();

        // ==========================================
        // 4. TOP SẢN PHẨM, ĐƠN HÀNG, ĐÁNH GIÁ (ĐỒNG BỘ THEO NGÀY LỌC)
        // ==========================================
        List<TopProductDto> topProducts = orderItemRepository.findTop5BestSellingProductsBetweenDates(startDateTime, endDateTime).stream()
                .map(row -> TopProductDto.builder()
                        .productName((String) row[0])
                        .totalSold(((Number) row[1]).longValue())
                        .build())
                .toList();

        List<RecentOrderDto> recentOrders = orderRepository.findTop5ByCreatedAtBetweenOrderByCreatedAtDesc(startDateTime, endDateTime).stream()
                .map(o -> RecentOrderDto.builder()
                        .orderCode(o.getCode())
                        .customerName(o.getCustomerName())
                        .finalAmount(o.getFinalAmount())
                        .status(o.getOrderStatus().name())
                        .createdAt(o.getCreatedAt())
                        .build())
                .toList();

        Pageable pageable = PageRequest.of(0, 5, Sort.by("createdAt").descending());
        List<RecentReviewDto> recentReviews = reviewRepository.findByCreatedAtBetween(startDateTime, endDateTime, pageable).stream()
                .map(r -> RecentReviewDto.builder()
                        .productName(r.getProduct().getName())
                        .rating(r.getRating())
                        .comment(r.getComment())
                        .createdAt(r.getCreatedAt())
                        .build())
                .toList();

        // ==========================================
        // 5. CẢNH BÁO TỒN KHO (Giữ nguyên trạng thái hiện tại)
        // ==========================================
        List<AlertDto> alerts = new ArrayList<>();
        List<ProductVariant> lowStockItems = productVariantRepository.findTop10ByStockQuantityLessThanAndDeletedAtIsNull(5);
        for (ProductVariant pv : lowStockItems) {
            alerts.add(AlertDto.builder()
                    .type("LOW_STOCK")
                    .message(String.format("Sản phẩm [%s] sắp hết hàng (Chỉ còn %d)", pv.getSku(), pv.getStockQuantity()))
                    .build());
        }

        return DashboardResponse.builder()
                .kpis(kpis)
                .revenueChart(chartData)
                .categoryChart(categoryChart)
                .topProducts(topProducts)
                .recentOrders(recentOrders)
                .recentReviews(recentReviews)
                .alerts(alerts)
                .build();
    }
}