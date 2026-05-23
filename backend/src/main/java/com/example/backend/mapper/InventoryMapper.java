package com.example.backend.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.request.InventoryNoteRequest;
import com.example.backend.dto.response.admin.InventoryNoteResponse;
import com.example.backend.dto.response.admin.InventoryHistoryResponse;
import com.example.backend.entity.InventoryHistory;
import com.example.backend.entity.InventoryNote;
import com.example.backend.entity.InventoryNoteDetail;

@Mapper(componentModel = "spring")
public interface InventoryMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "status", ignore = true)
    @Mapping(target = "totalAmount", ignore = true)
    @Mapping(target = "details", ignore = true)
    InventoryNote toInventoryNote(InventoryNoteRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "inventoryNote", ignore = true)
    InventoryNoteDetail toNoteDetail(InventoryNoteRequest.NoteDetailRequest reqDetail);

    @Mapping(target = "fullName", source = "user.username")
    @Mapping(target = "userId", source = "user.id")
    InventoryNoteResponse toInventoryNoteResponse(InventoryNote entity);

    InventoryHistoryResponse toInventoryHistoryResponse(InventoryHistory entity);
}
