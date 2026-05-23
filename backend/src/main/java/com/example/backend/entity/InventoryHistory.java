package com.example.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

import com.example.backend.enums.ReferenceType;

import lombok.*;

@Entity
@Table(name = "inventory_history")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "product_variant_id", nullable = false)
    private Integer productVariantId;

    @Column(nullable = false)
    private Integer previousQuantity;

    @Column(nullable = false)
    private Integer changeAmount;

    @Column(nullable = false)
    private Integer newQuantity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ReferenceType referenceType;

    @Column(nullable = false)
    private Integer referenceId;

    private String note;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
