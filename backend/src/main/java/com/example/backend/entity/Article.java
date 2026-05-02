package com.example.backend.entity;

import com.example.backend.enums.ArticleStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "articles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Article {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Tiêu đề bài viết (Ví dụ: "Apple ra mắt MacBook M3 mới nhất")
    @Column(nullable = false, length = 255)
    private String title;

    // ĐƯỜNG DẪN SEO - Cực kỳ quan trọng (Ví dụ: "apple-ra-mat-macbook-m3")
    @Column(nullable = false, unique = true, length = 255)
    private String slug;

    // Ảnh bìa bài viết (Hiển thị ở danh sách tin tức)
    @Column(name = "thumbnail_url", length = 1000)
    private String thumbnailUrl;

    // Tóm tắt ngắn (Hiển thị dưới ảnh bìa, khoảng 2-3 dòng)
    @Column(name = "short_description", length = 500)
    private String shortDescription;

    // NỘI DUNG CHÍNH: Phải dùng columnDefinition = "TEXT" vì bài viết chứa chuỗi HTML rất dài
    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    // Tác giả bài viết (Có thể liên kết @ManyToOne với bảng User/Admin, hoặc lưu tên dạng chuỗi cho nhẹ)
    @Column(name = "author_name", length = 100)
    private String authorName;

    // Bộ đếm lượt xem (Dùng để lọc "Tin tức thịnh hành / Đọc nhiều nhất")
    @Column(name = "view_count", nullable = false)
    @Builder.Default
    private Integer viewCount = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ArticleStatus status = ArticleStatus.DRAFT;

    // Thời gian hẹn giờ xuất bản (Ví dụ: Đêm nay Apple ra mắt thì cài đặt 2h sáng tự động Publish)
    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}