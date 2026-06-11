package com.example.backend.entity;

import jakarta.persistence.*;

import com.example.backend.enums.AttributeStatus;

import lombok.*;

@Entity
@Table(name = "attributes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Attribute {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(length = 50)
    private String code;

    @Column(nullable = false, length = 10)
    @Enumerated(EnumType.STRING)
    private AttributeStatus status = AttributeStatus.ACTIVE;

    @Column(name = "filter_group", length = 50)
    private String filterGroup;
}
