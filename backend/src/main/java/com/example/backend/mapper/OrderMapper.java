package com.example.backend.mapper;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.springframework.util.StringUtils;

import com.example.backend.dto.request.OrderRequest;
import com.example.backend.dto.response.admin.AdminOrderResponse;
import com.example.backend.dto.response.client.ClientOrderDetailResponse;
import com.example.backend.dto.response.client.OrderCheckoutResponse;
import com.example.backend.entity.Order;
import com.example.backend.entity.OrderItem;
import com.example.backend.entity.Payment;

@Mapper(componentModel = "spring")
public interface OrderMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "code", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "payments", ignore = true)
    Order toOrder(OrderRequest request);

    @Mapping(target = "fullShippingAddress", expression = "java(mapShippingAddress(order))")
    @Mapping(target = "paymentMethod", expression = "java(getLatestPaymentMethod(order))")
    @Mapping(target = "paymentStatus", expression = "java(getLatestPaymentStatus(order))")
    @Mapping(target = "items", source = "orderItems")
    AdminOrderResponse toAdminOrderResponse(Order order);

    @Mapping(target = "variantId", source = "productVariant.id")
    @Mapping(target = "variantInfo", expression = "java(mapVariantInfo(item))")
    AdminOrderResponse.OrderItem toItemResponse(OrderItem item);

    OrderCheckoutResponse toOrderCheckoutResponse(Order order);

    @Mapping(target = "fullShippingAddress", expression = "java(mapShippingAddress(order))")
    @Mapping(target = "paymentMethod", expression = "java(getLatestPaymentMethod(order))")
    @Mapping(target = "paymentStatus", expression = "java(getLatestPaymentStatus(order))")
    @Mapping(target = "items", source = "orderItems")
    ClientOrderDetailResponse toClientOrderDetailResponse(Order order);

    @Mapping(target = "variantId", source = "productVariant.id")
    @Mapping(target = "variantInfo", expression = "java(mapVariantInfo(item))")
    ClientOrderDetailResponse.OrderItem toClientItemResponse(OrderItem item);

    default String mapShippingAddress(Order order) {
        return Stream.of(
                        order.getShippingAddress(),
                        order.getShippingWard(),
                        order.getShippingDistrict(),
                        order.getShippingCity())
                .filter(Objects::nonNull)
                .filter(s -> !s.isBlank())
                .collect(Collectors.joining(", "));
    }

    default Payment getLatestPayment(Order order) {
        if (order == null || order.getPayments() == null || order.getPayments().isEmpty()) {
            return null;
        }
        List<Payment> payments = order.getPayments();
        return payments.get(payments.size() - 1);
    }

    default String getLatestPaymentMethod(Order order) {
        Payment p = getLatestPayment(order);
        return (p != null && p.getMethod() != null) ? p.getMethod().name() : null;
    }

    default String getLatestPaymentStatus(Order order) {
        Payment p = getLatestPayment(order);
        return (p != null && p.getStatus() != null) ? p.getStatus().name() : null;
    }

    default String mapVariantInfo(OrderItem item) {
        return Stream.of(item.getOption1Value(), item.getOption2Value(), item.getOption3Value())
                .filter(StringUtils::hasText)
                .collect(Collectors.joining(" "));
    }
}
