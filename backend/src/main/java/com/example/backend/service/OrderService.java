package com.example.backend.service;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

import com.example.backend.repository.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.example.backend.dto.request.*;
import com.example.backend.dto.response.admin.AdminOrderResponse;
import com.example.backend.dto.response.client.*;
import com.example.backend.entity.*;
import com.example.backend.enums.OrderStatus;
import com.example.backend.enums.PaymentMethod;
import com.example.backend.enums.PaymentStatus;
import com.example.backend.enums.SerialStatus;
import com.example.backend.exception.CustomException;
import com.example.backend.exception.ErrorCode;
import com.example.backend.mapper.OrderMapper;
import com.example.backend.repository.projection.OrderStatusCountProjection;
import com.example.backend.repository.projection.UserOrderProjection;
import com.example.backend.utils.CodeGeneratorUtil;
import com.example.backend.utils.SecurityUtils;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

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
    private final VoucherRepository voucherRepository;
    private final PaymentRepository paymentRepository;
    private final GoshipService goshipService;
    private final FlashSaleService flashSaleService;
    private final InventoryService inventoryService;
    private final VnpayService vnpayService;
    private final ProductSerialRepository serialRepository;
    private final ObjectMapper objectMapper;

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getAllOrders() {
        return orderRepository.findAllByOrderByUpdatedAtDesc().stream()
                .map(orderMapper::toAdminOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderPageResponse getMyOrders(String status, String keyword, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Integer userId = getCurrentUserId();

        Page<UserOrderProjection> rawPage =
                orderRepository.findUserOrdersWithFilters(userId, status, keyword, pageable);

        List<ClientOrderResponse> content = rawPage.stream()
                .map(projection -> {
                    List<ClientOrderResponse.OrderItem> parsedItems = new ArrayList<>();
                    try {
                        if (projection.getItemsJson() != null
                                && !projection.getItemsJson().isEmpty()) {
                            parsedItems = objectMapper.readValue(projection.getItemsJson(), new TypeReference<>() {});
                        }
                    } catch (Exception e) {
                        log.error("Lỗi parse JSON items cho đơn hàng ID {}: {}", projection.getId(), e.getMessage());
                    }

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
                })
                .toList();
        List<OrderStatusCountProjection> counts = orderRepository.countOrdersByStatusForUser(userId);

        Map<String, Long> statusSummary = new HashMap<>();
        for (OrderStatus os : OrderStatus.values()) {
            statusSummary.put(os.name(), 0L);
        }

        long totalAll = 0;
        for (OrderStatusCountProjection c : counts) {
            statusSummary.put(c.getStatus(), c.getCount());
            totalAll += c.getCount();
        }
        statusSummary.put("ALL", totalAll);

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
    public ClientOrderDetailResponse getOrderDetailForClient(Integer orderId) {

        Integer userId = getCurrentUserId();
        Order order = getOrderByIdOrThrow(orderId);

        if (!order.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.AUTH_UNAUTHORIZED_ACTION);
        }

        return orderMapper.toClientOrderDetailResponse(order);
    }

    @Transactional
    public void cancelOrderByUser(Integer userId, String orderCode, String cancelReason) {
        Order order = getOrderByCodeOrThrow(orderCode);

        if (order.getUser() == null || !order.getUser().getId().equals(userId)) {
            throw new CustomException(ErrorCode.AUTH_UNAUTHORIZED_ACTION);
        }

        validateCancellableStatus(order);

        validateCancelReason(cancelReason);

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancelReason("Khách hàng tự hủy: " + cancelReason);

        restoreInventory(order);

        triggerAsyncRefund(order, "user_" + userId);
    }

    @Transactional
    public void cancelOrderByAdmin(String code, String reason) {
        Order order = getOrderByCodeOrThrow(code);

        validateCancelReason(reason);

        validateCancellableStatus(order);

        order.setOrderStatus(OrderStatus.CANCELLED);
        order.setCancelReason(reason);

        restoreInventory(order);

        triggerAsyncRefund(order, "admin");
    }

    private void triggerAsyncRefund(Order order, String cancelBy) {
        Payment vnpayPayment = order.getPayments().stream()
                .filter(p -> p.getMethod() == PaymentMethod.VNPAY && p.getStatus() == PaymentStatus.COMPLETED)
                .findFirst()
                .orElse(null);

        if (vnpayPayment != null) {

            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String ipAddress = vnpayService.getIpAddress(request);

            vnpayService.processVnpayRefundAsync(vnpayPayment, order, cancelBy, ipAddress);
        }
    }

    @Transactional
    public AdminOrderResponse confirmOrder(Integer orderId) {
        Order order = getOrderByIdOrThrow(orderId);

        if (!order.getOrderStatus().canConfirm()) {
            throw new CustomException(
                    ErrorCode.ORDER_INVALID_STATUS, "Chỉ có thể xác nhận đơn hàng đang ở trạng thái Chờ xác nhận!");
        }

        order.setOrderStatus(OrderStatus.CONFIRMED);
        return orderMapper.toAdminOrderResponse(order);
    }

    @Transactional(rollbackFor = Exception.class)
    public AdminOrderResponse packAndReadyToShip(Integer orderId, PackOrderRequest request) {

        Order order = getOrderByIdOrThrow(orderId);

        if (!order.getOrderStatus().equals(OrderStatus.CONFIRMED)) {
            throw new CustomException(
                    ErrorCode.ORDER_INVALID_STATUS, "Đơn hàng phải ở trạng thái ĐÃ XÁC NHẬN mới được đóng gói!");
        }

        processProductSerials(order, request.getSerials());

        inventoryService.exportStockFromOrder(order);

        Map<String, Object> shipmentData = buildGoshipShipmentData(order);

        Map<String, Object> goshipResponse;
        try {
            goshipResponse = goshipService.createShipment(shipmentData);
        } catch (Exception e) {
            throw new CustomException(ErrorCode.GOSHIP_API_ERROR, e.getMessage());
        }

        if (goshipResponse == null || !"success".equals(goshipResponse.get("status"))) {
            throw new CustomException(ErrorCode.GOSHIP_REJECTED);
        }

        String newShipmentId = String.valueOf(goshipResponse.get("id"));
        Object trackingObj = goshipResponse.get("tracking_number");

        String trackingNumber = (trackingObj != null
                        && !"NULL".equalsIgnoreCase(String.valueOf(trackingObj).trim())
                        && StringUtils.hasText(String.valueOf(trackingObj)))
                ? String.valueOf(trackingObj)
                : newShipmentId;

        order.setOrderStatus(OrderStatus.READY_TO_SHIP);
        order.setTrackingNumber(trackingNumber);
        order.setGoshipShipmentId(newShipmentId);

        try {
            return orderMapper.toAdminOrderResponse(orderRepository.save(order));
        } catch (DataAccessException e) {
            log.error("Lỗi lưu DB, đang gọi Goship để hủy đơn rác có ID: {} ", newShipmentId);
            goshipService.cancelShipment(newShipmentId);
            throw new CustomException(ErrorCode.DB_SYNC_ERROR_ROLLBACK);
        }
    }

    @Transactional
    public void handleGoshipWebhook(GoshipWebhookRequest request) {

        Order order = getOrderByCodeOrThrow(request.getOrderCode());

        if (StringUtils.hasText(request.getTrackingNumber())
                && !request.getTrackingNumber().equals(order.getTrackingNumber())) {
            order.setTrackingNumber(request.getTrackingNumber());
        }

        OrderStatus currentStatus = order.getOrderStatus();

        if (currentStatus == OrderStatus.COMPLETED
                || currentStatus == OrderStatus.CANCELLED
                || currentStatus == OrderStatus.RETURNED) {

            log.warn("Đơn {} đã chốt trạng thái {}, bỏ qua webhook {}",
                    order.getCode(),
                    currentStatus,
                    request.getGoshipStatusCode());
            return;
        }

        Payment payment = order.getPayments().stream()
                .findFirst()
                .orElseThrow(() -> new CustomException(ErrorCode.PAYMENT_NOT_FOUND));

        boolean isCOD = payment.getMethod() == PaymentMethod.COD;

        switch (request.getGoshipStatusCode()) {

            case 902, 903, 904, 916, 918, 919 -> {
                order.setOrderStatus(OrderStatus.SHIPPING);
            }

            case 905 -> {
                order.setOrderStatus(OrderStatus.DELIVERED);
            }

            case 906, 907 -> {
                String oldNote = StringUtils.hasText(order.getNote()) ? order.getNote() + " | " : "";
                order.setNote(oldNote + "[Goship]: " + request.getNote());
            }

            case 908 -> {
                order.setOrderStatus(OrderStatus.RETURNED);
                order.setCancelReason("Hoàn hàng: " + request.getNote());

                if (isCOD) {
                    payment.setStatus(PaymentStatus.FAILED);
                } else {
                    payment.setStatus(PaymentStatus.REFUNDED);
                }

                restoreInventory(order);
            }

            case 913 -> {
                order.setOrderStatus(OrderStatus.COMPLETED);
                if (isCOD) {
                    payment.setStatus(PaymentStatus.COMPLETED);
                }
            }

            case 914 -> {
                order.setOrderStatus(OrderStatus.CANCELLED);
                order.setCancelReason("Vận chuyển hủy: " + request.getNote());

                if (isCOD) {
                    payment.setStatus(PaymentStatus.FAILED);
                } else {
                    payment.setStatus(PaymentStatus.REFUNDED);
                }

               restoreInventory(order);
            }

            default -> log.info("Chưa xử lý status Goship: {}", request.getGoshipStatusCode());
        }

        orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public List<AdminOrderResponse> getOrdersForPrint(List<String> orderCodes) {
        List<Order> orders = orderRepository.findByCodeIn(orderCodes);
        if (orders.isEmpty()) {
            throw new CustomException(ErrorCode.ORDER_EMPTY_PRINT_LIST);
        }
        return orders.stream().map(orderMapper::toAdminOrderResponse).toList();
    }

    private Map<String, Object> buildGoshipShipmentData(Order order) {
        Map<String, Object> shipmentData = new HashMap<>();
        shipmentData.put("rate_id", order.getGoshipShipmentId());
        shipmentData.put("name", order.getCustomerName());
        shipmentData.put("phone", order.getCustomerPhone());
        shipmentData.put("address_detail", order.getShippingAddress());
        shipmentData.put("city", order.getShippingCityCode());
        shipmentData.put("district", order.getShippingDistrictCode());
        shipmentData.put("ward", order.getShippingWardCode());

        boolean isAlreadyPaid = order.getPayments().stream().anyMatch(p -> p.getStatus() == PaymentStatus.COMPLETED);
        shipmentData.put("cod", isAlreadyPaid ? 0 : order.getFinalAmount().intValue());
        shipmentData.put("amount", order.getFinalAmount().intValue());
        return shipmentData;
    }

    private Integer getCurrentUserId() {
        try {
            return SecurityUtils.getCurrentUserId();
        } catch (Exception e) {
            return null;
        }
    }

    private Order getOrderByIdOrThrow(Integer id) {
        return orderRepository.findById(id).orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
    }

    private Order getOrderByCodeOrThrow(String code) {
        return orderRepository.findByCode(code).orElseThrow(() -> new CustomException(ErrorCode.ORDER_NOT_FOUND));
    }

    private void validateCancelReason(String reason) {
        if (reason == null || reason.isBlank()) {
            throw new CustomException(ErrorCode.ORDER_EMPTY_CANCEL_REASON);
        }
    }

    private void restoreInventory(Order order) {
        inventoryService.restoreStockFromCancelledOrder(order);
        for (OrderItem item : order.getOrderItems()) {
            log.info("Số luong ban flah slae hoan lại: {} ", item.getQuantity());
            flashSaleService.restoreFlashSaleStock(
                    item.getProductVariant().getId(),
                    item.getQuantity(),
                    order.getCreatedAt(),
                    item.getPrice()
            );
        }
    }


    private void processProductSerials(Order order, Map<Integer, List<String>> scannedSerialsMap) {
        List<ProductSerial> serialsToUpdate = new ArrayList<>();

        for (OrderItem item : order.getOrderItems()) {
            if (item.getProductVariant() == null) {
                throw new CustomException(
                        ErrorCode.PRODUCT_NOT_FOUND, "Sản phẩm [" + item.getProductName() + "] không còn trong kho!");
            }

            Integer variantId = item.getProductVariant().getId();
            List<String> providedSerials = (scannedSerialsMap != null) ? scannedSerialsMap.get(variantId) : null;

            validateSerialInput(item, providedSerials);

            if (providedSerials != null && !providedSerials.isEmpty()) {
                serialsToUpdate.addAll(processSerials(providedSerials, variantId, order.getId()));
            }
        }
        if (!serialsToUpdate.isEmpty()) {
            serialRepository.saveAll(serialsToUpdate);
        }
    }

    private void validateSerialInput(OrderItem item, List<String> providedSerials) {
        boolean isSerialRequired = Boolean.TRUE.equals(item.getProductVariant().getIsSerialRequired());

        if (isSerialRequired) {
            if (providedSerials == null || providedSerials.size() != item.getQuantity()) {
                throw new CustomException(
                        ErrorCode.SERIAL_INVALID_QUANTITY,
                        "Vui lòng quét đúng " + item.getQuantity() + " mã Serial cho " + item.getProductName());
            }
            return;
        }

        if (providedSerials != null && !providedSerials.isEmpty()) {
            throw new CustomException(ErrorCode.SERIAL_NOT_MANAGED, item.getProductName());
        }
    }

    private List<ProductSerial> processSerials(List<String> serialNumbers, Integer variantId, Integer orderId) {
        List<ProductSerial> result = new ArrayList<>();

        for (String rawSerial : serialNumbers) {

            String serialNumber = rawSerial.trim().replaceAll("\\s+", "").toUpperCase();
            log.info("Mã: {}", serialNumber);
            log.info("độ dài: {}", serialNumber.length());
            log.info("variant: {}", variantId);

            ProductSerial ps = serialRepository
                    .findBySerialNumber(serialNumber)
                    .orElseThrow(() -> new CustomException(ErrorCode.SERIAL_UNAVAILABLE));

            if (!ps.getStatus().equals(SerialStatus.AVAILABLE)
                    || !ps.getProductVariantId().equals(variantId)) {
                throw new CustomException(ErrorCode.SERIAL_MISMATCH,"Mã Serial: " + serialNumber + " không khớp với sản phẩm hoặc đã bán!");
            }

            ps.setStatus(SerialStatus.SOLD);
            ps.setOrderId(orderId);
            result.add(ps);
        }
        return result;
    }

    private void validateCancellableStatus(Order order) {
        if (!order.getOrderStatus().equals(OrderStatus.PENDING)
                && !order.getOrderStatus().equals(OrderStatus.CONFIRMED)) {
            throw new CustomException(
                    ErrorCode.ORDER_INVALID_STATUS, "Chỉ có thể hủy đơn hàng khi đang chờ xác nhận hoặc chờ lấy hàng!");
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public OrderCheckoutResponse checkout(String sessionId, OrderRequest request) {
        Integer userId = getCurrentUserId();

        Order order = orderMapper.toOrder(request);
        order.setCode(CodeGeneratorUtil.generateOrderCode());
        order.setOrderStatus(OrderStatus.PENDING);
        order.setOrderItems(new ArrayList<>());

        if (userId != null) {
            User userRef = new User();
            userRef.setId(userId);
            order.setUser(userRef);
        }

        processShippingAddress(order, userId, request.getAddressId());

        List<Integer> cartItemIdsToRemove = new ArrayList<>();
        BigDecimal totalAmount = processItemsAndCalculateTotal(order, request.getItems(), cartItemIdsToRemove);

        BigDecimal shippingFee = processShippingFee(order, request, totalAmount);

        BigDecimal discountAmount = processVoucher(order, request.getVoucherCode(), totalAmount);

        finalizeOrderAndPayment(order, request.getPaymentMethod(), totalAmount, shippingFee, discountAmount);

        log.info("dl: {}", cartItemIdsToRemove);

        if (!cartItemIdsToRemove.isEmpty()) {
            cartService.removeCartItemsBatch(userId, sessionId, cartItemIdsToRemove);
        }

        return orderMapper.toOrderCheckoutResponse(orderRepository.save(order));
    }

    private void processShippingAddress(Order order, Integer userId, Integer addressId) {
        if (addressId == null) return;

        Address address = addressRepository
                .findById(addressId)
                .orElseThrow(() -> new CustomException(ErrorCode.ADDRESS_NOT_FOUND));

        if (!Objects.equals(address.getUser().getId(), userId)) {
            throw new CustomException(ErrorCode.ADDRESS_NOT_OWNED_BY_USER);
        }

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

    private BigDecimal processItemsAndCalculateTotal(
            Order order, List<OrderRequest.CheckoutItemRequest> itemsReq, List<Integer> cartItemIdsToRemove) {
        BigDecimal totalAmount = BigDecimal.ZERO;

        List<Integer> variantIds = itemsReq.stream()
                .map(OrderRequest.CheckoutItemRequest::getVariantId)
                .toList();

        Map<Integer, ProductVariant> variantMap = variantRepository.findAllById(variantIds).stream()
                .collect(Collectors.toMap(ProductVariant::getId, v -> v));

        Map<Integer, FlashSale> activeSalesMap = flashSaleService.getActiveFlashSalesForVariants(variantIds);

        for (OrderRequest.CheckoutItemRequest itemReq : itemsReq) {
            ProductVariant variant = variantMap.get(itemReq.getVariantId());
            if (variant == null) {
                throw new CustomException(ErrorCode.PRODUCT_NOT_FOUND);
            }

            int updatedRows = variantRepository.decrementStockSafely(variant.getId(), itemReq.getQuantity());
            if (updatedRows == 0) {
                throw new CustomException(ErrorCode.PRODUCT_OUT_OF_STOCK, variant.getSku());
            }

            BigDecimal itemPrice = variant.getPrice();
            FlashSale activeSale = activeSalesMap.get(variant.getId());

            if (activeSale != null) {
                itemPrice = activeSale.getFlashSalePrice();
                flashSaleService.deductFlashSaleStockSafely(activeSale.getId(), itemReq.getQuantity());
            }

            BigDecimal itemTotalPrice = itemPrice.multiply(BigDecimal.valueOf(itemReq.getQuantity()));
            totalAmount = totalAmount.add(itemTotalPrice);

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

            if (itemReq.getCartItemId() != null) {
                cartItemIdsToRemove.add(itemReq.getCartItemId());
            }
        }
        return totalAmount;
    }

    private BigDecimal processShippingFee(Order order, OrderRequest request, BigDecimal totalAmount) {
        int totalWeight = request.getItems().stream()
                        .mapToInt(OrderRequest.CheckoutItemRequest::getQuantity)
                        .sum()
                * 200;

        GoshipDto.FeeRequest feeRequest = GoshipDto.FeeRequest.builder()
                .city(order.getShippingCityCode())
                .district(order.getShippingDistrictCode())
                .ward(order.getShippingWardCode())
                .weight(totalWeight)
                .amount(totalAmount.intValue())
                .cod(0)
                .build();

        try {
            List<Map<String, Object>> rates = goshipService.calculateShippingFee(feeRequest);
            String requestedRateId = request.getGoshipShipmentId();

            for (Map<String, Object> rate : rates) {
                String currentRateId = String.valueOf(rate.get("id"));

                if (currentRateId.equals(requestedRateId)) {
                    order.setShippingCarrier(String.valueOf(rate.get("carrier_name")));
                    order.setGoshipShipmentId(requestedRateId);
                    return new BigDecimal(String.valueOf(rate.get("total_fee")));
                }
            }

            if (!rates.isEmpty()) {
                Map<String, Object> defaultRate = rates.getFirst();

                order.setShippingCarrier(String.valueOf(defaultRate.get("carrier_name")));
                order.setGoshipShipmentId(String.valueOf(defaultRate.get("id")));
                return new BigDecimal(String.valueOf(defaultRate.get("total_fee")));
            }
        } catch (Exception e) {
            log.warn(
                    "Lỗi gọi API Goship tính phí vận chuyển, fallback về phí mặc định. OrderCode: {}", order.getCode());
        }

        order.setShippingCarrier("Mặc định");
        return new BigDecimal("30000");
    }

    private BigDecimal processVoucher(Order order, String voucherCode, BigDecimal totalAmount) {
        if (!StringUtils.hasText(voucherCode)) return BigDecimal.ZERO;

        String code = voucherCode.trim().toUpperCase();
        BigDecimal discountAmount = voucherService.calculateDiscountAmount(code, totalAmount);

        Voucher appliedVoucher = voucherRepository
                .findByCodeAndDeletedAtIsNull(code)
                .orElseThrow(() -> new CustomException(ErrorCode.VOUCHER_INVALID));

        order.setVoucher(appliedVoucher);
        voucherService.incrementUsedCount(code);

        return discountAmount;
    }

    private void finalizeOrderAndPayment(
            Order order,
            PaymentMethod paymentMethod,
            BigDecimal totalAmount,
            BigDecimal shippingFee,
            BigDecimal discountAmount) {
        BigDecimal finalAmount =
                totalAmount.subtract(discountAmount).add(shippingFee).max(BigDecimal.ZERO);

        order.setTotalAmount(totalAmount);
        order.setDiscountAmount(discountAmount);
        order.setShippingFee(shippingFee);
        order.setFinalAmount(finalAmount);

        Payment payment = Payment.builder()
                .order(order)
                .method(paymentMethod)
                .amount(finalAmount)
                .status(PaymentStatus.PENDING)
                .build();

        order.getPayments().add(payment);
    }
}
