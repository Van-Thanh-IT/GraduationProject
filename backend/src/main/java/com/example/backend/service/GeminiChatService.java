package com.example.backend.service;

import com.example.backend.dto.request.AIChatRequest;
import com.example.backend.dto.request.AiSearchCriteria;
import com.example.backend.dto.response.AIChatResponse;
import com.example.backend.dto.response.ActionItem;
import com.example.backend.dto.response.AiProductResult;
import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;
import com.example.backend.enums.RoleAI;
import com.example.backend.repository.ChatMessageAIRepository;
import com.example.backend.repository.ChatSessionAIRepository;
import com.example.backend.repository.OrderRepository;
import com.example.backend.repository.ProductRepository;
import com.example.backend.utils.GeminiPromptBuilder;
import com.example.backend.utils.SecurityUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiChatService {

    private final ChatSessionAIRepository sessionRepository;
    private final ChatMessageAIRepository messageRepository;
    private final ProductRepository productRepository;
    private final ProductService productService;
    private final OrderRepository orderRepository;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final GeminiPromptBuilder promptBuilder;

    @Value("${spring.gemini.api-key}")
    private String apiKey;

    @Value("${spring.gemini.url}")
    private String url;

    @Transactional
    public AIChatResponse processChat(AIChatRequest request, String guestSessionKey) {
        ChatSessionAI session = getOrCreateSession(request, guestSessionKey);
        List<ChatMessageAI> history = messageRepository.findTop2BySessionOrderByCreatedAtDesc(session);
        Collections.reverse(history);

        saveMessage(session, RoleAI.USER, request.getMessage(), null);

        // ==========================================
        // NHỊP 1: TRÍCH XUẤT INTENT (CÓ LỊCH SỬ)
        // ==========================================
        StringBuilder historyCtx = new StringBuilder();
        for (ChatMessageAI msg : history) {
            historyCtx.append(msg.getRole()).append(": ").append(msg.getContent()).append("\n");
        }

//        String intentPrompt = promptBuilder.buildIntentExtractionPrompt(historyCtx.toString(), request.getMessage());
//        String intentJsonString = callGeminiApi(intentPrompt, new ArrayList<>());
        // Gọi hàm Prompt nén (chỉ truyền đúng câu hỏi của khách)
        String intentPrompt = promptBuilder.buildIntentExtractionPrompt(request.getMessage());
        // Gọi AI với List rỗng (Không gửi lịch sử)
        String intentJsonString = callGeminiApi(intentPrompt, new ArrayList<>());

        AiSearchCriteria criteria = new AiSearchCriteria();
        criteria.setIntent("CHAT"); // Mặc định nếu lỗi

        try {
            intentJsonString = intentJsonString.replaceAll("```json", "").replaceAll("```", "").trim();
            criteria = objectMapper.readValue(intentJsonString, AiSearchCriteria.class);
            if(criteria.getIntent() == null) criteria.setIntent("CHAT");
            log.info("AI Intent Detected: {}", criteria.getIntent());
        } catch (Exception e) {
            log.warn("Lỗi parse JSON Intent, fallback về CHAT");
        }

        // ==========================================
        // NHỊP 2: ĐỊNH TUYẾN THEO INTENT
        // ==========================================
        String dynamicContext = "";
        Object productAttachment = null;
        List<ActionItem> actions = new ArrayList<>();

        switch (criteria.getIntent().toUpperCase()) {
            case "SEARCH":
                if (criteria.getKeyword() != null || criteria.getBrandName() != null || criteria.getCategoryName() != null) {
                    AiProductResult result = productService.findBestProductContextForAI(criteria);
                    dynamicContext = result.getContextText();
                    productAttachment = result.getProductData();
                } else {
                    dynamicContext = "Khách muốn tìm mua nhưng chưa rõ loại nào. Hãy hỏi thêm.";
                }
                break;

            case "NAVIGATION":
                boolean isLoggedIn = session.getUserId() != null;
                String key = criteria.getKeyword() != null ? criteria.getKeyword().toUpperCase() : "MENU";

                if (key.contains("ORDER") || key.contains("ĐƠN")) {
                    if (isLoggedIn) {
                        actions.add(new ActionItem("Đơn hàng của tôi", "/user/orders", "LINK"));
                        dynamicContext = "Khách đã đăng nhập. Báo khách bấm nút xem đơn hàng bên dưới.";
                    } else {
                        actions.add(new ActionItem("Đăng nhập", "/login", "LINK"));
                        dynamicContext = "Khách CHƯA đăng nhập. Hãy thông báo lịch sự rằng khách cần đăng nhập để xem lịch sử mua hàng, hoặc có thể dùng nút Tra cứu mã vận đơn bên dưới.";
                    }
                }
                else if (key.contains("AUTH") || key.contains("TÀI KHOẢN") || key.contains("ĐĂNG") || key.contains("PASS") || key.contains("MẬT KHẨU")) {
                    if (isLoggedIn) {
                        actions.add(new ActionItem("Trang cá nhân", "/user/profile", "LINK"));
                        actions.add(new ActionItem("Địa chỉ", "/user/address", "LINK"));
                        dynamicContext = "Khách đã đăng nhập. Hướng dẫn khách bấm nút bên dưới để vào trang cá nhân hoặc đổi mật khẩu.";
                    } else {
                        actions.add(new ActionItem("Đăng nhập", "/login", "LINK"));
                        actions.add(new ActionItem("Đăng ký", "/register", "LINK"));
                        actions.add(new ActionItem("Quên mật khẩu", "/forgot-password", "LINK"));
                        dynamicContext = "Khách chưa đăng nhập. Hướng dẫn khách sử dụng các nút Đăng nhập, Đăng ký hoặc Quên mật khẩu bên dưới.";
                    }
                }
                else if (key.contains("CART") || key.contains("GIỎ")) {
                    actions.add(new ActionItem("Xem giỏ hàng", "/cart", "LINK"));
                    dynamicContext = "Link giỏ hàng đã có. Mời khách bấm nút.";
                }
                // =============================================================
                // CÁC ACTION MỚI ĐƯỢC THÊM VÀO DỰA THEO MENU HEADER CỦA REACT
                // =============================================================
                else if (key.contains("BẢO HÀNH") || key.contains("WARRANTY") || key.contains("TRA CỨU")) {
                    actions.add(new ActionItem("Tra cứu bảo hành", "/warranty", "LINK"));
                    dynamicContext = "Đã đính kèm nút Tra cứu bảo hành. Mời khách bấm nút bên dưới để nhập mã đơn hoặc SĐT kiểm tra bảo hành.";
                }
                else if (key.contains("LIÊN HỆ") || key.contains("HOTLINE") || key.contains("ĐỊA CHỈ") || key.contains("CONTACT")) {
                    actions.add(new ActionItem("Liên hệ cửa hàng", "/contact", "LINK"));
                    dynamicContext = "Đã đính kèm link Liên hệ. Mời khách bấm nút để xem bản đồ cửa hàng, số hotline và email hỗ trợ.";
                }
                else if (key.contains("SẢN PHẨM") || key.contains("DANH MỤC") || key.contains("TẤT CẢ") || key.contains("MUA HÀNG")) {
                    actions.add(new ActionItem("Xem tất cả sản phẩm", "/products", "LINK"));
                    dynamicContext = "Mời khách bấm nút để vào trang danh mục tổng hợp và sử dụng bộ lọc tìm kiếm sản phẩm.";
                }
                else if (key.contains("GIỚI THIỆU") || key.contains("TIN TỨC") || key.contains("BLOG") || key.contains("ABOUT")) {
                    actions.add(new ActionItem("Về chúng tôi", "/abouts", "LINK"));
                    actions.add(new ActionItem("Tin tức công nghệ", "/abouts", "LINK")); // Đang trỏ tạm về /abouts theo Header của bạn
                    dynamicContext = "Mời khách bấm nút để xem lịch sử hình thành cửa hàng hoặc đọc tin tức mới nhất.";
                }
                // =============================================================
                else {
                    actions.add(new ActionItem("Trang chủ", "/", "LINK"));
                    dynamicContext = "Mời khách bấm nút về Trang chủ.";
                }
                break;
        }

        // ==========================================
        // NHỊP 3: AI SINH CÂU TRẢ LỜI TỰ NHIÊN
        // ==========================================
        String systemPrompt = promptBuilder.buildSystemPrompt(criteria.getIntent(), dynamicContext);
        String enrichedPrompt = systemPrompt + "\n\n👤 Khách hỏi: " + request.getMessage();

        String aiResponseText = callGeminiApi(enrichedPrompt, history);

        // ==========================================
        // LƯU DB (METADATA) & TRẢ VỀ FRONTEND
        // ==========================================
        Map<String, Object> meta = new HashMap<>();
        meta.put("intent", criteria.getIntent());
        if (productAttachment != null) meta.put("attachment", productAttachment);
        if (!actions.isEmpty()) meta.put("actions", actions);

        saveMessage(session, RoleAI.ASSISTANT, aiResponseText, meta);

        return AIChatResponse.builder()
                .sessionId(session.getId())
                .role(RoleAI.ASSISTANT.name())
                .content(aiResponseText)
                .attachment(productAttachment)
                .actions(actions.isEmpty() ? null : actions)
                .build();
    }

    // Nhận guestSessionKey để lưu vào DB nếu là tạo mới
    private ChatSessionAI getOrCreateSession(AIChatRequest request, String guestSessionKey) {
        if (request.getSessionId() != null) {
            return sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Session không tồn tại"));
        }

        Integer userId = null;
        try { userId = SecurityUtils.getCurrentUserId(); } catch (Exception e) {}

        ChatSessionAI newSession = ChatSessionAI.builder()
                .userId(userId)
                .sessionKey(userId == null ? guestSessionKey : null)
                .contextType(request.getContextType() != null ? request.getContextType() : "GENERAL")
                .contextId(request.getContextId())
                .title("Chat hỗ trợ tự động")
                .build();
        return sessionRepository.save(newSession);
    }

    private Object fetchContextData(ChatSessionAI session) {
        if (session.getContextId() == null) return "Không có dữ liệu ngữ cảnh.";
        if ("PRODUCT".equalsIgnoreCase(session.getContextType())) {
            return productRepository.findById(session.getContextId()).orElse(null);
        } else if ("ORDER".equalsIgnoreCase(session.getContextType())) {
            return orderRepository.findById(session.getContextId()).orElse(null);
        }
        return "Cửa hàng E-commerce";
    }

    private String serializeContext(Object context) {
        try {
            return context != null ? objectMapper.writeValueAsString(context) : "Trống";
        } catch (Exception e) {
            return "Trống";
        }
    }

    private void saveMessage(ChatSessionAI session, RoleAI role, String content, Map<String, Object> meta) {
        ChatMessageAI message = ChatMessageAI.builder()
                .session(session)
                .role(role)
                .content(content)
                .metadata(meta)
                .build();
        messageRepository.save(message);
    }

    // ==========================================
    // GIAO TIẾP VỚI GOOGLE GEMINI API
    // ==========================================
    private String callGeminiApi(String enrichedPrompt, List<ChatMessageAI> history) {
        try {
            String geminiUrl = url + apiKey;

            // 1. Chuẩn bị payload JSON theo format của Gemini
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();

            // Đưa lịch sử vào để AI nhớ ngữ cảnh
            for (ChatMessageAI msg : history) {
                // Gemini dùng role "user" và "model"
                String geminiRole = msg.getRole() == RoleAI.USER ? "user" : "model";
                contents.add(Map.of(
                        "role", geminiRole,
                        "parts", List.of(Map.of("text", msg.getContent()))
                ));
            }

            // Đưa câu hỏi mới nhất (đã kèm data DB) vào cuối cùng
            contents.add(Map.of(
                    "role", "user",
                    "parts", List.of(Map.of("text", enrichedPrompt))
            ));

            requestBody.put("contents", contents);

            // 2. Set Headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            // 3. Gọi HTTP POST
            String responseJson = restTemplate.postForObject(geminiUrl, entity, String.class);

            // 4. Parse kết quả trả về
            JsonNode root = objectMapper.readTree(responseJson);
            return root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        } catch (Exception e) {
            log.error("Lỗi khi gọi API Gemini: ", e);
            return "Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.";
        }
    }
}