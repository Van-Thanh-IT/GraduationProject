package com.example.backend.service;

import com.example.backend.dto.request.VoucherRequest;
import com.example.backend.dto.response.VoucherResponse;
import com.example.backend.utils.CodeGeneratorUtil;
import com.example.backend.entity.Voucher;
import com.example.backend.enums.DiscountType;
import com.example.backend.mapper.VoucherMapper;
import com.example.backend.repository.VoucherRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class VoucherService {

    private final VoucherRepository voucherRepository;
    private final VoucherMapper voucherMapper;

    public List<VoucherResponse> getAllVouchersForAdmin() {
        return voucherRepository.findAllByDeletedAtIsNullOrderByCreatedAtDesc()
                .stream().map(voucherMapper::toResponse).toList();
    }

    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request) {
        validateVoucherBusinessLogic(request);

        if (voucherRepository.existsByCode(request.getCode())) {
            throw new IllegalArgumentException("Mã CODE '" + request.getCode() + "' đã tồn tại trong hệ thống!");
        }

        Voucher voucher = voucherMapper.toEntity(request);
        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public VoucherResponse updateVoucher(Integer id, VoucherRequest request) {
        Voucher voucher = voucherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Voucher hoặc Voucher đã bị xóa!"));

        validateVoucherBusinessLogic(request);

        if (voucherRepository.existsByCodeAndIdNot(request.getCode(), id)) {
            throw new IllegalArgumentException("Mã CODE '" + request.getCode() + "' đang được sử dụng ở một chương trình khác!");
        }

        voucherMapper.updateEntity(voucher, request);
        return voucherMapper.toResponse(voucherRepository.save(voucher));
    }

    @Transactional
    public void softDeleteVoucher(Integer id) {
        Voucher voucher = voucherRepository.findByIdAndDeletedAtIsNull(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy Voucher để xóa!"));
        voucher.setDeletedAt(LocalDateTime.now());
        voucherRepository.save(voucher);
    }


    //DÀNH CHO USER & CHECKOUT
    public List<VoucherResponse> getValidVouchersForUser() {
        return voucherRepository.findValidVouchersForUser(LocalDateTime.now())
                .stream().map(voucherMapper::toResponse).toList();
    }

    // HÀM QUAN TRỌNG NHẤT: DÙNG ĐỂ ÁP MÃ TẠI GIỎ HÀNG HOẶC LÚC TẠO ĐƠN HÀNG
    public BigDecimal calculateDiscountAmount(String code, BigDecimal orderTotalAmount) {
        if (code == null || code.trim().isEmpty()) {
            return BigDecimal.ZERO;
        }

        if (orderTotalAmount == null || orderTotalAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Giá trị đơn hàng không hợp lệ để áp dụng mã giảm giá!");
        }

        Voucher voucher = voucherRepository.findByCodeAndDeletedAtIsNull(code.trim().toUpperCase())
                .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không hợp lệ!"));

        LocalDateTime now = LocalDateTime.now();

        // 1. Kiểm tra trạng thái thời gian
        if (now.isBefore(voucher.getStartDate())) {
            throw new IllegalStateException("Mã giảm giá '" + voucher.getCode() + "' chưa tới thời gian áp dụng!");
        }
        if (now.isAfter(voucher.getEndDate())) {
            throw new IllegalStateException("Mã giảm giá '" + voucher.getCode() + "' đã hết hạn sử dụng!");
        }

        // 2. Kiểm tra lượt dùng (Nếu usageLimit = 0 tức là không giới hạn)
        if (voucher.getUsageLimit() > 0 && voucher.getUsedCount() >= voucher.getUsageLimit()) {
            throw new IllegalStateException("Rất tiếc, mã giảm giá '" + voucher.getCode() + "' đã hết lượt sử dụng!");
        }

        // 3. Kiểm tra điều kiện đơn hàng tối thiểu
        if (voucher.getMinOrderValue() != null && orderTotalAmount.compareTo(voucher.getMinOrderValue()) < 0) {
            throw new IllegalStateException(String.format("Đơn hàng chưa đạt giá trị tối thiểu %,.0f đ để áp dụng mã này!", voucher.getMinOrderValue()));
        }

        // 4. Tính toán số tiền được giảm
        BigDecimal discountAmount = BigDecimal.ZERO;
        if (voucher.getDiscountType() == DiscountType.FIXED) {
            discountAmount = voucher.getDiscountValue();
        } else if (voucher.getDiscountType() == DiscountType.PERCENT) {
            // Tính %
            discountAmount = orderTotalAmount.multiply(voucher.getDiscountValue())
                    .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP); // Làm tròn 2 chữ số thập phân

            // Áp trần (Max discount) nếu có
            if (voucher.getMaxDiscountValue() != null && voucher.getMaxDiscountValue().compareTo(BigDecimal.ZERO) > 0) {
                if (discountAmount.compareTo(voucher.getMaxDiscountValue()) > 0) {
                    discountAmount = voucher.getMaxDiscountValue();
                }
            }
        }

        // Đảm bảo tiền giảm không bao giờ lớn hơn tiền hàng (Chống đơn hàng âm tiền)
        return discountAmount.compareTo(orderTotalAmount) >= 0 ? orderTotalAmount : discountAmount;
    }

    @Transactional
    public void incrementUsedCount(String code) {
        if (code == null || code.trim().isEmpty()) return;

        // Gọi hàm UPDATE trực tiếp từ DB. Trả về số nguyên int (số dòng bị ảnh hưởng)
        int updatedRows = voucherRepository.incrementUsedCountSafely(code.trim().toUpperCase());

        // Nếu updatedRows == 0, nghĩa là mã này đã bị xóa, hoặc đã ĐẠT GIỚI HẠN
        if (updatedRows == 0) {
            throw new IllegalStateException("Rất tiếc, mã giảm giá '" + code + "' vừa mới hết lượt sử dụng!");
        }
    }

    // ==========================================
    // UTILS: HÀM VALIDATE NGHIỆP VỤ LÕI
    // ==========================================
    private void validateVoucherBusinessLogic(VoucherRequest request) {
        if (request.getCode() == null || request.getCode().trim().isEmpty()) {
            request.setCode(CodeGeneratorUtil.generateVoucherCode());
        } else {
            // Nếu có nhập thì chuẩn hóa: Xóa khoảng trắng, viết hoa toàn bộ
            request.setCode(request.getCode().trim().toUpperCase());
        }

        // 1. Kiểm tra ngày tháng
        if (!request.getStartDate().isBefore(request.getEndDate())) {
            throw new IllegalArgumentException("Ngày bắt đầu phải diễn ra trước ngày kết thúc!");
        }

        // 2. Kiểm tra logic tiền tệ dựa theo Type
        if (request.getDiscountType() == DiscountType.PERCENT) {
            if (request.getDiscountValue().compareTo(new BigDecimal("100")) > 0) {
                throw new IllegalArgumentException("Đối với giảm giá phần trăm, giá trị không được vượt quá 100%!");
            }
            if (request.getMaxDiscountValue() == null || request.getMaxDiscountValue().compareTo(BigDecimal.ZERO) == 0) {
                throw new IllegalArgumentException("Vui lòng nhập 'Số tiền giảm tối đa' cho mã phần trăm để tránh rủi ro lỗ vốn!");
            }
        } else if (request.getDiscountType() == DiscountType.FIXED) {
            // Với mã giảm tiền mặt cố định, ta có thể tự động đồng bộ maxDiscountValue = discountValue để dữ liệu nhất quán
            request.setMaxDiscountValue(request.getDiscountValue());
        }

        // 3. Chuẩn hóa giá trị NULL về 0 cho an toàn
        if (request.getMinOrderValue() == null) request.setMinOrderValue(BigDecimal.ZERO);
        if (request.getUsageLimit() == null) request.setUsageLimit(0);
    }
}