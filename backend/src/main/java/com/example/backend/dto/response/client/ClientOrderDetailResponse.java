package com.example.backend.dto.response.client;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class ClientOrderDetailResponse {
    // 1. Thông tin chung
    private Integer id;
    private String code;
    private String orderStatus;
    private LocalDateTime createdAt;
    private String note;
    private String cancelReason;

    // 2. Giao hàng
    private String customerName;
    private String customerPhone;
    private String fullShippingAddress;
    private String shippingCarrier;
    private String trackingNumber; // Rất quan trọng để khách tra cứu

    // 3. Thanh toán
    private String paymentMethod;
    private String paymentStatus;
    private BigDecimal totalAmount;
    private BigDecimal shippingFee;
    private BigDecimal discountAmount;
    private BigDecimal finalAmount;

    // 4. Hóa đơn (Để khách tự xem lại xem mình điền đúng MST chưa)
    private Boolean isVatRequired;
    private String companyName;
    private String taxCode;
    private String companyAddress;

    private List<OrderItem> items;

    @Getter
    @Setter
    @Builder
    public static class OrderItem {
        private Integer productId;
        private String slug;
        private Integer variantId;
        private String productName;
        private String variantInfo;
        private String thumbnail;
        private BigDecimal price;
        private Integer quantity;
        private BigDecimal totalPrice;
    }
}
