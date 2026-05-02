package com.example.backend.dto.response;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
public class AwaitingReviewResponse {
    // ID của OrderItem - CỰC KỲ QUAN TRỌNG:
    // Khi khách bấm nút Đánh giá, Frontend sẽ lấy ID này để gửi lên POST /reviews
    private Integer orderItemId;

    // Thông tin cơ bản để hiển thị sản phẩm
    private Integer productId;
    private String productName;
    private String thumbnail;

    // Phân loại hàng (Ví dụ: "Đen, Size M")
    private String variantSpecs;

    // Giá và số lượng khách đã mua
    private BigDecimal price;
    private Integer quantity;

    // Ngày mua (Đơn hàng)
    private LocalDateTime orderDate;
}