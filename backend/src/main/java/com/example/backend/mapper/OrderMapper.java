package com.example.backend.mapper;

import com.example.backend.dto.request.OrderRequest;
import com.example.backend.dto.response.OrderItemResponse;
import com.example.backend.dto.response.OrderResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.Payment;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "payments", ignore = true)
    Order toEntity(OrderRequest request);

    // 1. Ánh xạ Order -> OrderResponse
    @Mapping(target = "fullShippingAddress", expression = "java(formatAddress(order))")
    @Mapping(target = "paymentMethod", expression = "java(getLatestPaymentMethod(order))")
    @Mapping(target = "paymentStatus", expression = "java(getLatestPaymentStatus(order))")
    @Mapping(target = "items", source = "orderItems")
    OrderResponse toResponse(Order order);

    // 2. Ánh xạ OrderItem -> OrderItemResponse
    @Mapping(target = "variantId", source = "productVariant.id")
    @Mapping(target = "variantInfo", expression = "java(formatVariantInfo(item))")
    OrderItemResponse toItemResponse(OrderItem item);

    // =========================================================
    // CÁC HÀM PHỤ TRỢ (DEFAULT METHODS) XỬ LÝ LOGIC NỐI CHUỖI
    // =========================================================

    default String formatAddress(Order order) {
        if (order == null || order.getShippingAddress() == null) return null;
        return String.format("%s, %s, %s, %s",
                order.getShippingAddress(), order.getShippingWard(),
                order.getShippingDistrict(), order.getShippingCity());
    }

    default String getLatestPaymentMethod(Order order) {
        if (order == null || order.getPayments() == null || order.getPayments().isEmpty()) return null;
        Payment latestPayment = order.getPayments().get(order.getPayments().size() - 1);
        return latestPayment.getMethod() != null ? latestPayment.getMethod().name() : null;
    }

    default String getLatestPaymentStatus(Order order) {
        if (order == null || order.getPayments() == null || order.getPayments().isEmpty()) return null;
        Payment latestPayment = order.getPayments().get(order.getPayments().size() - 1);
        return latestPayment.getStatus() != null ? latestPayment.getStatus().name() : null;
    }

    default String formatVariantInfo(OrderItem item) {
        if (item == null) return null;
        return String.format("%s %s %s",
                item.getOption1Value() != null ? item.getOption1Value() : "",
                item.getOption2Value() != null ? item.getOption2Value() : "",
                item.getOption3Value() != null ? item.getOption3Value() : "").trim();
    }
}