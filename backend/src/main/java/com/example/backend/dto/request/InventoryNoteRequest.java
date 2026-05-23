package com.example.backend.dto.request;

import java.math.BigDecimal;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;

import com.example.backend.enums.NoteType;

import lombok.Data;

@Data
public class InventoryNoteRequest {

    @NotNull(message = "Loại phiếu không được để trống")
    private NoteType type;

    @NotBlank(message = "Lý do không được để trống")
    @Size(max = 255, message = "Lý do không được vượt quá 255 ký tự")
    private String reason;

    @Size(max = 255, message = "Tên nhà cung cấp không được vượt quá 255 ký tự")
    private String supplierName;

    @Size(max = 1000, message = "Ghi chú không được vượt quá 1000 ký tự")
    private String note;

    @NotEmpty(message = "Danh sách sản phẩm không được rỗng")
    @Size(max = 100, message = "Không được nhập/xuất quá 100 mặt hàng trong 1 phiếu")
    @Valid
    private List<NoteDetailRequest> details;

    @Data
    public static class NoteDetailRequest {

        @NotNull(message = "ID Biến thể không được để trống")
        private Integer productVariantId;

        @NotNull(message = "Số lượng không được để trống")
        @Min(value = 1, message = "Số lượng phải lớn hơn hoặc bằng 1")
        private Integer quantity;

        @NotNull(message = "Giá tiền không được để trống")
        @Min(value = 0, message = "Giá không được âm")
        @Digits(integer = 12, fraction = 2, message = "Giá tiền không hợp lệ (Tối đa 12 số nguyên và 2 số thập phân)")
        private BigDecimal price;

        private List<@NotBlank(message = "Mã IMEI không được chứa chuỗi rỗng") String> serialNumbers;
    }
}
