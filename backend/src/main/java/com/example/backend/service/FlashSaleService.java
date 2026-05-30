package com.example.backend.service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.backend.dto.request.FlashSaleRequest;
import com.example.backend.dto.response.FlashSaleResponse;
import com.example.backend.entity.FlashSale;
import com.example.backend.entity.ProductVariant;
import com.example.backend.mapper.FlashSaleMapper;
import com.example.backend.repository.FlashSaleRepository;
import com.example.backend.repository.ProductVariantRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FlashSaleService {

    private final FlashSaleRepository flashSaleRepository;
    private final ProductVariantRepository variantRepository;
    private final FlashSaleMapper flashSaleMapper;

    @Transactional(readOnly = true)
    public List<FlashSaleResponse> getAllFlashSales() {
        return flashSaleRepository.findAll().stream()
                .map(flashSaleMapper::toFlashSaleResponse)
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
                .build();

        return flashSaleMapper.toFlashSaleResponse(flashSaleRepository.save(flashSale));
    }

    @Transactional
    public FlashSaleResponse updateFlashSale(Integer id, FlashSaleRequest request) {
        FlashSale flashSale = getFlashSaleByIdOrThrow(id);

        validateFlashSaleLogic(request, id);

        if (request.getSaleStockQuantity() < flashSale.getSoldQuantity()) {
            throw new IllegalStateException(String.format(
                    "Không thể giảm tổng suất Sale xuống thấp hơn số lượng đã bán (%d)!", flashSale.getSoldQuantity()));
        }

        if (flashSale.getSoldQuantity() > 0
                && request.getFlashSalePrice().compareTo(flashSale.getFlashSalePrice()) != 0) {
            throw new IllegalStateException("Chương trình này đã có lượt mua, không thể thay đổi giá Flash Sale nữa!");
        }

        flashSale.setFlashSalePrice(request.getFlashSalePrice());
        flashSale.setStartTime(request.getStartTime());
        flashSale.setEndTime(request.getEndTime());
        flashSale.setSaleStockQuantity(request.getSaleStockQuantity());

        return flashSaleMapper.toFlashSaleResponse(flashSale);
    }

    @Transactional
    public void updateFlashSaleStatus(Integer id, Integer status) {
        FlashSale flashSale = getFlashSaleByIdOrThrow(id);
        flashSale.setStatus(status);
    }


    private ProductVariant validateFlashSaleLogic(FlashSaleRequest request, Integer excludeId) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new IllegalArgumentException("Thời gian bắt đầu phải diễn ra trước thời gian kết thúc!");
        }

        ProductVariant variant = variantRepository
                .findById(request.getProductVariantId())
                .orElseThrow(() -> new IllegalArgumentException("Sản phẩm (Biến thể) không tồn tại!"));

        if (request.getFlashSalePrice().compareTo(variant.getPrice()) >= 0) {
            throw new IllegalArgumentException(String.format(
                    "Giá Flash Sale (%sđ) phải RẺ HƠN giá bán hiện tại (%sđ)!",
                    request.getFlashSalePrice().stripTrailingZeros().toPlainString(),
                    variant.getPrice().stripTrailingZeros().toPlainString()));
        }

        BigDecimal minAllowedPrice = variant.getOriginalPrice().multiply(new BigDecimal("0.50"));
        if (request.getFlashSalePrice().compareTo(minAllowedPrice) < 0) {
            throw new IllegalArgumentException(String.format(
                    "Giá Flash Sale giảm quá sâu! Chỉ được giảm tối đa 50%% so với giá gốc. Vui lòng nhập tối thiểu: %sđ",
                    minAllowedPrice.stripTrailingZeros().toPlainString()));
        }

        if (request.getSaleStockQuantity() > variant.getStockQuantity()) {
            throw new IllegalStateException(String.format(
                    "Số lượng suất Sale (%d) không được lớn hơn tồn kho thực tế (%d)!",
                    request.getSaleStockQuantity(), variant.getStockQuantity()));
        }

        boolean isOverlapping = flashSaleRepository.existsOverlappingFlashSale(
                request.getProductVariantId(), request.getStartTime(), request.getEndTime(), excludeId);

        if (isOverlapping) {
            throw new IllegalStateException(
                    "Sản phẩm này đã có chương trình Flash Sale trùng lặp trong khung giờ này!");
        }

        return variant;
    }

    public Map<Integer, FlashSale> getActiveFlashSalesForVariants(List<Integer> variantIds) {
        if (variantIds == null || variantIds.isEmpty()) return Collections.emptyMap();

        List<FlashSale> activeSales = flashSaleRepository.findActiveByVariantIds(variantIds, LocalDateTime.now());

        return activeSales.stream()
                .collect(Collectors.toMap(
                        sale -> sale.getProductVariant().getId(), sale -> sale, (existing, replacement) -> existing));
    }

    @Transactional
    public void deductFlashSaleStockSafely(Integer flashSaleId, Integer quantityBought) {
        int updatedRows = flashSaleRepository.incrementSoldQuantitySafely(flashSaleId, quantityBought);
        if (updatedRows == 0) {
            throw new IllegalStateException("Rất tiếc, suất Flash Sale đã bán hết hoặc bạn mua vượt quá suất còn lại!");
        }
    }

    @Transactional
    public void restoreFlashSaleStock(Integer variantId, Integer quantityReturned, LocalDateTime orderCreatedAt, BigDecimal itemPrice) {
        if (orderCreatedAt == null || itemPrice == null) return;

        List<FlashSale> sales = flashSaleRepository.findFlashSalesByVariantAndDate(variantId, orderCreatedAt);

        for (FlashSale sale : sales) {
            if (sale.getFlashSalePrice().compareTo(itemPrice) == 0) {
                int newSoldQty = Math.max(0, sale.getSoldQuantity() - quantityReturned);
                sale.setSoldQuantity(newSoldQty);
                break;
            }
        }
    }

    private FlashSale getFlashSaleByIdOrThrow(Integer id) {
        return flashSaleRepository
                .findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chương trình Flash Sale!"));
    }
}
