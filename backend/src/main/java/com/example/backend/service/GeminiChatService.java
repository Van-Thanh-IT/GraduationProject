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
import tools.jackson.databind.JsonNode;
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

    public static class AiBusyException extends RuntimeException {
        public AiBusyException(String message) {
            super(message);
        }
    }

    @Transactional
    public AIChatResponse processChat(AIChatRequest request, String guestSessionKey) {
        long startTime = System.currentTimeMillis();
        log.info("BẮT ĐẦU PHIÊN CHAT MỚI | Message: [{}]", request.getMessage());

        ChatSessionAI session = getOrCreateSession(request, guestSessionKey);
        List<ChatMessageAI> history = messageRepository.findTop4BySessionOrderByCreatedAtDesc(session);
        Collections.reverse(history);
        saveMessage(session, RoleAI.USER, request.getMessage(), null);

        try {

            AiSearchCriteria criteria = extractIntent(request.getMessage(), history);

            RoutingResult routingResult = processRoutingLogic(criteria, session);

            String aiResponseText = generateFinalResponse(criteria.getIntent(), routingResult.dynamicContext(), request.getMessage(), history);

            AIChatResponse response = buildAndSaveResponse(session, aiResponseText, criteria, routingResult);

            log.info("KẾT THÚC PHIÊN CHAT | Tổng thời gian: {}ms", System.currentTimeMillis() - startTime);
            return response;

        } catch (AiBusyException e) {
            saveMessage(session, RoleAI.ASSISTANT, e.getMessage(), null);
            log.warn("Ngắt luồng sớm (Fail-fast) do AI bận. Thời gian: {}ms", System.currentTimeMillis() - startTime);

            return AIChatResponse.builder()
                    .sessionId(session.getId())
                    .role(RoleAI.ASSISTANT.name())
                    .content(e.getMessage())
                    .build();
        }
    }

    private AiSearchCriteria extractIntent(String userMessage, List<ChatMessageAI> history) {
        log.info("[BƯỚC 1] Đang phân tích Intent...");
        String intentPrompt = promptBuilder.buildIntentExtractionPrompt(userMessage);
        String intentJsonString = callGeminiApi("Intent-Extraction", intentPrompt, history, true);

        AiSearchCriteria criteria = new AiSearchCriteria();
        criteria.setIntent("CHAT"); // Default fallback

        try {
            int startIndex = intentJsonString.indexOf("{");
            int endIndex = intentJsonString.lastIndexOf("}");
            if (startIndex != -1 && endIndex != -1) {
                String cleanJson = intentJsonString.substring(startIndex, endIndex + 1);
                criteria = objectMapper.readValue(cleanJson, AiSearchCriteria.class);
            }
            if (criteria.getIntent() == null) criteria.setIntent("CHAT");

            log.info("Kết quả phân tích JSON: Intent=[{}], Keyword=[{}], Min=[{}], Max=[{}], isVague=[{}]",
                    criteria.getIntent(), criteria.getKeyword(), criteria.getMinPrice(), criteria.getMaxPrice(), criteria.getIsVague());
        } catch (Exception e) {
            log.error("LỖI PARSE JSON TỪ AI! Fallback về CHAT. Chi tiết lỗi: {}. Raw JSON: {}", e.getMessage(), intentJsonString);
        }
        return criteria;
    }

    private RoutingResult processRoutingLogic(AiSearchCriteria criteria, ChatSessionAI session) {
        log.info("[BƯỚC 2] Đang xử lý Routing Logic cho Intent: {}", criteria.getIntent());

        String dynamicContext = "";
        Object productAttachment = null;
        List<ActionItem> actions = new ArrayList<>();

        IntentType intent;
        try {
            intent = IntentType.valueOf(criteria.getIntent().toUpperCase());
        } catch (IllegalArgumentException e) {
            log.warn("Intent không hợp lệ ({}), tự động chuyển về CHAT", criteria.getIntent());
            intent = IntentType.CHAT;
        }

        boolean isLoggedIn = session.getUserId() != null;

        switch (intent) {
            case SEARCH -> {
                if (Boolean.TRUE.equals(criteria.getIsVague()) && criteria.getClarifyMessage() != null) {
                    log.info("Search bị Vague (Chung chung). AI sẽ hỏi lại khách: {}", criteria.getClarifyMessage());
                    dynamicContext = "Khách hỏi mua nhưng chưa rõ thông tin cụ thể. BẠN HÃY HỎI LẠI KHÁCH CÂU NÀY: " + criteria.getClarifyMessage();
                }
                else if (criteria.getKeyword() != null || criteria.getBrandName() != null) {
                    log.info("Chuẩn bị gọi DB ProductService. Keyword=[{}]", criteria.getKeyword());
                    AiProductResult result = productService.findBestProductContextForAI(criteria);
                    dynamicContext = result.getContextText();
                    productAttachment = result.getProductData();
                    if (productAttachment != null) {
                        log.info("DB đã tìm thấy sản phẩm đính kèm.");
                    } else {
                        log.info("DB KHÔNG tìm thấy sản phẩm nào khớp yêu cầu.");
                    }
                } else {
                    log.info("Keyword rỗng, yêu cầu AI hỏi thêm thông tin.");
                    dynamicContext = "Hãy hỏi khách hàng muốn tìm sản phẩm của thương hiệu nào ạ.";
                }
            }
            case NAVIGATION -> {
                NavType type = resolveNavType(criteria.getKeyword());
                if (type == NavType.DEFAULT && criteria.getKeyword() != null && criteria.getKeyword().equalsIgnoreCase("WARRANTY")) {
                    type = NavType.WARRANTY;
                }
                log.info("Điều hướng người dùng đến chức năng: {}", type);
                handleNavigation(type, isLoggedIn, actions);
                dynamicContext = buildNavigationContext(type, isLoggedIn);
            }
            default -> {
                log.info("Chế độ CHAT thông thường.");
                actions.add(new ActionItem("Trang chủ", "/", "LINK"));
                dynamicContext = "Hệ thống chuyển về chế độ CHAT thông thường.";
            }
        }
        return new RoutingResult(dynamicContext, productAttachment, actions);
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

    private void handleNavigation(NavType type, boolean isLoggedIn, List<ActionItem> actions) {
        switch (type) {
            case ORDER -> actions.add(new ActionItem(isLoggedIn ? "Đơn hàng của tôi" : "Đăng nhập", isLoggedIn ? "/user/orders" : "/login", "LINK"));
            case AUTH -> {
                if (isLoggedIn) {
                    actions.add(new ActionItem("Trang cá nhân", "/user/profile", "LINK"));
                    actions.add(new ActionItem("Địa chỉ", "/user/address", "LINK"));
                } else {
                    actions.add(new ActionItem("Đăng nhập", "/login", "LINK"));
                    actions.add(new ActionItem("Đăng ký", "/register", "LINK"));
                }
            }
            case CART -> actions.add(new ActionItem("Xem giỏ hàng", "/cart", "LINK"));
            case WARRANTY -> actions.add(new ActionItem("Tra cứu bảo hành", "/warranty", "LINK"));
            case PRODUCT -> actions.add(new ActionItem("Xem tất cả sản phẩm", "/products", "LINK"));
            case ABOUT -> actions.add(new ActionItem("Về chúng tôi", "/abouts", "LINK"));
            default -> actions.add(new ActionItem("Trang chủ", "/", "LINK"));
        }
    }

    private String buildNavigationContext(NavType type, boolean isLoggedIn) {
        return switch (type) {
            case ORDER -> isLoggedIn ? "Khách đã đăng nhập. Xem đơn hàng." : "Cần đăng nhập để xem đơn hàng.";
            case AUTH -> isLoggedIn ? "Quản lý tài khoản." : "Bạn chưa đăng nhập.";
            case CART -> "Giỏ hàng của bạn.";
            case WARRANTY -> "Tra cứu bảo hành sản phẩm.";
            case PRODUCT -> "Danh sách sản phẩm.";
            case ABOUT -> "Thông tin cửa hàng.";
            default -> "Trang chủ.";
        };
    }

    private String generateFinalResponse(String intent, String dynamicContext, String userMessage, List<ChatMessageAI> history) {
        log.info("[BƯỚC 3] Đang gọi AI sinh câu trả lời cuối (Final Response)...");
        String systemPrompt = promptBuilder.buildSystemPrompt(intent, dynamicContext);
        String enrichedPrompt = systemPrompt + "\n\n👤 Khách hỏi: " + userMessage;

        return callGeminiApi("Final-Response", enrichedPrompt, history, false);
    }

    private AIChatResponse buildAndSaveResponse(ChatSessionAI session, String aiResponseText, AiSearchCriteria criteria, RoutingResult routing) {
        log.info("[BƯỚC 4] Lưu lịch sử và hoàn thiện Response trả về Client.");
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

    private String callGeminiApi(String stepName, String enrichedPrompt, List<ChatMessageAI> history, boolean isJsonMode) {
        String geminiUrl = url + "?key=" + apiKey;

        Map<String, Object> requestBody = new HashMap<>();
        List<Map<String, Object>> contents = new ArrayList<>();

        for (ChatMessageAI msg : history) {
            String geminiRole = msg.getRole() == RoleAI.USER ? "user" : "model";
            contents.add(Map.of(
                    "role", geminiRole,
                    "parts", List.of(Map.of("text", msg.getContent())))
            );
        }

        contents.add(Map.of(
                "role", "user",
                "parts", List.of(Map.of("text", enrichedPrompt))));
        requestBody.put("contents", contents);

        if (isJsonMode) {
            requestBody.put("generationConfig", Map.of("responseMimeType", "application/json"));
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        int maxRetries = 2;
        int currentAttempt = 0;

        while (currentAttempt < maxRetries) {
            try {
                currentAttempt++;
                String responseJson = restTemplate.postForObject(geminiUrl, entity, String.class);
                JsonNode rootNode = objectMapper.readTree(responseJson);

                String textResponse = rootNode
                        .path("candidates").get(0)
                        .path("content")
                        .path("parts").get(0)
                        .path("text").asText();

                JsonNode usageNode = rootNode.path("usageMetadata");
                if (!usageNode.isMissingNode()) {
                    int promptTokens = usageNode.path("promptTokenCount").asInt();
                    int completionTokens = usageNode.path("candidatesTokenCount").asInt();
                    int totalTokens = usageNode.path("totalTokenCount").asInt();
                    log.info("[{}] Token Usage -> Prompt: {} | Output: {} | Total: {}", stepName, promptTokens, completionTokens, totalTokens);
                }

                return textResponse;

            } catch (org.springframework.web.client.HttpServerErrorException.ServiceUnavailable e) {
                log.warn("API Gemini quá tải (Lần {}/{}). Chờ 1s...", currentAttempt, maxRetries);
                if (currentAttempt == maxRetries) {
                    throw new AiBusyException("Xin lỗi bạn, trợ lý AI hiện đang bị quá tải kết nối. Bạn vui lòng đợi một lát rồi thử lại nhé!");
                }
                sleep(1000);
            } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
                log.warn("Bị giới hạn Rate Limit (Lần {}/{}). Chờ 1.5s...", currentAttempt, maxRetries);
                if (currentAttempt == maxRetries) {
                    throw new AiBusyException("Hệ thống đang nhận quá nhiều yêu cầu cùng lúc. Vui lòng chậm lại một chút nhé!");
                }
                sleep(1500);
            } catch (Exception e) {
                log.error("Lỗi nghiêm trọng khi gọi API Gemini tại {}: {}", stepName, e.getMessage());
                throw new AiBusyException("Xin lỗi, hệ thống AI đang bảo trì. Vui lòng thử lại sau.");
            }
        }
        throw new AiBusyException("Xin lỗi, hệ thống đang bận. Vui lòng thử lại.");
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException ie) {
            Thread.currentThread().interrupt();
        }
    }
}