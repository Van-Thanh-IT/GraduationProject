package com.example.backend.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "flash_sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashSale {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant;

    @Column(name = "flash_sale_price", nullable = false, precision = 15, scale = 2)
    private BigDecimal flashSalePrice;

    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    @Column(name = "sale_stock_quantity", nullable = false)
    private Integer saleStockQuantity;

    @Column(name = "sold_quantity")
    @Builder.Default
    private Integer soldQuantity = 0;

    @Column(name = "max_quantity_per_user")
    @Builder.Default
    private Integer maxQuantityPerUser = 1;

    @Column(name = "status")
    @Builder.Default
    private Integer status = 1;
}
