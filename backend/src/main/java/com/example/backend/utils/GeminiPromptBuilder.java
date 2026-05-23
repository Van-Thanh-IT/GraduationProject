package com.example.backend.utils;

import org.springframework.stereotype.Component;

@Component
public class GeminiPromptBuilder {

	public String buildIntentExtractionPrompt(String message) {
		return """
        Bạn là hệ thống phân tích intent.

        NHIỆM VỤ:
        - Chỉ trả về JSON hợp lệ, KHÔNG giải thích
        - Không thêm text ngoài JSON
        - Nếu không chắc → chọn intent gần nhất

        INTENT:
        - SEARCH: hỏi/mua sản phẩm
        - SYSTEM: chính sách, bảo hành
        - NAVIGATION: đơn hàng, tài khoản, giỏ hàng, đăng nhập
        - CHAT: chào hỏi, nói chuyện chung

        FORMAT JSON:
        {
          "intent": "...",
          "keyword": "...",
          "brandName": null,
          "categoryName": null,
          "minPrice": null,
          "maxPrice": null
        }

        QUY TẮC:
        - keyword = tên sản phẩm hoặc 1 trong: ORDER, AUTH, CART, MENU, BAO_HANH, LIEN_HE, SAN_PHAM, TIN_TUC
        - Không được trả thêm field

        CÂU HỎI:
        "%s"
        """.formatted(message);
	}

    public String buildSystemPrompt(String intent, String dynamicContext) {
        return """

			Bạn là CSKH TechStore. Tư vấn thân thiện, NGẮN GỌN dưới 4 câu. In đậm Tên SP & Giá. Báo khách bấm nút nếu có.
			Intent: %s
			Data: %s
			"""
                .formatted(intent, dynamicContext);
    }
}
