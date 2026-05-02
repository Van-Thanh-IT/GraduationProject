//package com.example.backend.entity;
//
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.SQLDelete;
//import org.hibernate.annotations.SQLRestriction;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "reviews")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//@SQLDelete(sql = "UPDATE reviews SET deleted_at = NOW() WHERE id = ?")
//@SQLRestriction("deleted_at IS NULL")
//public class Review {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Integer id;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "product_id", nullable = false)
//    private Product product;
//
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "user_id", nullable = false)
//    private User user;
//
//    @Column(nullable = false)
//    private Integer rating;
//
//    @Column(columnDefinition = "TEXT")
//    private String comment;
//
//    @Column(length = 1000)
//    private String image;
//
//    @Column(name = "is_verified_purchase", nullable = false)
//    @Builder.Default
//    private Boolean isVerifiedPurchase = false;
//
//    @CreationTimestamp
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//    @Column(name = "deleted_at")
//    private LocalDateTime deletedAt;
//}

package com.example.backend.entity;

import com.example.backend.enums.ReviewStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.SQLDelete;
import org.hibernate.annotations.SQLRestriction;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@SQLDelete(sql = "UPDATE reviews SET deleted_at = NOW() WHERE id = ?")
@SQLRestriction("deleted_at IS NULL")
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // --- CÁC KHÓA NGOẠI TỐI ƯU HIỆU NĂNG ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product; // Giữ lại để Query lấy danh sách đánh giá siêu tốc

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user; // Giữ lại để hiển thị Tên, Avatar người đánh giá mà ko cần qua bảng Order

    // --- CÁC KHÓA NGOẠI ĐỊNH DANH NGHIỆP VỤ ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_variant_id", nullable = false)
    private ProductVariant productVariant; // Lấy Tên phân loại (Màu, Size)

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_item_id", unique = true, nullable = false)
    private OrderItem orderItem; // Khóa chết 1-1, chặn đứng Spam review

    // --- NỘI DUNG ĐÁNH GIÁ ---
    @Column(nullable = false)
    private Integer rating; // Số sao (1-5)

    @Column(columnDefinition = "TEXT")
    private String comment;

    // Quản lý kiểm duyệt (APPROVED thì mới cho hiển thị lên web)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ReviewStatus status = ReviewStatus.PENDING;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // --- QUAN HỆ VỚI BẢNG ẢNH ---
    @OneToMany(mappedBy = "review", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<ReviewImage> images = new ArrayList<>();

    public void addImage(ReviewImage image) {
        images.add(image);
        image.setReview(this);
    }
}