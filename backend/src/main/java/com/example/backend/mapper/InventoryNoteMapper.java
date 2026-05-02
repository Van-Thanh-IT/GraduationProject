package com.example.backend.mapper;

import com.example.backend.dto.response.InventoryHistoryResponse;
import com.example.backend.dto.response.InventoryNoteResponse;
import com.example.backend.entity.InventoryHistory;
import com.example.backend.entity.InventoryNote;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface InventoryNoteMapper {
    InventoryNoteResponse toResponse(InventoryNote entity);

    InventoryHistoryResponse toResponse(InventoryHistory entity);
}