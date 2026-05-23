package com.example.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.*;

import com.example.backend.enums.OrderStatus;

import lombok.*;

@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String code;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "voucher_id")
    private Voucher voucher;

    @Column(name = "customer_name", nullable = false, length = 100)
    private String customerName;

    @Column(name = "customer_phone", nullable = false, length = 20)
    private String customerPhone;

    @Column(name = "customer_email", length = 150)
    private String customerEmail;

    @Column(name = "shipping_address", nullable = false)
    private String shippingAddress;

    @Column(name = "shipping_ward", nullable = false, length = 100)
    private String shippingWard;

    @Column(name = "shipping_district", nullable = false, length = 100)
    private String shippingDistrict;

    @Column(name = "shipping_city", nullable = false, length = 100)
    private String shippingCity;

    @Column(name = "shipping_ward_code", length = 20)
    private String shippingWardCode;

    @Column(name = "shipping_district_code", length = 20)
    private String shippingDistrictCode;

    @Column(name = "shipping_city_code", length = 20)
    private String shippingCityCode;

    @Column(name = "is_vat_required")
    @Builder.Default
    private Boolean isVatRequired = false;

    @Column(name = "company_name")
    private String companyName;

    @Column(name = "tax_code", length = 50)
    private String taxCode;

    @Column(name = "company_address")
    private String companyAddress;

    @Column(name = "total_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalAmount;

    @Column(name = "discount_amount", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal discountAmount = BigDecimal.ZERO;

    @Column(name = "shipping_fee", precision = 15, scale = 2)
    @Builder.Default
    private BigDecimal shippingFee = BigDecimal.ZERO;

    @Column(name = "final_amount", nullable = false, precision = 15, scale = 2)
    private BigDecimal finalAmount;

    @Column(name = "goship_shipment_id", length = 50)
    private String goshipShipmentId;

    @Column(name = "shipping_carrier", length = 50)
    private String shippingCarrier;

    @Column(name = "tracking_number", length = 50)
    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "order_status")
    @Builder.Default
    private OrderStatus orderStatus = OrderStatus.PENDING;

    @Column(name = "cancel_reason")
    private String cancelReason;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<OrderItem> orderItems = new ArrayList<>();

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Payment> payments = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
