//package com.example.backend.utils;
//
//import org.springframework.stereotype.Component;
//
//@Component
//public class GeminiPromptBuilder {
//
//    // 1. PROMPT BÓC TÁCH Ý ĐỊNH (NHỊP 1)
//    public String buildIntentExtractionPrompt(String historyContext, String userMessage) {
//        return """
//            Bạn là CHUYÊN GIA PHÂN TÍCH NGÔN NGỮ TỰ NHIÊN của cửa hàng công nghệ.
//            Nhiệm vụ: Phân tích câu nói của khách hàng và trả về DUY NHẤT một chuỗi JSON thuần (không dùng markdown ```json).
//
//            1. PHÂN LOẠI INTENT:
//               - "SEARCH": Khách tìm mua thiết bị, hỏi giá, hỏi cấu hình.
//               - "SYSTEM": Khách hỏi chính sách (trả góp, bảo hành, ship, đổi trả).
//               - "NAVIGATION": Khách muốn xem web (đơn hàng, giỏ hàng, tài khoản, đăng nhập, quên mật khẩu).
//               - "CHAT": Chào hỏi, nói chuyện phiếm, khen chê.
//
//            2. CẤU TRÚC JSON:
//            {
//                "intent": "SEARCH" | "SYSTEM" | "NAVIGATION" | "CHAT",
//                "keyword": "Nếu SEARCH: Tên sản phẩm lõi (xóa từ rác). Nếu NAVIGATION: Phải là 1 trong các chữ [ORDER, AUTH, CART, MENU]",
//                "brandName": "Tên hãng (Apple, Samsung, Asus...) hoặc null",
//                "categoryName": "Tên danh mục (Laptop, Điện thoại...) hoặc null",
//                "minPrice": số hoặc null,
//                "maxPrice": số hoặc null
//            }
//
//            Lịch sử hội thoại:
//            %s
//
//            Câu hỏi mới nhất: "%s"
//            """.formatted(historyContext, userMessage);
//    }
//
//    // 2. PROMPT TRẢ LỜI TỰ NHIÊN (NHỊP 2)
//    public String buildSystemPrompt(String intent, String dynamicContext) {
//        return """
//            Bạn là nhân viên tư vấn công nghệ xuất sắc, thân thiện, lịch sự.
//            TUYỆT ĐỐI KHÔNG văng tục, xúc phạm khách hàng.
//
//            Ngữ cảnh hệ thống cung cấp cho bạn (Dựa trên ý định %s của khách):
//            %s
//
//            Hãy dựa CHÍNH XÁC vào ngữ cảnh trên để trả lời khách. Trả lời ngắn gọn, tự nhiên, dùng Markdown để in đậm Tên SP và Giá. Nếu có nhắc đến việc bấm vào link hoặc xem sản phẩm bên dưới, hãy nói rõ để khách chú ý.
//            """.formatted(intent, dynamicContext);
//    }
//}

package com.example.backend.utils;

import org.springframework.stereotype.Component;

@Component
public class GeminiPromptBuilder {

    // 1. RÚT GỌN TỐI ĐA PROMPT Ý ĐỊNH (Tiết kiệm ~50% Token)
    public String buildIntentExtractionPrompt(String userMessage) {
        // Đã bỏ hoàn toàn biến historyContext để không gửi lại lịch sử
        return """
            Phân tích câu hỏi và trả về DUY NHẤT JSON thuần.
            INTENT: SEARCH(mua/hỏi giá SP), SYSTEM(bảo hành/chính sách), NAVIGATION(đơn/tài khoản/giỏ/login), CHAT(chào hỏi/khác).
            JSON: {"intent": "...", "keyword": "tên SP lõi HOẶC [ORDER, AUTH, CART, MENU, BẢO HÀNH, LIÊN HỆ, SẢN PHẨM, TIN TỨC]", "brandName": null, "categoryName": null, "minPrice": null, "maxPrice": null}
            Câu hỏi: "%s"
            """.formatted(userMessage);
    }

    // 2. RÚT GỌN TỐI ĐA PROMPT TƯ VẤN (Tiết kiệm ~40% Token)
    public String buildSystemPrompt(String intent, String dynamicContext) {
        return """
            Bạn là CSKH TechStore. Tư vấn thân thiện, NGẮN GỌN dưới 4 câu. In đậm Tên SP & Giá. Báo khách bấm nút nếu có.
            Data: %s
            """.formatted(dynamicContext); // Cắt bớt phần nối chuỗi Intent không cần thiết
    }
}