package com.example.backend.service;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.dto.response.client.ClientOrderDetailResponse;
import com.example.backend.dto.response.client.ClientOrderItemResponse;
import com.example.backend.dto.response.client.ClientOrderResponse;
import com.example.backend.dto.response.client.OrderPageResponse;
import com.example.backend.entity.*;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.SerialStatus;
import com.example.backend.mapper.OrderMapper;
import com.example.backend.repository.AddressRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductSerialRepository;
import com.example.backend.repository.ProductVariantRepository;

import com.example.backend.repository.projection.OrderStatusCountProjection;
import com.example.backend.repository.projection.UserOrderProjection;
import com.example.backend.utils.CodeGeneratorUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderMapper orderMapper;
    private final ProductVariantRepository variantRepository;
    private final CartService cartService;
     private final AddressRepository addressRepository;
    private final com.example.backend.service.VoucherService voucherService;
    private final com.example.backend.repository.VoucherRepository voucherRepository;
    private final GoshipService goshipService;
    private final FlashSaleService flashSaleService;
    private final ProductSerialRepository serialRepository;
    private final ObjectMapper objectMapper;

    public List<OrderResponse> getAllOrders() {
        return orderRepository.findAll().stream()
                .map(orderMapper::toResponse)
                .toList();
    }

    @Transactional
    public OrderResponse updateOrderStatus(Integer orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng!"));

        OrderStatus currentStatus = order.getOrderStatus();
        OrderStatus newStatus = request.getOrderStatus();

        // Chặn lỗi logic trạng thái
        if (currentStatus == OrderStatus.COMPLETED) throw new IllegalStateException("Đơn hàng đã hoàn thành!");
        if (currentStatus == OrderStatus.CANCELLED) throw new IllegalStateException("Đơn hàng đã bị hủy!");

        order.setOrderStatus(newStatus);

        if (newStatus == OrderStatus.SHIPPING) {
            if (request.getTrackingNumber() != null) order.setTrackingNumber(request.getTrackingNumber());
            if (request.getShippingCarrier() != null) order.setShippingCarrier(request.getShippingCarrier());
        }

        if (newStatus == OrderStatus.CANCELLED) {
            if (request.getCancelReason() == null || request.getCancelReason().trim().isEmpty()) {
                throw new IllegalArgumentException("Vui lòng nhập lý do hủy đơn hàng!");
            }
            order.setCancelReason(request.getCancelReason());
        }

        return orderMapper.toResponse(orderRepository.save(order));
    }
    public OrderPageResponse getMyOrders(Integer userId, String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);

        // 1. Gọi Database lấy danh sách đơn (Phân trang)
        Page<UserOrderProjection> rawPage = orderRepository.findUserOrdersWithFilters(userId, status, keyword, pageable);

        // Parse JSON
        List<ClientOrderResponse> content = rawPage.stream().map(projection -> {
            List<Map<String, Object>> parsedItems = new ArrayList<>();
            try {
                if (projection.getItemsJson() != null && !projection.getItemsJson().isEmpty()) {
                    parsedItems = objectMapper.readValue(projection.getItemsJson(), new TypeReference<>() {});
                }
            } catch (Exception e) {}

            return ClientOrderResponse.builder()
                    .id(projection.getId())
                    .code(projection.getCode())
                    .createdAt(projection.getCreatedAt())
                    .orderStatus(projection.getOrderStatus())
                    .finalAmount(projection.getFinalAmount())
                    .paymentMethod(projection.getPaymentMethod())
                    .paymentStatus(projection.getPaymentStatus())
                    .fullShippingAddress(projection.getFullShippingAddress())
                    .items(parsedItems)
                    .build();
        }).collect(Collectors.toList());

        // 2. Gọi Database lấy bộ đếm trạng thái
        List<OrderStatusCountProjection> counts = orderRepository.countOrdersByStatusForUser(userId);

        // Khởi tạo Map với giá trị 0 cho TẤT CẢ các trạng thái (để Frontend không bị lỗi undefinied)
        Map<String, Long> statusSummary = new HashMap<>();
        for (OrderStatus os : OrderStatus.values()) {
            statusSummary.put(os.name(), 0L);
        }

        // Ghi đè số lượng thật từ DB và tính tổng "ALL"
        long totalAll = 0;
        for (OrderStatusCountProjection c : counts) {
            statusSummary.put(c.getStatus(), c.getCount());
            totalAll += c.getCount();
        }
        statusSummary.put("ALL", totalAll); // Thêm tab TẤT CẢ

        // 3. Đóng gói và trả về
        return OrderPageResponse.builder()
                .statusSummary(statusSummary)
                .content(content)
                .currentPage(rawPage.getNumber())
                .totalPages(rawPage.getTotalPages())
                .totalElements(rawPage.getTotalElements())
                .isLast(rawPage.isLast())
                .build();
    }

    @Transactional(readOnly = true)
    public ClientOrderDetailResponse getOrderDetailForClient(Integer userId, Integer orderId) {

        // 1. Tìm đơn hàng
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng!"));

        // 2. CHỐT CHẶN BẢO MẬT QUAN TRỌNG NHẤT: Kiểm tra chính chủ
        if (!order.getUser().getId().equals(userId)) {
            throw new AccessDeniedException("Bạn không có quyền xem đơn hàng này!");
        }

        // 3. Tìm trạng thái thanh toán & phương thức mới nhất
        String paymentMethod = null;
        String paymentStatus = null;
        if (order.getPayments() != null && !order.getPayments().isEmpty()) {
            Payment latestPayment = order.getPayments().get(order.getPayments().size() - 1);
            paymentMethod = latestPayment.getMethod() != null ? latestPayment.getMethod().name() : null;
            paymentStatus = latestPayment.getStatus() != null ? latestPayment.getStatus().name() : null;
        }

        // 4. Nối địa chỉ
        String fullAddress = String.format("%s, %s, %s, %s",
                order.getShippingAddress(), order.getShippingWard(),
                order.getShippingDistrict(), order.getShippingCity());

        // 5. Map mảng Items (Che giấu SKU)
        List<ClientOrderItemResponse> itemResponses = order.getOrderItems().stream()
                .map(item -> ClientOrderItemResponse.builder()
                        .productId(item.getProductVariant() != null ? item.getProductVariant().getProduct().getId() : null)
                        .variantId(item.getProductVariant() != null ? item.getProductVariant().getId() : null)
                        .productName(item.getProductName())
                        .variantInfo(String.format("%s %s %s",
                                item.getOption1Value() != null ? item.getOption1Value() : "",
                                item.getOption2Value() != null ? item.getOption2Value() : "",
                                item.getOption3Value() != null ? item.getOption3Value() : "").trim())
                        .thumbnail(item.getThumbnail())
                        .price(item.getPrice())
                        .quantity(item.getQuantity())
                        .totalPrice(item.getTotalPrice())
                        .build())
                .collect(Collectors.toList());

        // 6. Build DTO trả về
        return ClientOrderDetailResponse.builder()
                .id(order.getId())
                .code(order.getCode())
                .orderStatus(order.getOrderStatus().name())
                .createdAt(order.getCreatedAt())
                .note(order.getNote())
                .cancelReason(order.getCancelReason())
                .customerName(order.getCustomerName())
                .customerPhone(order.getCustomerPhone())
                .fullShippingAddress(fullAddress)
                .shippingCarrier(order.getShippingCarrier())
                .trackingNumber(order.getTrackingNumber())
                .paymentMethod(paymentMethod)
                .paymentStatus(paymentStatus)
                .totalAmount(order.getTotalAmount())
                .shippingFee(order.getShippingFee())
                .discountAmount(order.getDiscountAmount())
                .finalAmount(order.getFinalAmount())
                .isVatRequired(order.getIsVatRequired())
                .companyName(order.getCompanyName())
                .taxCode(order.getTaxCode())
                .companyAddress(order.getCompanyAddress())
                .items(itemResponses)
                .build();
    }


    @Transactional(rollbackFor = Exception.class)
    public OrderResponse checkout(Integer userId, String sessionId, OrderRequest request) {

        // =========================================================
        // 1. ÁNH XẠ CƠ BẢN & KHỞI TẠO ORDER
        // =========================================================
        Order order = orderMapper.toEntity(request);
        order.setCode(CodeGeneratorUtil.generateOrderCode());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setOrderItems(new ArrayList<>()); // Đảm bảo list không bị null

        if (userId != null) {
            User userRef = new User();
            userRef.setId(userId);
            order.setUser(userRef);
        }

        // =========================================================
        // 2. [BẢO MẬT] XỬ LÝ ĐỊA CHỈ (OVERWRITE TỪ DB NẾU LÀ USER)
        // =========================================================
        if (request.getAddressId() != null) {
            Address address = addressRepository.findById(request.getAddressId())
                    .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy địa chỉ giao hàng!"));

            if (userId == null || !address.getUser().getId().equals(userId)) {
                throw new IllegalStateException("Hành vi đáng ngờ: Bạn không có quyền sử dụng địa chỉ này!");
            }

            // Ghi đè thông tin từ DB để ngăn ngừa gian lận sửa thông tin qua F12
            order.setCustomerName(address.getFullName());
            order.setCustomerPhone(address.getPhone());
            order.setShippingAddress(address.getAddressDetail());
            order.setShippingWard(address.getWard());
            order.setShippingDistrict(address.getDistrict());
            order.setShippingCity(address.getCity());
            order.setShippingWardCode(address.getWardCode());
            order.setShippingDistrictCode(address.getDistrictCode());
            order.setShippingCityCode(address.getCityCode());
        }

        // =========================================================
        // 3. XỬ LÝ SẢN PHẨM, KHO VÀ [FLASH SALE] (TỐI ƯU N+1)
        // =========================================================
        BigDecimal totalAmount = BigDecimal.ZERO;

        // Lấy toàn bộ variant_id trong đơn hàng
        List<Integer> variantIds = request.getItems().stream()
                .map(OrderRequest.CheckoutItemRequest::getVariantId)
                .toList();

        // Query DB 1 lần duy nhất để lấy tất cả Flash Sale đang chạy cho các sản phẩm này
        Map<Integer, FlashSale> activeSalesMap = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        for (OrderRequest.CheckoutItemRequest itemReq : request.getItems()) {
            ProductVariant variant = variantRepository.findById(itemReq.getVariantId())
                    .orElseThrow(() -> new IllegalArgumentException("Sản phẩm không tồn tại!"));

            // [ĐỒNG BỘ KHO THƯỜNG]: Dùng câu query UPDATE nguyên tử để trừ kho
            int updatedRows = variantRepository.decrementStockSafely(variant.getId(), itemReq.getQuantity());
            if (updatedRows == 0) {
                throw new IllegalStateException("Xin lỗi, sản phẩm " + variant.getSku() + " vừa hết hàng hoặc không đủ số lượng!");
            }

            // [XỬ LÝ GIÁ]: Ưu tiên giá Flash Sale, nếu không có thì lấy giá gốc
            BigDecimal itemPrice = variant.getPrice();
            FlashSale activeSale = activeSalesMap.get(variant.getId());

            if (activeSale != null) {
                // Đè giá Flash Sale
                itemPrice = activeSale.getFlashSalePrice();

                // Trừ số lượng suất Flash Sale an toàn
                flashSaleService.deductFlashSaleStockSafely(activeSale.getId(), itemReq.getQuantity());
            }

            // Tính tiền cho món hàng này và cộng vào tổng đơn
            BigDecimal itemTotalPrice = itemPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotalPrice);

            // Tạo dòng OrderItem
            OrderItem orderItem = OrderItem.builder()
                    .order(order)
                    .productVariant(variant)
                    .productName(variant.getProduct().getName())
                    .sku(variant.getSku())
                    .thumbnail(variant.getProduct().getThumbnail())
                    .option1Name(variant.getProduct().getOption1Name())
                    .option1Value(variant.getOption1Value())
                    .option2Name(variant.getProduct().getOption2Name())
                    .option2Value(variant.getOption2Value())
                    .quantity(itemReq.getQuantity())
                    .price(itemPrice)
                    .totalPrice(itemTotalPrice)
                    .isSerialRequired(variant.getIsSerialRequired())
                    .build();

            order.getOrderItems().add(orderItem);

            // Dọn dẹp giỏ hàng
            if (itemReq.getCartItemId() != null) {
                cartService.removeCartItemById(userId, sessionId, itemReq.getCartItemId());
            }
        }

        // =========================================================
        // 4. GỌI API GOSHIP ĐỂ TÍNH LẠI PHÍ SHIP (ZERO-TRUST)
        // =========================================================
        BigDecimal realShippingFee = BigDecimal.ZERO;

        // Tổng cân nặng tạm tính (Ví dụ: 200 gram / sản phẩm)
        int totalWeight = request.getItems().stream().mapToInt(OrderRequest.CheckoutItemRequest::getQuantity).sum() * 200;

        GoshipDto.FeeRequest feeRequest = GoshipDto.FeeRequest.builder()
                .city(order.getShippingCityCode())
                .district(order.getShippingDistrictCode())
                .ward(order.getShippingWardCode())
                .weight(totalWeight)
                .amount(totalAmount.intValue()) // Tiền hàng để tính bảo hiểm
                .cod(0)
                .build();

        try {
            List<JsonNode> rates = goshipService.calculateShippingFee(feeRequest);

            // Tìm đúng gói cước (rate_id) mà khách đã chọn trên Frontend gửi xuống
            // VD gửi xuống: goshipShipmentId: "MTNfN18xNjEx"
            String requestedRateId = request.getGoshipShipmentId();

            for (JsonNode rate : rates) {
                if (rate.path("id").asText().equals(requestedRateId)) {
                    realShippingFee = new BigDecimal(rate.path("total_fee").asText());
                    order.setShippingCarrier(rate.path("carrier_name").asText()); // VD: "Giao Hàng Tiết Kiệm"
                    break;
                }
            }

            // Nếu không tìm thấy mã khớp, lấy gói cước đầu tiên mặc định
            if (realShippingFee.compareTo(BigDecimal.ZERO) == 0 && !rates.isEmpty()) {
                JsonNode defaultRate = rates.get(0);
                realShippingFee = new BigDecimal(defaultRate.path("total_fee").asText());
                order.setShippingCarrier(defaultRate.path("carrier_name").asText());
                requestedRateId = defaultRate.path("id").asText();
            }

            order.setGoshipShipmentId(requestedRateId); // Lưu lại rate_id để sau này Admin tạo vận đơn

        } catch (Exception e) {
            // Có thể gán phí mặc định nếu API Goship lỗi
            realShippingFee = new BigDecimal("30000");
        }

        // =========================================================
        // 5. ÁP MÃ VOUCHER
        // =========================================================
        BigDecimal discountAmount = BigDecimal.ZERO;

        if (request.getVoucherCode() != null && !request.getVoucherCode().trim().isEmpty()) {
            String code = request.getVoucherCode().trim().toUpperCase();

            // VoucherService sẽ tự kiểm tra đơn tối thiểu, hết hạn... dựa trên totalAmount
            discountAmount = voucherService.calculateDiscountAmount(code, totalAmount);

            Voucher appliedVoucher = voucherRepository.findByCodeAndDeletedAtIsNull(code)
                    .orElseThrow(() -> new IllegalArgumentException("Mã giảm giá không hợp lệ!"));
            order.setVoucher(appliedVoucher);

            // Trừ lượt sử dụng (Update vào DB)
            voucherService.incrementUsedCount(code);
        }

        // =========================================================
        // 6. TỔNG KẾT, LƯU ORDER & PAYMENT
        // =========================================================
        BigDecimal finalAmount = totalAmount.subtract(discountAmount).add(realShippingFee);
        finalAmount = finalAmount.max(BigDecimal.ZERO); // Ngăn trường hợp voucher giảm quá đà gây âm tiền

        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(realShippingFee);
        order.setFinalAmount(finalAmount);

        Payment payment = Payment.builder()
                .order(order)
                .method(request.getPaymentMethod())
                .amount(finalAmount) // Số tiền thanh toán thực tế
                .status(PaymentStatus.PENDING)
                .build();
        order.getPayments().add(payment);

        return orderMapper.toResponse(orderRepository.save(order));
    }

    @Transactional
    public void cancelOrderByUser(Integer userId, String orderCode, String cancelReason) {
        Order order = orderRepository.findByCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng!"));

        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new IllegalStateException("Bạn không có quyền thao tác!");
        }
        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ được hủy khi đơn hàng đang chờ xác nhận.");
        }
        if (cancelReason == null || cancelReason.trim().isEmpty()) {
            throw new IllegalArgumentException("Vui lòng nhập lý do hủy!");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancelReason("Khách hàng tự hủy: " + cancelReason);
        orderRepository.save(order);
    }

    // Trong OrderService.java
    @Transactional
    public void cancelOrderByAdmin(String code, String reason) {
        Order order = orderRepository.findByCode(code)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng!"));

        if (!order.getOrderStatus().equals(OrderStatus.PENDING) && !order.getOrderStatus().equals(OrderStatus.CONFIRMED)) {
            throw new IllegalStateException("Chỉ có thể hủy đơn hàng khi đang chờ xác nhận hoặc chờ lấy hàng!");
        }

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);
        // (Có thể bạn cần gọi hàm cộng lại số lượng tồn kho (Stock) vào đây)

        orderRepository.save(order);
    }


    // ============================================================================
    // PHẦN 1: THAO TÁC CỦA ADMIN (MANUAL ACTIONS)
    // ============================================================================

    /**
     * Bước 1: Admin Xác nhận đơn hàng
     */
    @Transactional
    public OrderResponse confirmOrder(Integer orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng!"));

        if (order.getOrderStatus() != OrderStatus.PENDING) {
            throw new IllegalStateException("Chỉ có thể xác nhận đơn hàng đang ở trạng thái Chờ xác nhận!");
        }

        order.setOrderStatus(OrderStatus.CONFIRMED);
        return orderMapper.toResponse(orderRepository.save(order));
    }

    /**
     * Bước 2: Admin Đóng gói & Bắn đơn sang Goship
     * (Thực tế hàm này sẽ gọi API của Goship để tạo đơn, lấy Tracking Number về)
     */
    /**
     * Bước 2: Admin Đóng gói & Bắn đơn sang Goship
     */
    @Transactional(rollbackFor = Exception.class)
    public OrderResponse packAndReadyToShip(Integer orderId, PackOrderRequest request) {

        // 1. TÌM ĐƠN HÀNG VÀ KIỂM TRA
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đơn hàng!"));

        if (order.getOrderStatus() != OrderStatus.CONFIRMED) {
            throw new IllegalStateException("Đơn hàng phải ở trạng thái ĐÃ XÁC NHẬN mới được đóng gói!");
        }

        // 2. XỬ LÝ SERIAL (TỐI ƯU HIỆU NĂNG - BATCH UPDATE)
        Map<Integer, List<String>> scannedSerialsMap = request.getSerials();
        List<ProductSerial> serialsToUpdate = new ArrayList<>();

        for (OrderItem item : order.getOrderItems()) {
            if (item.getProductVariant() == null) {
                throw new IllegalStateException("Sản phẩm [" + item.getProductName() + "] không còn trong kho!");
            }

            Integer variantId = item.getProductVariant().getId();
            List<String> providedSerials = (scannedSerialsMap != null) ? scannedSerialsMap.get(variantId) : null;

            // Xử lý cờ isSerialRequired lấy từ Variant
            if (item.getProductVariant().getIsSerialRequired()) {
                if (providedSerials == null || providedSerials.size() != item.getQuantity()) {
                    throw new IllegalArgumentException("Vui lòng quét đúng " + item.getQuantity() + " mã Serial cho " + item.getProductName());
                }
            } else if (providedSerials != null && !providedSerials.isEmpty()) {
                throw new IllegalArgumentException("Sản phẩm [" + item.getProductName() + "] không quản lý bằng Serial!");
            }

            if (providedSerials != null && !providedSerials.isEmpty()) {
                for (String serialNumber : providedSerials) {
                    ProductSerial ps = serialRepository.findBySerialNumber(serialNumber)
                            .orElseThrow(() -> new IllegalArgumentException("Mã Serial không tồn tại: " + serialNumber));

                    if (!ps.getStatus().equals(SerialStatus.AVAILABLE)) {
                        throw new IllegalStateException("Mã Serial [" + serialNumber + "] không khả dụng!");
                    }
                    if (!ps.getProductVariantId().equals(variantId)) {
                        throw new IllegalStateException("Mã Serial [" + serialNumber + "] không khớp với sản phẩm!");
                    }

                    ps.setStatus(SerialStatus.SOLD);
                    ps.setOrderId(order.getId());
                    serialsToUpdate.add(ps);
                }
            }
        }

        if (!serialsToUpdate.isEmpty()) {
            serialRepository.saveAll(serialsToUpdate);
        }

        // 3. CHUẨN BỊ DATA GOSHIP
        Map<String, Object> shipmentData = new HashMap<>();
        shipmentData.put("rate_id", order.getGoshipShipmentId());
        shipmentData.put("name", order.getCustomerName());
        shipmentData.put("phone", order.getCustomerPhone());
        shipmentData.put("address_detail", order.getShippingAddress());
        shipmentData.put("city", order.getShippingCityCode());
        shipmentData.put("district", order.getShippingDistrictCode());
        shipmentData.put("ward", order.getShippingWardCode());

        boolean isAlreadyPaid = order.getPayments().stream()
                .anyMatch(p -> p.getStatus() == PaymentStatus.COMPLETED);
        shipmentData.put("cod", isAlreadyPaid ? 0 : order.getFinalAmount().intValue());
        shipmentData.put("amount", order.getFinalAmount().intValue());

        // =====================================================================
        // 4. GỌI API GOSHIP & XỬ LÝ ĐỒNG BỘ DỮ LIỆU
        // =====================================================================
        Map<String, Object> goshipResponse;
        try {
            goshipResponse = goshipService.createShipment(shipmentData);
            log.info("Goship Response: {}", goshipResponse);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi kết nối hoặc API Goship từ chối: " + e.getMessage());
        }

        // Kiểm tra trạng thái thành công trực tiếp từ ngoài cùng
        if (goshipResponse == null || !"success".equals(goshipResponse.get("status"))) {
            throw new RuntimeException("API Goship trả về lỗi! Data: " + goshipResponse);
        }

        // Lấy ID vận đơn nội bộ của Goship (GS83JEMBVL)
        String newShipmentId = String.valueOf(goshipResponse.get("id"));

        // Xử lý thông minh Tracking Number (Chống chết code khi hãng trả về chữ "NULL" hoặc null)
        Object trackingObj = goshipResponse.get("tracking_number");
        String trackingNumber;

        if (trackingObj != null && !"NULL".equalsIgnoreCase(String.valueOf(trackingObj).trim()) && !String.valueOf(trackingObj).trim().isEmpty()) {
            trackingNumber = String.valueOf(trackingObj); // Lấy mã của GHTK/GHN nếu có
        } else {
            trackingNumber = newShipmentId; // Nếu hãng chưa cấp mã kịp, lấy tạm mã Goship làm Tracking
        }

        // 5. CHỐT TRẠNG THÁI ĐƠN HÀNG
        order.setOrderStatus(OrderStatus.READY_TO_SHIP);
        order.setTrackingNumber(trackingNumber);
        order.setGoshipShipmentId(newShipmentId);

        // Bắt lỗi khi DB chết sau khi Goship đã tạo đơn thành công
        try {
            Order savedOrder = orderRepository.save(order);
            return orderMapper.toResponse(savedOrder);
        } catch (DataAccessException e) {
            // BƯỚC CỨU CÁNH: Rollback DB và Hủy đơn rác bên Goship
            log.error("Lỗi lưu DB, đang gọi Goship để hủy đơn rác có ID: " + newShipmentId);
            goshipService.cancelShipment(newShipmentId);
            throw new RuntimeException("Lỗi lưu DB, đã rollback dữ liệu và hủy đơn trên Goship!");
        }
    }


    // ============================================================================
    // PHẦN 2: THAO TÁC TỰ ĐỘNG CỦA HỆ THỐNG (WEBHOOK TỪ GOSHIP)
    // ============================================================================

    /**
     * Hàm này được gọi bởi Controller hứng Webhook của Goship.
     * Khi bưu tá thao tác trên App, Goship sẽ bắn mã trạng thái (904, 905...) về hàm này.
     */
    @Transactional
    public void handleGoshipWebhook(GoshipWebhookRequest request) {

        // ==========================================
        // 1. TÌM ĐƠN HÀNG BẰNG ORDER CODE (GIẢ LẬP KEY)
        // ==========================================
        Order order = orderRepository.findByCode(request.getOrderCode())
                .orElseThrow(() -> new IllegalArgumentException(
                        "Không tìm thấy đơn hàng với code: " + request.getOrderCode()));

        // ==========================================
        // 2. CẬP NHẬT TRACKING NUMBER (NẾU CÓ)
        // ==========================================
        if (StringUtils.hasText(request.getTrackingNumber()) &&
                !request.getTrackingNumber().equals(order.getTrackingNumber())) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        // ==========================================
        // 3. CHẶN WEBHOOK TRÙNG (TRÁNH DOUBLE UPDATE)
        // ==========================================
        OrderStatus currentStatus = order.getOrderStatus();

        if (currentStatus == OrderStatus.COMPLETED ||
                currentStatus == OrderStatus.CANCELLED ||
                currentStatus == OrderStatus.RETURNED) {

            log.warn("Đơn {} đã chốt trạng thái {}, bỏ qua webhook {}",
                    order.getCode(), currentStatus,request.getGoshipStatusCode());
            return;
        }

        // ==========================================
        // 4. MAP TRẠNG THÁI GOSHIP
        // ==========================================
        switch (request.getGoshipStatusCode()) {

            case 902: case 903: case 904: case 916: case 918: case 919:
                order.setOrderStatus(OrderStatus.SHIPPING);
                break;

            case 905: // giao thành công
                order.setOrderStatus(OrderStatus.DELIVERED);
                break;

            case 906: case 907: // thất bại / chuyển hoàn
                String oldNote = StringUtils.hasText(order.getNote())
                        ? order.getNote() + " | "
                        : "";
                order.setNote(oldNote + "[Goship]: " + request.getNote());
                break;

            case 908: // hoàn về kho
                order.setOrderStatus(OrderStatus.RETURNED);
                order.setCancelReason("Hoàn hàng: " +  request.getNote());
                restoreStockForOrder(order);
                break;

            case 913: // đối soát xong
                order.setOrderStatus(OrderStatus.COMPLETED);
                break;

            case 914: // hủy vận chuyển
                order.setOrderStatus(OrderStatus.CANCELLED);
                order.setCancelReason("Vận chuyển hủy: " +  request.getNote());
                restoreStockForOrder(order);
                break;

            default:
                log.info("Chưa xử lý status Goship: {}", request.getGoshipStatusCode());
                break;
        }

        orderRepository.save(order);
    }

    // ==========================================
    // HÀM PHỤ TRỢ: HOÀN LẠI TỒN KHO (Chạy cực mượt)
    // ==========================================
    private void restoreStockForOrder(Order order) {
        log.info("🔄 Tiến hành hoàn lại tồn kho cho đơn hàng: {}", order.getCode());

        for (OrderItem item : order.getOrderItems()) {
            ProductVariant variant = item.getProductVariant();
            if (variant != null) {
                // Cộng lại số lượng khách đã đặt vào trong kho
                int newStock = variant.getStockQuantity() + item.getQuantity();
                variant.setStockQuantity(newStock);

                // Lưu lại vào DB
                variantRepository.save(variant);
            }
        }
    }


    //Lấy danh sách đơn hàng để in hóa đơn
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersForPrint(List<String> orderCodes) {
        List<Order> orders = orderRepository.findByCodeIn(orderCodes);
        if (orders.isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy đơn hàng nào để in!");
        }
        return orders.stream()
                .map(orderMapper::toResponse)
                .collect(Collectors.toList());
    }
}