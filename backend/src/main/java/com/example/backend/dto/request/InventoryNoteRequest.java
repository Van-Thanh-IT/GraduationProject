package com.example.backend.dto.request;

import com.example.backend.enums.NoteType;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class InventoryNoteRequest {

    @NotNull(message = "Loại phiếu không được để trống")
    private NoteType type;

    @NotBlank(message = "Lý do không được để trống")
    private String reason;

    private Integer userId; // ID Admin đang thao tác
    private String supplierName;
    private String note;

    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    @Valid
    private List<NoteDetailRequest> details;

    @Data
    public static class NoteDetailRequest {
        @NotNull(message = "ID Biến thể không được để trống")
        private Integer productVariantId;

        @Min(value = 1, message = "Số lượng phải lớn hơn 0")
        private Integer quantity;

        @Min(value = 0, message = "Giá không được âm")
        private BigDecimal price;

        private List<String> serialNumbers;
    }
}