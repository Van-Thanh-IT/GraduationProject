package com.example.backend.service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.InventoryNoteRequest;
import com.example.backend.dto.response.admin.InventoryNoteResponse;
import com.example.backend.dto.response.admin.InventoryHistoryResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.*;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.InventoryMapper;
import com.example.backend.repository.*;
import com.example.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class InventoryService {

    private final InventoryNoteRepository noteRepository;
    private final ProductVariantRepository variantRepository;
    private final InventoryHistoryRepository historyRepository;
    private final ProductSerialRepository serialRepository;
    private final InventoryMapper inventoryMapper;

    @Transactional(readOnly = true)
    public List<InventoryNoteResponse> getAllNotes() {
        List<InventoryNote> notes = noteRepository.findAll();
        return notes.stream().map(this::mapToResponseWithSerials).toList();
    }

    @Transactional(readOnly = true)
    public InventoryNoteResponse getNoteById(Integer id) {
        InventoryNote note =
                noteRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.INVENTORY_NOTE_NOT_FOUND));
        return mapToResponseWithSerials(note);
    }

    @Transactional(readOnly = true)
    public List<InventoryHistoryResponse> getHistoryByVariantId(Integer variantId) {
        return historyRepository.findByProductVariantIdOrderByCreatedAtDesc(variantId).stream()
                .map(inventoryMapper::toInventoryHistoryResponse)
                .toList();
    }

    private InventoryNoteResponse mapToResponseWithSerials(InventoryNote note) {
        InventoryNoteResponse response = inventoryMapper.toInventoryNoteResponse(note);
        if (response.getDetails() != null) {
            for (var detail : response.getDetails()) {
                List<String> serials =
                        serialRepository.findSerialNumbers(response.getId(), detail.getProductVariantId());
                detail.setSerialNumbers(serials != null ? serials : new ArrayList<>());
            }
        }
        return response;
    }

    @Transactional(rollbackFor = Exception.class)
    public InventoryNoteResponse createAndCompleteNote(InventoryNoteRequest request) {
        log.info("Creating inventory note type: {}", request.getType());

        Integer userId = getCurrentUserId();

        User user = new User();
        user.setId(userId);

        InventoryNote note = inventoryMapper.toInventoryNote(request);
        note.setCode(request.getType().name() + "-"
                + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        note.setStatus(NoteStatus.COMPLETED);
        note.setUser(user);

        InventoryNote savedNote = noteRepository.save(note);

        List<InventoryNoteDetail> details = new ArrayList<>();
        BigDecimal tempTotal = BigDecimal.ZERO;

        request.getDetails().sort(Comparator.comparing(InventoryNoteRequest.NoteDetailRequest::getProductVariantId));

        for (InventoryNoteRequest.NoteDetailRequest reqDetail : request.getDetails()) {
            InventoryNoteDetail detail = inventoryMapper.toNoteDetail(reqDetail);
            detail.setInventoryNote(savedNote);

            if (detail.getPrice() == null) detail.setPrice(BigDecimal.ZERO);

            details.add(detail);

            tempTotal = tempTotal.add(detail.getPrice().multiply(BigDecimal.valueOf(detail.getQuantity())));

            if (request.getType() == NoteType.IMPORT) {
                executeImportLogic(reqDetail, savedNote.getId());
            } else if (request.getType() == NoteType.EXPORT) {
                executeExportLogic(reqDetail, savedNote.getId());
            }
        }

        savedNote.setDetails(details);
        savedNote.setTotalAmount(tempTotal);

        return inventoryMapper.toInventoryNoteResponse(noteRepository.save(savedNote));
    }

    private void executeImportLogic(InventoryNoteRequest.NoteDetailRequest reqDetail, Integer noteId) {
        ProductVariant variant = getVariantWithLock(reqDetail.getProductVariantId());
        int changeAmount = reqDetail.getQuantity();

        validateSerialRequirement(variant, reqDetail.getSerialNumbers(), changeAmount, "nhập");

        List<String> serials = reqDetail.getSerialNumbers();
        if (serials != null && !serials.isEmpty()) {
            List<ProductSerial> existingSerials = serialRepository.findBySerialNumberIn(serials);
            if (!existingSerials.isEmpty()) {
                throw new CustomException(
                        ErrorCode.SERIAL_EXISTED, existingSerials.getFirst().getSerialNumber());
            }

            List<ProductSerial> newSerials = serials.stream()
                    .map(sn -> {
                        ProductSerial ps = new ProductSerial();
                        ps.setProductVariantId(variant.getId());
                        ps.setSerialNumber(sn.trim());
                        ps.setStatus(SerialStatus.AVAILABLE);
                        ps.setInventoryNoteId(noteId);
                        return ps;
                    })
                    .toList();

            serialRepository.saveAll(newSerials);
        }

        updateStockAndHistory(variant, changeAmount, noteId, "Nhập kho");
    }

    private void executeExportLogic(InventoryNoteRequest.NoteDetailRequest reqDetail, Integer noteId) {
        ProductVariant variant = getVariantWithLock(reqDetail.getProductVariantId());
        int exportQuantity = reqDetail.getQuantity();

        if (variant.getStockQuantity() < exportQuantity) {
            throw new CustomException(
                    ErrorCode.INVENTORY_LOW_STOCK,
                    String.format(
                            "Không đủ tồn kho để xuất! Sản phẩm ID %d hiện chỉ còn %d",
                            variant.getId(), variant.getStockQuantity()));
        }

        validateSerialRequirement(variant, reqDetail.getSerialNumbers(), exportQuantity, "xuất");

        List<String> serialsToExport = reqDetail.getSerialNumbers();
        if (serialsToExport != null && !serialsToExport.isEmpty()) {
            List<ProductSerial> dbSerials = serialRepository.findBySerialNumberIn(serialsToExport);

            if (dbSerials.size() != serialsToExport.size()) {
                throw new CustomException(ErrorCode.SERIAL_NOT_FOUND, "Có mã IMEI gửi lên không tồn tại trong kho");
            }

            for (ProductSerial ps : dbSerials) {
                if (ps.getStatus() != SerialStatus.AVAILABLE) {
                    throw new CustomException(ErrorCode.SERIAL_ALREADY_SOLD, ps.getSerialNumber());
                }
                ps.setStatus(SerialStatus.SOLD);
                ps.setInventoryNoteId(noteId);
            }
            serialRepository.saveAll(dbSerials);
        }

        updateStockAndHistory(variant, -exportQuantity, noteId, "Xuất kho");
    }

    private ProductVariant getVariantWithLock(Integer variantId) {
        return variantRepository
                .findByIdWithLock(variantId)
                .orElseThrow(() -> new CustomException(ErrorCode.VARIANT_NOT_FOUND, String.format("%d", variantId)));
    }

    private void updateStockAndHistory(ProductVariant variant, int changeAmount, Integer noteId, String note) {
        int oldQuantity = variant.getStockQuantity();
        int newQuantity = oldQuantity + changeAmount;

        variant.setStockQuantity(newQuantity);

        InventoryHistory history = InventoryHistory.builder()
                .productVariantId(variant.getId())
                .previousQuantity(oldQuantity)
                .changeAmount(changeAmount)
                .newQuantity(newQuantity)
                .referenceType(ReferenceType.INVENTORY_NOTE)
                .referenceId(noteId)
                .note(note)
                .build();

        historyRepository.save(history);
    }

    private void validateSerialRequirement(
            ProductVariant variant, List<String> serials, int expectedSize, String action) {
        if (Boolean.TRUE.equals(variant.getIsSerialRequired())) {
            if (serials == null || serials.size() != expectedSize) {
                throw new CustomException(
                        ErrorCode.INVALID_INPUT,
                        String.format(
                                "Sản phẩm ID %d bắt buộc quét đủ %d mã IMEI để %s kho",
                                variant.getId(), expectedSize, action));
            }
        } else {
            if (serials != null && !serials.isEmpty()) {
                throw new CustomException(
                        ErrorCode.INVALID_INPUT,
                        String.format(
                                "Sản phẩm ID %d KHÔNG quản lý bằng IMEI. Vui lòng không truyền danh sách mã!",
                                variant.getId()));
            }
        }
    }

    private Integer getCurrentUserId() {
        return SecurityUtils.getCurrentUserId();
    }
}
