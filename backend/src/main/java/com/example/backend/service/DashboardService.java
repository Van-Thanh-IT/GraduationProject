package com.example.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.domain.PageRequest;
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

    public DashboardResponse getDashboardData() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfThisMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime startOfLastMonth = startOfThisMonth.minusMonths(1);
        LocalDateTime endOfLastMonth = startOfThisMonth.minusSeconds(1);

        BigDecimal thisMonthRevenue = orderRepository.sumRevenueBetweenDates(startOfThisMonth, now);
        BigDecimal lastMonthRevenue = orderRepository.sumRevenueBetweenDates(startOfLastMonth, endOfLastMonth);

        double growth = 0.0;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = thisMonthRevenue
                    .subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100))
                    .doubleValue();
        } else if (thisMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growth = 100.0;
        }

        KpiDto kpis = DashboardResponse.KpiDto.builder()
                .totalRevenue(thisMonthRevenue)
                .revenueGrowth(growth)
                .newOrders(orderRepository.countByOrderStatus(OrderStatus.PENDING))
                .totalCustomers(userRepository.countTotalCustomers())
                .productsSold(orderItemRepository.sumTotalProductsSold())
                .build();

        LocalDateTime sevenDaysAgo = now.minusDays(6).with(LocalTime.MIN);
        List<Object[]> rawChartData = orderRepository.getRevenueChartData(sevenDaysAgo);

        List<DashboardResponse.ChartDataDto> chartData = new ArrayList<>();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM");
        for (int i = 6; i >= 0; i--) {
            LocalDate dateObj = now.minusDays(i).toLocalDate();
            String dateStr = dateObj.toString(); // "YYYY-MM-DD"

            BigDecimal rev = BigDecimal.ZERO;
            for (Object[] row : rawChartData) {
                if (row[0].toString().equals(dateStr)) {
                    rev = (BigDecimal) row[1];
                    break;
                }
            }
            chartData.add(ChartDataDto.builder()
                    .date(dateObj.format(formatter))
                    .revenue(rev)
                    .build());
        }

        List<CategoryShareDto> categoryChart = orderItemRepository.getCategoryRevenueShare().stream()
                .map(row -> CategoryShareDto.builder()
                        .categoryName((String) row[0])
                        .revenue((BigDecimal) row[1])
                        .build())
                .toList();

        List<TopProductDto> topProducts = orderItemRepository.findTop5BestSellingProducts().stream()
                .map(row -> TopProductDto.builder()
                        .productName((String) row[0])
                        .totalSold(((Number) row[1]).longValue())
                        .build())
                .toList();

        List<RecentOrderDto> recentOrders = orderRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(o -> RecentOrderDto.builder()
                        .orderCode(o.getCode())
                        .customerName(o.getCustomerName())
                        .finalAmount(o.getFinalAmount())
                        .status(o.getOrderStatus().name())
                        .createdAt(o.getCreatedAt())
                        .build())
                .toList();

        List<RecentReviewDto> recentReviews =
                reviewRepository
                        .findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending()))
                        .stream()
                        .map(r -> RecentReviewDto.builder()
                                .productName(r.getProduct().getName())
                                .rating(r.getRating())
                                .comment(r.getComment())
                                .createdAt(r.getCreatedAt())
                                .build())
                        .toList();

        List<AlertDto> alerts = new ArrayList<>();
        List<ProductVariant> lowStockItems = productVariantRepository.findLowStockVariants(5); // Dưới 5 cái là báo động
        for (ProductVariant pv : lowStockItems) {
            alerts.add(AlertDto.builder()
                    .type("LOW_STOCK")
                    .message("Sản phẩm [" + pv.getSku() + "] sắp hết hàng (Chỉ còn " + pv.getStockQuantity() + ")")
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
