package com.example.backend.dto.response;

import com.example.backend.enums.NoteStatus;
import com.example.backend.enums.NoteType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryNoteResponse {
    private Integer id;
    private String code;
    private NoteType type;
    private String reason;
    private Integer userId;
    private String supplierName;
    private BigDecimal totalAmount;
    private String note;
    private NoteStatus status;
    private LocalDateTime createdAt;

    // Danh sách chi tiết phiếu kho
    private List<InventoryNoteDetailResponse> details;
}