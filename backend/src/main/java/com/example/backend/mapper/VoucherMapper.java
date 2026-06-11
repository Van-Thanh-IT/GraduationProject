package com.example.backend.mapper;

import java.time.LocalDateTime;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.example.backend.dto.request.VoucherRequest;
import com.example.backend.dto.response.VoucherResponse;
import com.example.backend.entity.Voucher;

@Mapper(
        componentModel = "spring",
        imports = {LocalDateTime.class})
public interface VoucherMapper {

    @Mapping(target = "code", expression = "java(request.getCode() != null ? request.getCode().toUpperCase() : null)")
    @Mapping(target = "usageLimit", source = "usageLimit", defaultValue = "0")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Voucher toEntity(VoucherRequest request);

    @Mapping(target = "code", expression = "java(request.getCode() != null ? request.getCode().toUpperCase() : null)")
    @Mapping(target = "usageLimit", source = "usageLimit", defaultValue = "0")
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "usedCount", ignore = true)
    @Mapping(target = "deletedAt", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntity(@MappingTarget Voucher entity, VoucherRequest request);

    @Mapping(target = "isValid", expression = "java(checkIsValid(entity))")
    VoucherResponse toResponse(Voucher entity);

    default boolean checkIsValid(Voucher entity) {
        if (entity == null) return false;

        LocalDateTime now = LocalDateTime.now();
        int limit = entity.getUsageLimit() != null ? entity.getUsageLimit() : 0;
        int used = entity.getUsedCount() != null ? entity.getUsedCount() : 0;

        return entity.getDeletedAt() == null
                && entity.getStartDate() != null
                && !entity.getStartDate().isAfter(now)
                && entity.getEndDate() != null
                && !entity.getEndDate().isBefore(now)
                && (limit == 0 || used < limit);
    }
}
