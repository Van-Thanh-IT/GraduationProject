package com.example.backend.entity;

import com.example.backend.enums.NoteStatus;
import com.example.backend.enums.NoteType;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory_notes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryNote {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private NoteType type;

    @Column(nullable = false)
    private String reason;

    @Column(name = "user_id")
    private Integer userId;

    private String supplierName;

    @Column(precision = 15, scale = 2)
    private BigDecimal totalAmount = BigDecimal.ZERO;

    @Column(columnDefinition = "TEXT")
    private String note;

    @Enumerated(EnumType.STRING)
    private NoteStatus status = NoteStatus.PENDING;

    @Column(updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @OneToMany(mappedBy = "inventoryNote", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<InventoryNoteDetail> details;
}