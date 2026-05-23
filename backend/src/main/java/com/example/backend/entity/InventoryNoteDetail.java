package com.example.backend.entity;

import java.math.BigDecimal;
import java.util.List;

import jakarta.persistence.*;

import lombok.*;

@Entity
@Table(name = "inventory_note_details")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryNoteDetail {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_note_id", nullable = false)
    private InventoryNote inventoryNote;

    @Column(name = "product_variant_id", nullable = false)
    private Integer productVariantId;

    @Column(nullable = false)
    private Integer quantity;

    @Column(precision = 15, scale = 2)
    private BigDecimal price = BigDecimal.ZERO;

    @Transient
    private List<String> serialNumbers;
}
