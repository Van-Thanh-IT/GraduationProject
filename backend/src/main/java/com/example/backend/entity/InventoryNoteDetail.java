package com.example.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.util.List;

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

    // Mảng ảo (Không lưu vào bảng này, dùng để truyền dữ liệu IMEI trong quá trình xử lý)
    @Transient
    private List<String> serialNumbers;
}