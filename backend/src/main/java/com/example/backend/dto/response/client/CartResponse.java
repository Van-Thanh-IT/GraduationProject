package com.example.backend.dto.response.client;

import java.math.BigDecimal;
import java.util.List;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class CartResponse {

    private Integer cartId;

    private BigDecimal totalPrice;

    private List<CartItemResponse> items;
}
