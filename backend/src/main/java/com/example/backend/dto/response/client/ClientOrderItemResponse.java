package com.example.backend.dto.response.client;

import lombok.Builder;
import lombok.Data;
import java.math.BigDecimal;

@Data
@Builder
public class ClientOrderItemResponse {
    private Integer productId;
    private String slug;
    private Integer variantId;
    private String productName;
    private String variantInfo;
    private String thumbnail;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal totalPrice;

}