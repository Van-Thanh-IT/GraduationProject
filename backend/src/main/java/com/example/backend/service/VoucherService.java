package com.example.backend.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.backend.dto.request.VoucherRequest;
import com.example.backend.dto.response.VoucherResponse;
import com.example.backend.entity.Voucher;
import com.example.backend.enums.DiscountType;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.VoucherMapper;
import com.example.backend.repository.VoucherRepository;
import com.example.backend.utils.CodeGeneratorUtil;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    private static final BigDecimal ONE_HUNDRED = new BigDecimal("100");
    private static final int SCALE_DECIMAL = 2;

    @Transactional(readOnly = true)
    public List<VoucherResponse> getAllVouchersForAdmin() {
        return voucherRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc().stream()
                .map(voucherMapper::toResponse)
                .toList();
    }

    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        validateAndNormalizeVoucherRequest(request, null);

        Voucher voucher = voucherMapper.toEntity(request);
        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse updateVoucher(Integer id, VoucherRequest request) {
        Voucher voucher = getVoucherOrThrow(id);

        validateAndNormalizeVoucherRequest(request, id);

        voucherMapper.updateEntity(voucher, request);
        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public void softDeleteVoucher(Integer id) {
        Voucher voucher = getVoucherOrThrow(id);
        voucher.setDeletedAt(LocalDateTime.now());
        voucherRepository.save(voucher);
        log.info("Đã xóa mềm Voucher ID: {}", id);
    }

    @Transactional(readOnly = true)
    public List<VoucherResponse> getValidVouchersForUser() {
        return voucherRepository.findValidVouchersForUser(LocalDateTime.now()).stream()
                .map(voucherMapper::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BigDecimal calculateDiscountAmount(String code, BigDecimal orderTotalAmount) {
        if (!StringUtils.hasText(code)) {
            return BigDecimal.ZERO;
        }
        if (orderTotalAmount == null || orderTotalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new CustomException(ErrorCode.ORDER_INVALID_AMOUNT);
        }

        Voucher voucher = getValidVoucherByCode(code);
        validateVoucherEligibility(voucher, orderTotalAmount);

        BigDecimal discountAmount = computeDiscount(voucher, orderTotalAmount);

        return discountAmount.min(orderTotalAmount);
    }

    @Transactional
    public void incrementUsedCount(String code) {
        if (!StringUtils.hasText(code)) return;

        int updatedRows = voucherRepository.incrementUsedCountSafely(code.trim().toUpperCase());
        if (updatedRows == 0) {
            throw new CustomException(ErrorCode.VOUCHER_OUT_OF_USAGE);
        }
    }

    private Voucher getVoucherOrThrow(Integer id) {
        return voucherRepository
                .findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_NOT_FOUND));
    }

    private Voucher getValidVoucherByCode(String code) {
        return voucherRepository
                .findByCodeAndDeletedAtIsNull(code.trim().toUpperCase())
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_INVALID));
    }

    private void validateAndNormalizeVoucherRequest(VoucherRequest request, Integer voucherId) {
        if (!StringUtils.hasText(request.getCode())) {
            request.setCode(CodeGeneratorUtil.generateVoucherCode());
        } else {
            request.setCode(request.getCode().trim().toUpperCase());
        }

        boolean exists = (voucherId == null)
                ? voucherRepository.existsByCode(request.getCode())
                : voucherRepository.existsByCodeAndIdNot(request.getCode(), voucherId);

        if (exists) {
            throw new CustomException(ErrorCode.VOUCHER_CODE_EXISTS);
        }

        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new CustomException(ErrorCode.VOUCHER_INVALID_DATES);
        }

        if (request.getDiscountType() == DiscountType.PERCENT) {
            if (request.getDiscountValue().compareTo(ONE_HUNDRED) > 0) {
                throw new CustomException(ErrorCode.VOUCHER_PERCENTAGE_EXCEED);
            }
            if (request.getMaxDiscountValue() == null
                    || request.getMaxDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
                throw new CustomException(ErrorCode.VOUCHER_MISSING_MAX_DISCOUNT);
            }
        } else {
            request.setMaxDiscountValue(request.getDiscountValue());
        }

        if (request.getMinOrderValue() == null) request.setMinOrderValue(BigDecimal.ZERO);
        if (request.getUsageLimit() == null) request.setUsageLimit(0);
    }

    private void validateVoucherEligibility(Voucher voucher, BigDecimal orderTotalAmount) {
        LocalDateTime now = LocalDateTime.now();

        if (now.isBefore(voucher.getStartDate())) throw new CustomException(ErrorCode.VOUCHER_NOT_STARTED);
        if (now.isAfter(voucher.getEndDate())) throw new CustomException(ErrorCode.VOUCHER_EXPIRED);

        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new CustomException(ErrorCode.VOUCHER_OUT_OF_USAGE);
        }

        if (voucher.getMinOrderValue() != null && orderTotalAmount.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new CustomException(ErrorCode.VOUCHER_MIN_ORDER_NOT_MET);
        }
    }

    private BigDecimal computeDiscount(Voucher voucher, BigDecimal orderTotalAmount) {
        if (voucher.getDiscountType() == DiscountType.FIXED) {
            return voucher.getDiscountValue();
        }

        BigDecimal discountAmount = orderTotalAmount
                .multiply(voucher.getDiscountValue())
                .divide(ONE_HUNDRED, SCALE_DECIMAL, RoundingMode.HALF_UP);

        if (voucher.getMaxDiscountValue() != null
                && voucher.getMaxDiscountValue().compareTo(BigDecimal.ZERO) > 0) {
            discountAmount = discountAmount.min(voucher.getMaxDiscountValue());
        }

        return discountAmount;
    }
}
