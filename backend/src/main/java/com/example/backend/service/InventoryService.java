package com.example.backend.service;

import com.example.backend.dto.request.InventoryNoteRequest;
import com.example.backend.dto.response.InventoryHistoryResponse;
import com.example.backend.dto.response.InventoryNoteResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.*;
import com.example.backend.mapper.InventoryNoteMapper;
import com.example.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryNoteRepository noteRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryHistoryRepository historyRepository;
    private final ProductSerialRepository serialRepository;

    private final InventoryNoteMapper noteMapper;


    // =========================================================================
    // 1. API ĐỌC DỮ LIỆU (GET) - TÌM KIẾM & XEM CHI TIẾT
    // =========================================================================

    public List<InventoryNoteResponse> getAllNotes() {
        List<InventoryNote> notes = noteRepository.findAll();
        List<InventoryNoteResponse> responses = new ArrayList<>();

        for (InventoryNote note : notes) {
            InventoryNoteResponse response = noteMapper.toResponse(note);
            fillSerialsIntoResponse(response); // Đắp Serial
            responses.add(response);
        }
        return responses;
    }

    public InventoryNoteResponse getNoteById(Integer id) {
        InventoryNote note = noteRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy phiếu kho"));

        InventoryNoteResponse response = noteMapper.toResponse(note);
        fillSerialsIntoResponse(response); // Đắp Serial

        return response;
    }

    public List<InventoryHistoryResponse> getHistoryByVariantId(Integer variantId) {
        return historyRepository.findByProductVariantIdOrderByCreatedAtDesc(variantId)
                .stream()
                .map(noteMapper::toResponse) // SỬA LỖI: Dùng historyMapper thay vì noteMapper
                .collect(Collectors.toList());
    }

    // Hàm phụ trợ giúp tái sử dụng code cho getAllNotes và getNoteById
    private void fillSerialsIntoResponse(InventoryNoteResponse response) {
        if (response.getDetails() != null) {
            for (var detail : response.getDetails()) {
                List<String> serials = serialRepository.findSerialNumbers(response.getId(), detail.getProductVariantId());
                detail.setSerialNumbers(serials != null ? serials : new ArrayList<>()); // Tránh trả về null
            }
        }
    }

    // =========================================================================
    // 2. API GHI DỮ LIỆU (POST) - TẠO PHIẾU NHẬP / XUẤT
    // =========================================================================

    @Transactional(rollbackFor = Exception.class)
    public InventoryNoteResponse createAndCompleteNote(InventoryNoteRequest request) {

        // 1. KHỞI TẠO PHIẾU KHO
        InventoryNote note = new InventoryNote();
        note.setCode(request.getType().name() + "-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        note.setType(request.getType());
        note.setReason(request.getReason());
        note.setUserId(request.getUserId());
        note.setSupplierName(request.getSupplierName());
        note.setNote(request.getNote());
        note.setStatus(NoteStatus.COMPLETED); // Chốt trực tiếp

        // Phải lưu trước để sinh ID dùng cho Serial và History
        InventoryNote savedNote = noteRepository.save(note);

        List<InventoryNoteDetail> details = new ArrayList<>();
        BigDecimal tempTotal = BigDecimal.ZERO;

        // 2. DUYỆT QUA TỪNG SẢN PHẨM CẦN NHẬP/XUẤT
        for (InventoryNoteRequest.NoteDetailRequest reqDetail : request.getDetails()) {

            InventoryNoteDetail detail = new InventoryNoteDetail();
            detail.setInventoryNote(savedNote);
            detail.setProductVariantId(reqDetail.getProductVariantId());
            detail.setQuantity(reqDetail.getQuantity());
            detail.setPrice(reqDetail.getPrice() != null ? reqDetail.getPrice() : BigDecimal.ZERO);
            detail.setSerialNumbers(reqDetail.getSerialNumbers());

            details.add(detail);
            tempTotal = tempTotal.add(detail.getPrice().multiply(new BigDecimal(detail.getQuantity())));

            // Phân luồng xử lý
            if (request.getType().equals(NoteType.IMPORT)) {
                executeImportLogic(reqDetail, savedNote.getId());
            } else if (request.getType().equals(NoteType.EXPORT)) {
                executeExportLogic(reqDetail, savedNote.getId());
            } else if (request.getType().equals(NoteType.ADJUST)) {
                // TODO: Chức năng kiểm kê xử lý sau
            }
        }

        // 3. CẬP NHẬT LẠI TỔNG TIỀN VÀO PHIẾU GỐC
        savedNote.setDetails(details);
        savedNote.setTotalAmount(tempTotal);
        InventoryNote finalNote = noteRepository.save(savedNote);

        return noteMapper.toResponse(finalNote);
    }

    // =========================================================================
    // 3. CÁC HÀM XỬ LÝ NGHIỆP VỤ LÕI TÁCH RỜI (CORE LOGIC)
    // =========================================================================

    private void executeImportLogic(InventoryNoteRequest.NoteDetailRequest reqDetail, Integer noteId) {
        ProductVariant variant = variantRepository.findByIdWithLock(reqDetail.getProductVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm ID " + reqDetail.getProductVariantId() + " không tồn tại"));

        int oldQuantity = variant.getStockQuantity();
        int changeAmount = reqDetail.getQuantity();
        int newQuantity = oldQuantity + changeAmount;

        // 1. CỘNG TỒN KHO
        variant.setStockQuantity(newQuantity);
        variantRepository.save(variant);

        // 2. GHI LỊCH SỬ KHO
        saveHistory(variant.getId(), oldQuantity, changeAmount, newQuantity, ReferenceType.INVENTORY_NOTE, noteId, "Nhập kho");

        // 3. XỬ LÝ IMEI TRỰC TIẾP
        List<String> serials = reqDetail.getSerialNumbers();

        // =====================================================================
        // [THÊM MỚI] KIỂM TRA CHẶT CHẼ isSerialRequired TRƯỚC KHI XỬ LÝ
        // =====================================================================
        if (variant.getIsSerialRequired()) {
            // NẾU BẮT BUỘC CÓ SERIAL -> Mà kho không truyền lên hoặc truyền thiếu/thừa
            if (serials == null || serials.size() != changeAmount) {
                throw new IllegalArgumentException(String.format(
                        "BẮT BUỘC: Sản phẩm ID %d yêu cầu quét mã Serial/IMEI và Phải quét đúng %d mã để nhập kho!",
                        variant.getId(), changeAmount
                ));
            }
        } else {
            // NẾU KHÔNG CẦN SERIAL -> Mà kho lại lanh chanh quét mã gửi lên
            if (serials != null && !serials.isEmpty()) {
                throw new IllegalArgumentException(String.format(
                        "LỖI: Sản phẩm ID %d KHÔNG quản lý bằng Serial. Vui lòng không quét mã cho sản phẩm này!",
                        variant.getId()
                ));
            }
        }
        // =====================================================================

        // (ĐOẠN CODE CŨ GIỮ NGUYÊN BÊN DƯỚI)
        if (serials != null && !serials.isEmpty()) {
            // Đã xóa cái lệnh if check size() cũ ở đây vì bên trên ta đã check chặt rồi
            for (String sn : serials) {
                if (serialRepository.existsBySerialNumber(sn)) {
                    throw new IllegalArgumentException("Mã IMEI đã tồn tại trong hệ thống: " + sn);
                }
                ProductSerial ps = new ProductSerial();
                ps.setProductVariantId(variant.getId());
                ps.setSerialNumber(sn);
                ps.setStatus(SerialStatus.AVAILABLE);
                ps.setInventoryNoteId(noteId);
                serialRepository.save(ps);
            }
        }
    }

    private void executeExportLogic(InventoryNoteRequest.NoteDetailRequest reqDetail, Integer noteId) {
        ProductVariant variant = variantRepository.findByIdWithLock(reqDetail.getProductVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm ID " + reqDetail.getProductVariantId() + " không tồn tại"));

        int oldQuantity = variant.getStockQuantity();
        int exportQuantity = reqDetail.getQuantity();

        if (oldQuantity < exportQuantity) {
            throw new IllegalStateException(String.format(
                    "Không đủ tồn kho để xuất! Sản phẩm ID %d hiện chỉ còn %d",
                    variant.getId(), oldQuantity
            ));
        }

        int newQuantity = oldQuantity - exportQuantity;

        // 1. TRỪ TỒN KHO
        variant.setStockQuantity(newQuantity);
        variantRepository.save(variant);

        // 2. GHI LỊCH SỬ KHO
        saveHistory(variant.getId(), oldQuantity, -exportQuantity, newQuantity, ReferenceType.INVENTORY_NOTE, noteId, "Xuất kho");

        // 3. XỬ LÝ IMEI XUẤT TRỰC TIẾP
        List<String> serialsToExport = reqDetail.getSerialNumbers();

        // =====================================================================
        // [THÊM MỚI] KIỂM TRA CHẶT CHẼ isSerialRequired TRƯỚC KHI XỬ LÝ
        // =====================================================================
        if (variant.getIsSerialRequired()) {
            if (serialsToExport == null || serialsToExport.size() != exportQuantity) {
                throw new IllegalArgumentException(String.format(
                        "BẮT BUỘC: Sản phẩm ID %d yêu cầu quét mã Serial/IMEI và Phải quét đúng %d mã để xuất kho!",
                        variant.getId(), exportQuantity
                ));
            }
        } else {
            if (serialsToExport != null && !serialsToExport.isEmpty()) {
                throw new IllegalArgumentException(String.format(
                        "LỖI: Sản phẩm ID %d KHÔNG quản lý bằng Serial. Vui lòng không truyền mã IMEI!",
                        variant.getId()
                ));
            }
        }
        // =====================================================================

        // (ĐOẠN CODE CŨ GIỮ NGUYÊN BÊN DƯỚI)
        if (serialsToExport != null && !serialsToExport.isEmpty()) {
            for (String sn : serialsToExport) {
                ProductSerial ps = serialRepository.findBySerialNumber(sn)
                        .orElseThrow(() -> new IllegalArgumentException("Mã IMEI không tồn tại trong kho: " + sn));

                if (!ps.getStatus().equals(SerialStatus.AVAILABLE)) {
                    throw new IllegalStateException("Mã IMEI " + sn + " không khả dụng để xuất (Đã bán hoặc lỗi)!");
                }

                ps.setStatus(SerialStatus.SOLD);
                ps.setInventoryNoteId(noteId); // Gắn phiếu xuất
                serialRepository.save(ps);
            }
        }
    }

    private void saveHistory(Integer variantId, int oldQ, int change, int newQ, ReferenceType refType, Integer refId, String note) {
        InventoryHistory history = new InventoryHistory();
        history.setProductVariantId(variantId);
        history.setPreviousQuantity(oldQ);
        history.setChangeAmount(change);
        history.setNewQuantity(newQ);
        history.setReferenceType(refType);
        history.setReferenceId(refId);
        history.setNote(note);
        historyRepository.save(history);
    }
}