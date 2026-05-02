package com.example.backend.mapper;

import com.example.backend.dto.request.VoucherRequest;
import com.example.backend.dto.response.VoucherResponse;
import com.example.backend.entity.Voucher;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import java.time.LocalDateTime;

@Mapper(componentModel = "spring", imports = {LocalDateTime.class})
public interface VoucherMapper {

    // 1. Map từ Request sang Entity (Thêm mới)
    @Mapping(target = "code", expression = "java(request.getCode() != null ? request.getCode().toUpperCase() : null)")
    @Mapping(target = "usageLimit", source = "usageLimit", defaultValue = "0")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Voucher toEntity(VoucherRequest request);

    // 2. Cập nhật Entity có sẵn từ Request (Sửa)
    @Mapping(target = "code", expression = "java(request.getCode() != null ? request.getCode().toUpperCase() : null)")
    @Mapping(target = "usageLimit", source = "usageLimit", defaultValue = "0")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Voucher entity, VoucherRequest request);

    // 3. Map từ Entity sang Response (Trả về)
    @Mapping(target = "isValid", expression = "java(checkIsValid(entity))")
    VoucherResponse toResponse(Voucher entity);

    // Hàm phụ trợ (default method) để tính toán trường isValid
    default boolean checkIsValid(Voucher entity) {
        if (entity == null) return false;

        LocalDateTime now = LocalDateTime.now();
        int limit = entity.getUsageLimit() != null ? entity.getUsageLimit() : 0;
        int used = entity.getUsedCount() != null ? entity.getUsedCount() : 0;

        return entity.getDeletedAt() == null &&
                entity.getStartDate() != null && !entity.getStartDate().isAfter(now) &&
                entity.getEndDate() != null && !entity.getEndDate().isBefore(now) &&
                (limit == 0 || used < limit);
    }
}