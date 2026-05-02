package com.example.backend.dto.response.client;

import com.example.backend.dto.response.OrderItemResponse;
import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
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

    // 5. Danh sách sản phẩm
    private List<ClientOrderItemResponse> items;
}