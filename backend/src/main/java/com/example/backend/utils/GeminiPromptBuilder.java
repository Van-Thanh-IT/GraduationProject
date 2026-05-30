//package com.example.backend.utils;
//
//import org.springframework.stereotype.Component;
//
//@Component
//public class GeminiPromptBuilder {
//
//	public String buildIntentExtractionPrompt(String message) {
//		return """
//        Bạn là hệ thống phân tích intent.
//
//        NHIỆM VỤ:
//        - Chỉ trả về JSON hợp lệ, KHÔNG giải thích
//        - Không thêm text ngoài JSON
//        - Nếu không chắc → chọn intent gần nhất
//
//        INTENT:
//        - SEARCH: hỏi/mua sản phẩm
//        - SYSTEM: chính sách, bảo hành
//        - NAVIGATION: đơn hàng, tài khoản, giỏ hàng, đăng nhập
//        - CHAT: chào hỏi, nói chuyện chung
//
//        FORMAT JSON:
//        {
//          "intent": "...",
//          "keyword": "...",
//          "brandName": null,
//          "categoryName": null,
//          "minPrice": null,
//          "maxPrice": null
//        }
//
//        QUY TẮC:
//        - keyword = tên sản phẩm hoặc 1 trong: ORDER, AUTH, CART, MENU, BAO_HANH, LIEN_HE, SAN_PHAM, TIN_TUC
//        - Không được trả thêm field
//
//        CÂU HỎI:
//        "%s"
//        """.formatted(message);
//	}
//
//    public String buildSystemPrompt(String intent, String dynamicContext) {
//        return """
//
//			Bạn là CSKH TechStore. Tư vấn thân thiện, NGẮN GỌN dưới 4 câu. In đậm Tên SP & Giá. Báo khách bấm nút nếu có.
//			Intent: %s
//			Data: %s
//			"""
//                .formatted(intent, dynamicContext);
//    }
//}
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
       
       QUY TẮC TẠO KEYWORD CHO INTENT 'NAVIGATION':
        - Hỏi về đơn hàng, lịch sử mua -> "ORDER"
        - Hỏi về giỏ hàng, xem giỏ -> "CART"
        - Hỏi về tài khoản, đăng nhập, quên mật khẩu -> "AUTH"
        - Hỏi về bảo hành, tra cứu, IMEI, Seri -> "WARRANTY"
        - Hỏi về liên hệ, hotline -> "CONTACT"

        FORMAT JSON:
        {
          "intent": "...",
          "keyword": "...",
          "brandName": null,
          "categoryName": null,
          "minPrice": null,
          "maxPrice": null
        }

        CÂU HỎI:
        "%s"
        """.formatted(message);
	}

	public String buildSystemPrompt(String intent, String dynamicContext) {
		return """

			Bạn là CSKH TechStore. Tư vấn thân thiện, NGẮN GỌN dưới 4 câu. In đậm Tên SP & Giá. Báo khách bấm nút nếu có.
			Intent: %s
			Data: %s
			
			HƯỚNG DẪN TRẢ LỜI QUAN TRỌNG:
			1. Nếu khách cần Tra cứu bảo hành, Xem đơn hàng, Xem giỏ hàng, Đăng nhập: Hệ thống ĐÃ hiển thị sẵn các nút chức năng ở dưới màn hình.
			2. Bạn CHỈ CẦN nói một câu thân thiện mời khách bấm nút (Ví dụ: "Dạ, để tra cứu bảo hành, bạn vui lòng bấm vào nút 'Tra cứu bảo hành' ở ngay bên dưới giúp mình nhé!").
			3. TUYỆT ĐỐI KHÔNG tự tạo ra các link (đường dẫn HTTP) trong câu trả lời.
			4. In đậm **Tên Sản Phẩm** và **Giá** (nếu có).
			"""
				.formatted(intent, dynamicContext);
	}
}
