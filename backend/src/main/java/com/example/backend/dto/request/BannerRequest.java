package com.example.backend.dto.request;

import java.time.LocalDateTime;
import jakarta.validation.constraints.*;
import org.springframework.web.multipart.MultipartFile;
import com.example.backend.enums.BannerPlacement;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BannerRequest {

    @NotBlank(message = "Tên chiến dịch không được để trống")
    @Size(max = 255, message = "Tên chiến dịch không được vượt quá 255 ký tự")
    private String title;

    @NotNull(message = "Vui lòng chọn vị trí hiển thị (placement)")
    private BannerPlacement placement;

    @Min(value = 0, message = "Thứ tự ưu tiên phải lớn hơn hoặc bằng 0")
    private Integer sortOrder = 0;

    private Boolean isActive = true;

    @Pattern(regexp = "^(https?://.*)?$", message = "Đường dẫn đích (Target URL) không hợp lệ")
    private String targetUrl;

    private MultipartFile desktopImage;

    private MultipartFile mobileImage;

    private LocalDateTime startDate;

    private LocalDateTime endDate;
}