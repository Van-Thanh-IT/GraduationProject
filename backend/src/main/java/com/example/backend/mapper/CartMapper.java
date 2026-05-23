package com.example.backend.mapper;

import java.math.BigDecimal;
import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.example.backend.dto.response.client.CartItemResponse;
import com.example.backend.dto.response.client.CartResponse;
import com.example.backend.entity.Cart;
import com.example.backend.entity.CartItem;
import com.example.backend.entity.ProductVariant;

@Mapper(
        componentModel = "spring",
        imports = {BigDecimal.class})
public interface CartMapper {

    @Mapping(target = "cartId", source = "id")
    @Mapping(target = "totalPrice", expression = "java(calculateTotalPrice(cart.getItems()))")
    CartResponse toResponse(Cart cart);

    @Mapping(target = "itemId", source = "id")
    @Mapping(target = "variantId", source = "productVariant.id")
    @Mapping(target = "productName", source = "productVariant.product.name")
    @Mapping(target = "imageUrl", source = "productVariant.product.thumbnail")
    @Mapping(target = "price", source = "productVariant.price")
    @Mapping(target = "options", expression = "java(formatOptions(item.getProductVariant()))")
    @Mapping(
            target = "subTotal",
            expression = "java(item.getProductVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))")
    @Mapping(target = "maxStock", source = "productVariant.stockQuantity")
    CartItemResponse toItemResponse(CartItem item);

    default BigDecimal calculateTotalPrice(List<CartItem> items) {
        if (items == null || items.isEmpty()) return BigDecimal.ZERO;
        return items.stream()
                .map(item -> item.getProductVariant().getPrice().multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    default String formatOptions(ProductVariant variant) {
        if (variant == null) return "";
        String opt1 = variant.getOption1Value() != null ? variant.getOption1Value() : "";
        String opt2 = variant.getOption2Value() != null ? variant.getOption2Value() : "";
        return (opt1 + " " + opt2).trim();
    }
}
