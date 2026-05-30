package com.example.backend.service;

import java.util.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import com.example.backend.dto.request.AIChatRequest;
import com.example.backend.dto.request.AiSearchCriteria;
import com.example.backend.dto.response.client.AIChatResponse;
import com.example.backend.dto.response.client.ActionItem;
import com.example.backend.dto.response.client.AiProductResult;
import com.example.backend.entity.ChatMessageAI;
import com.example.backend.entity.ChatSessionAI;
import com.example.backend.enums.IntentType;
import com.example.backend.enums.NavType;
import com.example.backend.enums.RoleAI;
import com.example.backend.repository.ChatMessageAIRepository;
import com.example.backend.repository.ChatSessionAIRepository;
import com.example.backend.utils.GeminiPromptBuilder;
import com.example.backend.utils.SecurityUtils;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiChatService {

    private static final Map<NavType, List<String>> KEYWORD_MAP = Map.of(
            NavType.ORDER, List.of("ORDER", "ĐƠN", "LỊCH SỬ"),
            NavType.CART, List.of("CART", "GIỎ"),
            NavType.AUTH, List.of("TÀI KHOẢN", "PASS", "ĐĂNG", "LOGIN"),
            NavType.WARRANTY, List.of("BẢO HÀNH", "TRA CỨU", "IMEI", "SERI", "SERI SẢN PHẨM", "BẢO HÀNH SẢN PHẨM"),
            NavType.CONTACT, List.of("LIÊN HỆ", "HOTLINE", "CONTACT"),
            NavType.PRODUCT, List.of("SẢN PHẨM", "DANH MỤC", "MUA HÀNG", "TẤT CẢ"),
            NavType.ABOUT, List.of("GIỚI THIỆU", "TIN TỨC", "BLOG")
    );

    private final ChatSessionAIRepository sessionRepository;
    private final ChatMessageAIRepository messageRepository;
    private final ProductService productService;
    private final ObjectMapper objectMapper;
    private final RestTemplate restTemplate;
    private final GeminiPromptBuilder promptBuilder;

    @Value("${spring.gemini.api-key}")
    private String apiKey;

    @Value("${spring.gemini.url}")
    private String url;

    private record RoutingResult(String dynamicContext, Object productAttachment, List<ActionItem> actions) {}

    @Transactional
    public AIChatResponse processChat(AIChatRequest request, String guestSessionKey) {
        ChatSessionAI session = getOrCreateSession(request, guestSessionKey);
        List<ChatMessageAI> history = messageRepository.findTop6BySessionOrderByCreatedAtDesc(session);
        Collections.reverse(history);
        saveMessage(session, RoleAI.USER, request.getMessage(), null);

        AiSearchCriteria criteria = extractIntent(request.getMessage());

        RoutingResult routingResult = processRoutingLogic(criteria, session);

        String aiResponseText = generateFinalResponse(criteria.getIntent(), routingResult.dynamicContext(), request.getMessage(), history);

        return buildAndSaveResponse(session, aiResponseText, criteria, routingResult);
    }


    private AiSearchCriteria extractIntent(String userMessage) {
        String intentPrompt = promptBuilder.buildIntentExtractionPrompt(userMessage);

        String intentJsonString = callGeminiApi(intentPrompt, Collections.emptyList());

        AiSearchCriteria criteria = new AiSearchCriteria();
        criteria.setIntent("CHAT"); // Fallback mặc định

        try {
            int startIndex = intentJsonString.indexOf("{");
            int endIndex = intentJsonString.lastIndexOf("}");
            if (startIndex != -1 && endIndex != -1) {
                String cleanJson = intentJsonString.substring(startIndex, endIndex + 1);
                criteria = objectMapper.readValue(cleanJson, AiSearchCriteria.class);
            }
            if (criteria.getIntent() == null) criteria.setIntent("CHAT");
            log.info("AI Intent Detected: {}", criteria.getIntent());
        } catch (Exception e) {
            log.error("Lỗi parse JSON Intent. Fallback về CHAT. Raw: {}", intentJsonString);
        }
        return criteria;
    }

    private RoutingResult processRoutingLogic(AiSearchCriteria criteria, ChatSessionAI session) {
        String dynamicContext = "";
        Object productAttachment = null;
        List<ActionItem> actions = new ArrayList<>();

        IntentType intent = IntentType.valueOf(criteria.getIntent().toUpperCase());
        boolean isLoggedIn = session.getUserId() != null;

        switch (intent) {
            case SEARCH -> {
                if (criteria.getKeyword() != null || criteria.getBrandName() != null || criteria.getCategoryName() != null) {
                    AiProductResult result = productService.findBestProductContextForAI(criteria);
                    dynamicContext = result.getContextText();
                    productAttachment = result.getProductData();
                } else {
                    dynamicContext = "Khách muốn tìm mua nhưng chưa rõ loại nào. Hãy hỏi thêm để làm rõ.";
                }
            }
            case NAVIGATION -> {
                NavType type = resolveNavType(criteria.getKeyword());
                handleNavigation(type, isLoggedIn, actions);
                if (type == NavType.DEFAULT && criteria.getIntent().equalsIgnoreCase("WARRANTY")) {
                    type = NavType.WARRANTY;
                }
                dynamicContext = buildNavigationContext(type, isLoggedIn);
            }
            default -> {
                actions.add(new ActionItem("Trang chủ", "/", "LINK"));
                dynamicContext = "Hệ thống chuyển về chế độ CHAT thông thường.";
            }
        }
        return new RoutingResult(dynamicContext, productAttachment, actions);
    }

    private void handleNavigation(NavType type, boolean isLoggedIn, List<ActionItem> actions) {
        switch (type) {
            case ORDER -> {
                if (isLoggedIn) actions.add(new ActionItem("Đơn hàng của tôi", "/user/orders", "LINK"));
                else actions.add(new ActionItem("Đăng nhập", "/login", "LINK"));
            }
            case AUTH -> {
                if (isLoggedIn) {
                    actions.add(new ActionItem("Trang cá nhân", "/user/profile", "LINK"));
                    actions.add(new ActionItem("Địa chỉ", "/user/address", "LINK"));
                } else {
                    actions.add(new ActionItem("Đăng nhập", "/login", "LINK"));
                    actions.add(new ActionItem("Đăng ký", "/register", "LINK"));
                    actions.add(new ActionItem("Quên mật khẩu", "/forgot-password", "LINK"));
                }
            }
            case CART -> actions.add(new ActionItem("Xem giỏ hàng", "/cart", "LINK"));
            case WARRANTY -> actions.add(new ActionItem("Tra cứu bảo hành", "/warranty", "LINK"));
            case PRODUCT -> actions.add(new ActionItem("Xem tất cả sản phẩm", "/products", "LINK"));
            case ABOUT -> {
                actions.add(new ActionItem("Về chúng tôi", "/abouts", "LINK"));
                actions.add(new ActionItem("Tin tức công nghệ", "/abouts", "LINK"));
            }
            default -> actions.add(new ActionItem("Trang chủ", "/", "LINK"));
        }
    }

    private String buildNavigationContext(NavType type, boolean isLoggedIn) {
        return switch (type) {
            case ORDER -> isLoggedIn ? "Khách đã đăng nhập. Xem đơn hàng." : "Cần đăng nhập để xem đơn hàng.";
            case AUTH -> isLoggedIn ? "Quản lý tài khoản." : "Bạn chưa đăng nhập.";
            case CART -> "Giỏ hàng của bạn.";
            case WARRANTY -> "Tra cứu bảo hành sản phẩm.";
            case CONTACT -> "Thông tin liên hệ.";
            case PRODUCT -> "Danh sách sản phẩm.";
            case ABOUT -> "Thông tin cửa hàng.";
            default -> "Trang chủ.";
        };
    }

    private String generateFinalResponse(String intent, String dynamicContext, String userMessage, List<ChatMessageAI> history) {
        String systemPrompt = promptBuilder.buildSystemPrompt(intent, dynamicContext);
        String enrichedPrompt = systemPrompt + "\n\n👤 Khách hỏi: " + userMessage;
        return callGeminiApi(enrichedPrompt, history);
    }

    private AIChatResponse buildAndSaveResponse(ChatSessionAI session, String aiResponseText, AiSearchCriteria criteria, RoutingResult routing) {
        Map<String, Object> meta = new HashMap<>();
        meta.put("intent", criteria.getIntent());
        if (routing.productAttachment() != null) meta.put("attachment", routing.productAttachment());
        if (!routing.actions().isEmpty()) meta.put("actions", routing.actions());

        saveMessage(session, RoleAI.ASSISTANT, aiResponseText, meta);

        return AIChatResponse.builder()
                .sessionId(session.getId())
                .role(RoleAI.ASSISTANT.name())
                .content(aiResponseText)
                .attachment(routing.productAttachment())
                .actions(routing.actions().isEmpty() ? null : routing.actions())
                .build();
    }

    private NavType resolveNavType(String rawKey) {
        if (rawKey == null || rawKey.isBlank()) return NavType.DEFAULT;
        String key = rawKey.toUpperCase().trim();

        try {
            return NavType.valueOf(key);
        } catch (IllegalArgumentException e) {
            return KEYWORD_MAP.entrySet().stream()
                    .filter(entry -> entry.getValue().stream().anyMatch(val -> key.contains(val) || val.contains(key)))
                    .map(Map.Entry::getKey)
                    .findFirst()
                    .orElse(NavType.DEFAULT);
        }
    }


    private ChatSessionAI getOrCreateSession(AIChatRequest request, String guestSessionKey) {
        if (request.getSessionId() != null) {
            return sessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new RuntimeException("Phiên chat không tồn tại trong hệ thống!"));
        }
        Integer userId = SecurityUtils.getCurrentUserId();
        ChatSessionAI newSession = ChatSessionAI.builder()
                .userId(userId)
                .sessionKey(userId == null ? guestSessionKey : null)
                .contextType(request.getContextType() != null ? request.getContextType() : "GENERAL")
                .contextId(request.getContextId())
                .title("Chat hỗ trợ tự động")
                .build();
        return sessionRepository.save(newSession);
    }

    private void saveMessage(ChatSessionAI session, RoleAI role, String content, Map<String, Object> meta) {
        messageRepository.save(ChatMessageAI.builder()
                .session(session).role(role).content(content).metadata(meta).build());
    }

    private String callGeminiApi(String enrichedPrompt, List<ChatMessageAI> history) {
        try {
            String geminiUrl = url + "?key=" + apiKey;

            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();

            for (ChatMessageAI msg : history) {
                String geminiRole = msg.getRole() == RoleAI.USER ? "user" : "model";
                contents.add(Map.of("role", geminiRole, "parts", List.of(Map.of("text", msg.getContent()))));
            }

            contents.add(Map.of("role", "user", "parts", List.of(Map.of("text", enrichedPrompt))));
            requestBody.put("contents", contents);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            String responseJson = restTemplate.postForObject(geminiUrl, entity, String.class);
            return objectMapper.readTree(responseJson)
                    .path("candidates").get(0)
                    .path("content")
                    .path("parts")
                    .get(0).path("text")
                    .asText();

        } catch (Exception e) {
            log.error("Lỗi khi gọi API Gemini: ", e);
            return "Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.";
        }
    }
}