package com.example.backend.dto.response.admin;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import com.example.backend.enums.OrderStatus;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class AdminOrderResponse {
    private Integer id;
    private String code;
    private LocalDateTime createdAt;

    // THÔNG TIN XUẤT HÓA ĐƠN (VAT)
    private Boolean isVatRequired;
    private String companyName;
    private String taxCode;
    private String customerEmail;
    private String companyAddress;

    // Trạng thái
    private OrderStatus orderStatus;

    // Khách hàng & Giao hàng
    private String customerName;
    private String customerPhone;
    private String fullShippingAddress;

    // Giao vận
    private String shippingCarrier;
    private String trackingNumber;
    private String shippingStatus;

    // Tài chính
    private BigDecimal totalAmount;
    private BigDecimal discountAmount;
    private BigDecimal shippingFee;
    private BigDecimal finalAmount;

    // Thanh toán (Lấy trạng thái thanh toán mới nhất)
    private String paymentMethod;
    private String paymentStatus;

    // Lý do hủy / Ghi chú
    private String cancelReason;
    private String note;

    private List<OrderItem> items;

    @Data
    @Builder
    public static class OrderItem {

        private Integer id;

        private Integer variantId;

        private String productName;

        private String sku;

        private String thumbnail;

        private String variantInfo;

        private Integer quantity;

        private BigDecimal price;

        private BigDecimal totalPrice;

        private Boolean isSerialRequired;
    }
}
