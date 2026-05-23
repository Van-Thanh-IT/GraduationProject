package com.example.backend.controller.management;

import java.util.List;

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

    @GetMapping("/notes")
    public APIResponse<List<InventoryNoteResponse>> getAllNotes() {
        return APIResponse.success(inventoryService.getAllNotes());
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
