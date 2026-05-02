package com.example.backend.service;

import com.example.backend.dto.request.FlashSaleRequest;
import com.example.backend.dto.response.FlashSaleResponse;
import com.example.backend.entity.FlashSale;
import com.example.backend.entity.ProductVariant;
import com.example.backend.mapper.FlashSaleMapper;
import com.example.backend.repository.FlashSaleRepository;
import com.example.backend.repository.ProductVariantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final ProductVariantRepository variantRepository;
    private final FlashSaleMapper flashSaleMapper;

    // =====================================
    // DÀNH CHO ADMIN
    // =====================================

    public List<FlashSaleResponse> getAllFlashSales() {
        return flashSaleRepository.findAll().stream()
                .map(flashSaleMapper::toResponse)
                .toList();
    }

    @Transactional
    public FlashSaleResponse createFlashSale(FlashSaleRequest request) {
        ProductVariant variant = validateFlashSaleLogic(request, 0);

        FlashSale flashSale = FlashSale.builder()
                .productVariant(variant)
                .flashSalePrice(request.getFlashSalePrice())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .saleStockQuantity(request.getSaleStockQuantity())
                .maxQuantityPerUser(request.getMaxQuantityPerUser() != null ? request.getMaxQuantityPerUser() : 1)
                // Status mặc định là 1 (Kích hoạt) đã được cấu hình trong Entity
                .build();

        return flashSaleMapper.toResponse(flashSaleRepository.save(flashSale));
    }

    @Transactional
    public FlashSaleResponse updateFlashSale(Integer id, FlashSaleRequest request) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chương trình Flash Sale!"));

        validateFlashSaleLogic(request, id);

        // BẢO VỆ DỮ LIỆU KHI UPDATE
        if (request.getSaleStockQuantity() < flashSale.getSoldQuantity()) {
            throw new IllegalStateException("Không thể giảm tổng suất Sale xuống thấp hơn số lượng đã bán (" + flashSale.getSoldQuantity() + ")!");
        }

        // Nếu chương trình đã có người mua, không cho phép đổi giá (Tránh việc khách khiếu nại mua hớ)
        if (flashSale.getSoldQuantity() > 0 && request.getFlashSalePrice().compareTo(flashSale.getFlashSalePrice()) != 0) {
            throw new IllegalStateException("Chương trình này đã có lượt mua, không thể thay đổi giá Flash Sale nữa!");
        }

        flashSale.setFlashSalePrice(request.getFlashSalePrice());
        flashSale.setStartTime(request.getStartTime());
        flashSale.setEndTime(request.getEndTime());
        flashSale.setSaleStockQuantity(request.getSaleStockQuantity());
        flashSale.setMaxQuantityPerUser(request.getMaxQuantityPerUser() != null ? request.getMaxQuantityPerUser() : 1);

        return flashSaleMapper.toResponse(flashSaleRepository.save(flashSale));
    }

    @Transactional
    public void updateFlashSaleStatus(Integer id, Integer status) {
        FlashSale flashSale = flashSaleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chương trình Flash Sale!"));
        flashSale.setStatus(status);
        flashSaleRepository.save(flashSale);
    }

    // =====================================
    // LOGIC KIỂM TRA ĐỒNG BỘ CHUẨN XÁC
    // =====================================
    private ProductVariant validateFlashSaleLogic(FlashSaleRequest request, Integer excludeId) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Thời gian bắt đầu phải diễn ra trước thời gian kết thúc!");
        }

        ProductVariant variant = variantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm (Biến thể) không tồn tại!"));

        if (request.getFlashSalePrice().compareTo(variant.getPrice()) >= 0) {
            throw new IllegalArgumentException("Giá Flash Sale (" + request.getFlashSalePrice() + "đ) phải RẺ HƠN giá bán hiện tại (" + variant.getPrice() + "đ)!");
        }

        // Logic check mỗi user: Không được mua nhiều hơn tổng kho sale
        int maxPerUser = request.getMaxQuantityPerUser() != null ? request.getMaxQuantityPerUser() : 1;
        if (maxPerUser > request.getSaleStockQuantity()) {
            throw new IllegalArgumentException("Giới hạn mua mỗi người (" + maxPerUser + ") không được lớn hơn tổng suất Sale (" + request.getSaleStockQuantity() + ")!");
        }

        // Tạm đóng comment check kho thật như bạn yêu cầu (Khi nào chạy thật thì mở ra)
         if (request.getSaleStockQuantity() > variant.getStockQuantity()) {
             throw new IllegalStateException("Số lượng suất Sale (" + request.getSaleStockQuantity() + ") không được lớn hơn tồn kho thực tế (" + variant.getStockQuantity() + ")!");
         }

        boolean isOverlapping = flashSaleRepository.existsOverlappingFlashSale(
                request.getProductVariantId(), request.getStartTime(), request.getEndTime(), excludeId);

        if (isOverlapping) {
            throw new IllegalStateException("Sản phẩm này đã có chương trình Flash Sale trùng lặp trong khung giờ này!");
        }

        return variant;
    }

    // =====================================
    // DÀNH CHO USER / GIỎ HÀNG / ĐẶT HÀNG
    // =====================================

    public Map<Integer, FlashSale> getActiveFlashSalesForVariants(List<Integer> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) return Collections.emptyMap();

        List<FlashSale> activeSales = flashSaleRepository.findActiveByVariantIds(variantIds, LocalDateTime.now());

        return activeSales.stream()
                .collect(Collectors.toMap(
                        sale -> sale.getProductVariant().getId(),
                        sale -> sale,
                        (existing, replacement) -> existing
                ));
    }

    // Gọi hàm này NGAY LÚC TẠO ĐƠN HÀNG (Order Service)
    @Transactional
    public void deductFlashSaleStockSafely(Integer flashSaleId, Integer quantityBought) {
        int updatedRows = flashSaleRepository.incrementSoldQuantitySafely(flashSaleId, quantityBought);
        if (updatedRows == 0) {
            throw new IllegalStateException("Rất tiếc, suất Flash Sale đã bán hết hoặc bạn mua vượt quá suất còn lại!");
        }
    }


}