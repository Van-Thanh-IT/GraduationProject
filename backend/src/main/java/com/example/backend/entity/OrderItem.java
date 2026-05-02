package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;

@Entity
@Table(name = "order_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id")
    private ProductVariant productVariant;

    @Column(name = "product_name", nullable = false)
    private String productName;

    @Column(length = 100)
    private String sku;

    private String thumbnail;

    @Column(name = "option1_name", length = 50)
    private String option1Name;

    @Column(name = "option1_value", length = 50)
    private String option1Value;

    @Column(name = "option2_name", length = 50)
    private String option2Name;

    @Column(name = "option2_value", length = 50)
    private String option2Value;

    @Column(name = "option3_name", length = 50)
    private String option3Name;

    @Column(name = "option3_value", length = 50)
    private String option3Value;

    @Column(nullable = false)
    private Integer quantity;

    @Column(nullable = false, precision = 15, scale = 2)
    private BigDecimal price;

    @Column(name = "total_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal totalPrice;

    @Column(name = "is_serial_required")
    private Boolean isSerialRequired;
}