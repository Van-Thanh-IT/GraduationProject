package com.example.backend.controller.management;

import java.util.List;

import com.example.backend.dto.response.PageResponse;
import com.example.backend.enums.NoteStatus;
import com.example.backend.enums.NoteType;
import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.*;

import com.example.backend.dto.request.InventoryNoteRequest;
import com.example.backend.dto.response.APIResponse;
import com.example.backend.dto.response.admin.InventoryNoteResponse;
import com.example.backend.dto.response.admin.InventoryHistoryResponse;
import com.example.backend.service.InventoryService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/management/inventory")
@RequiredArgsConstructor
public class InventoryManagementController {

    private final InventoryService inventoryService;

//    @GetMapping("/notes")
//    public APIResponse<List<InventoryNoteResponse>> getAllNotes() {
//        return APIResponse.success(inventoryService.getAllNotes());
//    }

    @GetMapping("/notes")
    public APIResponse<PageResponse<InventoryNoteResponse>> searchNotes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) NoteType type,
            @RequestParam(required = false) NoteStatus status,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int limit) {

        PageResponse<InventoryNoteResponse> pageResponse =
                inventoryService.searchNotes(keyword, type, status, page, limit);

        return APIResponse.success(pageResponse);
    }

    @GetMapping("/notes/{id}")
    public APIResponse<InventoryNoteResponse> getNoteById(@PathVariable Integer id) {
        return APIResponse.success(inventoryService.getNoteById(id));
    }

    @PostMapping("/notes")
    public APIResponse<InventoryNoteResponse> createNote(@Valid @RequestBody InventoryNoteRequest request) {
        return APIResponse.success(inventoryService.createAndCompleteNote(request));
    }

    @GetMapping("/history/{variantId}")
    public APIResponse<List<InventoryHistoryResponse>> getHistoryByVariantId(@PathVariable Integer variantId) {
        return APIResponse.success(inventoryService.getHistoryByVariantId(variantId));
    }
}
