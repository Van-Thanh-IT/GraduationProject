package com.example.backend.entity;

import com.example.backend.enums.BannerPlacement;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "banners")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banner {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tên chiến dịch để Admin dễ quản lý (VD: "Pre-order Galaxy S24", "Sale 11/11")
    @Column(nullable = false)
    private String title;

    // Ảnh hiển thị trên giao diện máy tính (Tỷ lệ ngang 16:9 hoặc 21:9)
    @Column(name = "image_url", nullable = false, length = 1000)
    private String imageUrl;

    // Ảnh hiển thị trên giao diện điện thoại (Tỷ lệ dọc 4:5 hoặc 1:1) - Cực kỳ quan trọng
    @Column(name = "mobile_image_url", length = 1000)
    private String mobileImageUrl;

    // Đường link khi khách hàng click vào banner (Dẫn tới trang danh mục hoặc chi tiết SP)
    @Column(name = "target_url", length = 1000)
    private String targetUrl;

    // Vị trí đặt banner trên website
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private BannerPlacement placement;

    // Ưu tiên hiển thị: Số càng nhỏ càng xếp lên đầu
    @Column(name = "sort_order", nullable = false)
    @Builder.Default
    private Integer sortOrder = 0;

    // Bật/tắt thủ công nhanh gọn
    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    // --- HẸN GIỜ TỰ ĐỘNG CHẠY CHIẾN DỊCH ---
    @Column(name = "start_date")
    private LocalDateTime startDate; // Từ ngày này mới bắt đầu hiện

    @Column(name = "end_date")
    private LocalDateTime endDate;   // Đến ngày này tự động ẩn đi

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}