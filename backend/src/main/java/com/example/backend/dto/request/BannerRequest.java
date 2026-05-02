package com.example.backend.dto.request;

import com.example.backend.enums.BannerPlacement;
import jakarta.validation.constraints.*;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDateTime;

@Data
public class BannerRequest {

    @NotBlank(message = "Tên chiến dịch không được để trống")
    @Size(max = 255, message = "Tên chiến dịch không được vượt quá 255 ký tự")
    private String title;

    @NotNull(message = "Vui lòng chọn vị trí hiển thị (placement)")
    private BannerPlacement placement;

    @Min(value = 0, message = "Thứ tự ưu tiên phải lớn hơn hoặc bằng 0")
    private Integer sortOrder = 0;

    private Boolean isActive = true;

    // Validate link: Phải bắt đầu bằng http hoặc https, hoặc rỗng
    @Pattern(regexp = "^(https?://.*)?$", message = "Đường dẫn đích (Target URL) không hợp lệ")
    private String targetUrl;

    // Không dùng @NotNull ở đây vì khi Update có thể không cần đổi ảnh
    // Việc bắt buộc có ảnh lúc Create sẽ được xử lý chặt ở Service
    private MultipartFile desktopImage;
    private MultipartFile mobileImage;

    @FutureOrPresent(message = "Thời gian bắt đầu không được nằm trong quá khứ")
    private LocalDateTime startDate;

    private LocalDateTime endDate;
}