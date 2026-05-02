package com.example.backend.dto.response;

import com.example.backend.enums.OrderStatus;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class OrderResponse {
    private Integer id;
    private String code;
    private LocalDateTime createdAt;

    // THÔNG TIN XUẤT HÓA ĐƠN (VAT)
    private Boolean isVatRequired;
    private String companyName;
    private String taxCode;
    private String companyAddress;

    // Trạng thái
    private OrderStatus orderStatus;

    // Khách hàng & Giao hàng
    private String customerName;
    private String customerPhone;
    private String fullShippingAddress; // Cộng dồn số nhà, xã, huyện, tỉnh

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
    private String vnpayUrl;

    // Lý do hủy / Ghi chú
    private String cancelReason;
    private String note;

    private List<OrderItemResponse> items;
}