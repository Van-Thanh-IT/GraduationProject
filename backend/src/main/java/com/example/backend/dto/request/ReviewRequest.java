//package com.example.backend.dto.request;
//
//import jakarta.validation.constraints.Max;
//import jakarta.validation.constraints.Min;
//import jakarta.validation.constraints.NotNull;
//import lombok.Data;
//import org.springframework.web.multipart.MultipartFile;
//
//@Data
//public class ReviewRequest {
//    @NotNull(message = "ID Sản phẩm không được để trống")
//    private Integer productId;
//
//    @NotNull(message = "Vui lòng chọn số sao đánh giá (1-5)")
//    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
//    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
//    private Integer rating;
//
//    private String comment;
//
//    private MultipartFile image;
//
//}
package com.example.backend.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

@Data
public class ReviewRequest {

    // ĐỔI MỚI: Dùng orderItemId làm chìa khóa gốc thay vì productId
    @NotNull(message = "ID Chi tiết đơn hàng (OrderItem) không được để trống")
    private Integer orderItemId;

    @NotNull(message = "Vui lòng chọn số sao đánh giá (1-5)")
    @Min(value = 1, message = "Đánh giá thấp nhất là 1 sao")
    @Max(value = 5, message = "Đánh giá cao nhất là 5 sao")
    private Integer rating;

    private String comment;

    // ĐỔI MỚI: Nhận danh sách mảng file ảnh thay vì 1 file đơn lẻ
    private List<MultipartFile> images;

}