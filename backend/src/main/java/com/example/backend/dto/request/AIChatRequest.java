package com.example.backend.dto.request;

import lombok.Data;
import java.util.UUID;

@Data
public class AIChatRequest {
    // Nếu chat lần đầu, sessionId sẽ là null. Frontend tự sinh hoặc backend cấp.
    private UUID sessionId;

    private String message;

    // PRODUCT, ORDER, hoặc GENERAL
    private String contextType;

    // ID của Sản phẩm hoặc Đơn hàng (nếu có)
    private Integer contextId;
}