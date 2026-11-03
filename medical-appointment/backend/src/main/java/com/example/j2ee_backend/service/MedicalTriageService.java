package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.SpecialtyRecommendationDTO;
import com.example.j2ee_backend.dto.TriageConsultRequestDTO;
import com.example.j2ee_backend.dto.TriageConsultResponseDTO;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.*;

@Service
public class MedicalTriageService {

    private static final Logger log = LoggerFactory.getLogger(MedicalTriageService.class);

    private final DoctorService doctorService;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Value("${spring.ai.openai.api-key:}")
    private String openrouterApiKey;

    @Value("${spring.ai.openai.chat.options.model:google/gemma-4-26b-a4b-it:free}")
    private String primaryModel;

    private String rawCrmJson = "";
    private JsonNode crmRootNode = null;

    public MedicalTriageService(DoctorService doctorService, ChatModel chatModel, ObjectMapper objectMapper) {
        this.doctorService = doctorService;
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
    }

    @PostConstruct
    public void init() {
        try {
            ClassPathResource resource = new ClassPathResource("data/medical_specialty_crm_rules.json");
            try (InputStream is = resource.getInputStream()) {
                this.rawCrmJson = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                this.crmRootNode = objectMapper.readTree(this.rawCrmJson);
                log.info("Loaded Medical Specialty CRM Rules successfully. Total specialties: {}",
                        crmRootNode.has("specialties") ? crmRootNode.get("specialties").size() : 0);
            }
        } catch (Exception e) {
            log.error("Failed to load medical_specialty_crm_rules.json: {}", e.getMessage(), e);
        }
    }

    public String getCrmRulesRawJson() {
        return this.rawCrmJson;
    }

    public TriageConsultResponseDTO triageConsult(TriageConsultRequestDTO request) {
        String userMessage = request.getMessage() == null ? "" : request.getMessage().trim();
        String lowerMessage = userMessage.toLowerCase();

        // 1. Phân tích từ khóa thông qua CRM Rules
        List<MatchedSpecialtyScore> scoredList = new ArrayList<>();
        List<String> matchedKeywordsTotal = new ArrayList<>();
        boolean isEmergency = false;
        String emergencyReason = null;

        if (crmRootNode != null && crmRootNode.has("specialties")) {
            for (JsonNode specNode : crmRootNode.get("specialties")) {
                int id = specNode.path("id").asInt();
                String name = specNode.path("specialtyName").asText();
                String code = specNode.path("departmentCode").asText();
                String description = specNode.path("description").asText();
                String analysisTemplate = specNode.path("analysisTemplate").asText();

                int matchCount = 0;
                List<String> matchedWords = new ArrayList<>();

                // Kiểm tra keywords
                if (specNode.has("keywords")) {
                    for (JsonNode kw : specNode.get("keywords")) {
                        String word = kw.asText().toLowerCase();
                        if (lowerMessage.contains(word)) {
                            matchCount++;
                            matchedWords.add(kw.asText());
                            if (!matchedKeywordsTotal.contains(kw.asText())) {
                                matchedKeywordsTotal.add(kw.asText());
                            }
                        }
                    }
                }

                // Kiểm tra aliases
                if (specNode.has("aliases")) {
                    for (JsonNode al : specNode.get("aliases")) {
                        String alias = al.asText().toLowerCase();
                        if (lowerMessage.contains(alias)) {
                            matchCount += 2;
                        }
                    }
                }

                // Kiểm tra dấu hiệu cấp cứu
                if (specNode.has("emergencyWarningKeywords")) {
                    for (JsonNode em : specNode.get("emergencyWarningKeywords")) {
                        String emWord = em.asText().toLowerCase();
                        if (lowerMessage.contains(emWord)) {
                            isEmergency = true;
                            emergencyReason = em.asText();
                        }
                    }
                }

                List<String> actionSteps = new ArrayList<>();
                if (specNode.has("standardHandlingDirections")) {
                    for (JsonNode dir : specNode.get("standardHandlingDirections")) {
                        actionSteps.add(dir.asText());
                    }
                }

                List<String> screeningQuestions = new ArrayList<>();
                if (specNode.has("screeningQuestions")) {
                    for (JsonNode sq : specNode.get("screeningQuestions")) {
                        screeningQuestions.add(sq.asText());
                    }
                }

                if (matchCount > 0) {
                    int score = Math.min(98, 65 + (matchCount * 10));
                    scoredList.add(new MatchedSpecialtyScore(id, name, code, score, matchCount, matchedWords,
                            description, analysisTemplate, actionSteps, screeningQuestions));
                }
            }
        }

        // Sắp xếp chuyên khoa theo điểm phù hợp giảm dần
        scoredList.sort((a, b) -> Integer.compare(b.score, a.score));

        // Trường hợp không có từ khóa khớp cụ thể -> Mặc định gợi ý Nội khoa
        if (scoredList.isEmpty()) {
            MatchedSpecialtyScore defaultScore = getDefaultSpecialty();
            scoredList.add(defaultScore);
        }

        MatchedSpecialtyScore primaryMatch = scoredList.get(0);

        // Chuẩn bị danh sách chuyên khoa đề xuất
        List<SpecialtyRecommendationDTO> recommendedSpecialties = new ArrayList<>();
        for (int i = 0; i < Math.min(2, scoredList.size()); i++) {
            MatchedSpecialtyScore m = scoredList.get(i);
            String reason;
            if (m.matchedWords.isEmpty()) {
                reason = "Dựa trên mô tả triệu chứng, chuyên khoa " + m.name + " là lựa chọn phù hợp nhất để bác sĩ thăm khám và kiểm tra sức khỏe tổng quát.";
            } else {
                reason = "Các triệu chứng nhận diện (" + String.join(", ", m.matchedWords) +
                        ") phù hợp nhất với phạm vi chẩn đoán và điều trị của Chuyên khoa " + m.name + ".";
            }
            recommendedSpecialties.add(new SpecialtyRecommendationDTO(m.id, m.name, m.code, m.score, reason));
        }

        // Lấy danh sách bác sĩ thuộc chuyên khoa được đề xuất
        List<DoctorDTO> suggestedDoctors = new ArrayList<>();
        try {
            suggestedDoctors = doctorService.getDoctorsBySpecialtyId(primaryMatch.id);
            if (suggestedDoctors.isEmpty()) {
                suggestedDoctors = doctorService.getAllDoctors().stream().limit(3).toList();
            }
        } catch (Exception e) {
            log.warn("Error fetching doctors for specialty {}: {}", primaryMatch.id, e.getMessage());
        }

        // Thiết lập mức độ khẩn cấp (Urgency Level)
        String urgencyLevel = isEmergency ? "EMERGENCY" : (primaryMatch.score >= 80 ? "ATTENTION" : "NORMAL");

        // Chuẩn bị kết quả mặc định từ CRM Rules
        String analysis = primaryMatch.analysisTemplate;
        if (isEmergency && emergencyReason != null) {
            analysis = "⚠️ CẢNH BÁO DẤU HIỆU CẤP CỨU: Phát hiện dấu hiệu nghiêm trọng (" + emergencyReason + "). " + analysis;
        }

        List<String> actionSteps = new ArrayList<>(primaryMatch.actionSteps);
        List<String> followUpQuestions = new ArrayList<>(primaryMatch.screeningQuestions);

        String consultationSource = "CRM_RULES_OFFLINE";
        String aiModelUsed = null;

        // 2. KẾT HỢP CHAT AI: Gọi OpenRouter API kết hợp CRM
        // Trong trường hợp hàng đợi các model free AI bị quá tải (429/503), tự động chuyển sang CRM Rules
        OpenRouterResult aiResult = callOpenRouterWithFallback(userMessage, primaryMatch);
        if (aiResult.isSuccess()) {
            analysis = aiResult.getContent();
            consultationSource = "AI_LLM_ONLINE";
            aiModelUsed = aiResult.getModel();
            log.info("AI Triage successfully generated via online model: {}", aiModelUsed);
        } else {
            log.info("AI online models busy/queued/error -> Seamlessly using CRM Knowledge Base rules.");
            consultationSource = "CRM_RULES_OFFLINE";
        }

        return new TriageConsultResponseDTO(
                analysis,
                recommendedSpecialties,
                actionSteps,
                followUpQuestions,
                urgencyLevel,
                matchedKeywordsTotal,
                suggestedDoctors,
                consultationSource,
                aiModelUsed
        );
    }

    private OpenRouterResult callOpenRouterWithFallback(String userMessage, MatchedSpecialtyScore primaryMatch) {
        String apiKey = this.openrouterApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("dummy")) {
            apiKey = System.getenv("OPENROUTER_API_KEY");
        }
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("dummy")) {
            log.info("Khong tim thay OPENROUTER_API_KEY hop le, chuyen sang che do CRM Offline Rules.");
            return null;
        }

        try {
            // Danh sách tối đa 3 model theo quy định của OpenRouter API (Primary: google/gemma-4-26b-a4b-it:free)
            List<String> fallbackModels = Arrays.asList(
                    "google/gemma-4-26b-a4b-it:free",
                    "nvidia/nemotron-3-ultra-550b-a55b:free",
                    "dots-studio/dots-3-note-preview:free"
            );

            String systemPrompt = "Bạn là Trợ lý AI Bác sĩ Sàng lọc Y khoa (Triage Consultant) tại Phòng khám MediCare.\n" +
                    "Nhiệm vụ: Dựa trên triệu chứng và tri thức chuyên khoa CRM được cung cấp, hãy phân tích 2-3 câu ngắn gọn về nguyên nhân khả dĩ và đưa ra lời khuyên y khoa ân cần. Không kê đơn thuốc cụ thể. Trả lời bằng tiếng Việt.";

            String userPrompt = String.format(
                    "Người dùng hỏi: \"%s\"\n" +
                    "Chuyên khoa phù hợp nhất từ CRM: %s (Mã: %s).\n" +
                    "Triệu chứng ghi nhận: %s.\n" +
                    "Hãy phân tích nguyên nhân tiềm ẩn và lời khuyên y tế súc tích.",
                    userMessage, primaryMatch.name, primaryMatch.code, String.join(", ", primaryMatch.matchedWords)
            );

            Map<String, Object> payload = new HashMap<>();
            payload.put("models", fallbackModels);
            payload.put("messages", Arrays.asList(
                    Map.of("role", "system", "content", systemPrompt),
                    Map.of("role", "user", "content", userPrompt)
            ));
            payload.put("max_tokens", 350);
            payload.put("temperature", 0.7);

            String requestBody = objectMapper.writeValueAsString(payload);

            HttpRequest httpRequest = HttpRequest.newBuilder()
                    .uri(URI.create("https://openrouter.ai/api/v1/chat/completions"))
                    .header("Authorization", "Bearer " + apiKey.trim())
                    .header("Content-Type", "application/json")
                    .header("HTTP-Referer", "http://localhost:5173")
                    .header("X-Title", "MediCare AI Consultant")
                    .timeout(Duration.ofSeconds(12))
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody, StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = httpClient.send(httpRequest, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String returnedModel = root.path("model").asText("OpenRouter AI");
                JsonNode choices = root.path("choices");
                if (choices.isArray() && choices.size() > 0) {
                    JsonNode msg = choices.get(0).path("message");
                    String content = msg.path("content").asText();
                    if (content == null || content.trim().isEmpty() || content.equals("null")) {
                        content = msg.path("reasoning").asText();
                    }
                    if (content != null && !content.trim().isEmpty() && !content.equals("null")) {
                        return new OpenRouterResult(true, content.trim(), returnedModel);
                    }
                }
            } else {
                log.warn("OpenRouter API returned status {} (free model busy/queued): {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("OpenRouter API call exception (queue/rate limit/timeout): {}", e.getMessage());
        }

        return new OpenRouterResult(false, null, null);
    }

    private MatchedSpecialtyScore getDefaultSpecialty() {
        return new MatchedSpecialtyScore(
                1,
                "Nội khoa",
                "INTERNAL_MED",
                70,
                0,
                new ArrayList<>(),
                "Chẩn đoán và điều trị các bệnh lí bên trong cơ thể.",
                "Triệu chứng bạn mô tả cần được bác sĩ chuyên khoa kiểm tra trực tiếp để đánh giá toàn diện các chỉ số sinh hiệu và tiền sử bệnh lý.",
                Arrays.asList(
                        "Ghi lại nhật ký các triệu chứng bất thường, thời gian xuất hiện và các yếu tố làm tăng giảm triệu chứng.",
                        "Duy trì chế độ ăn uống thanh đạm, uống đủ nước và nghỉ ngơi hợp lý.",
                        "Đặt lịch khám tại Chuyên khoa Nội khoa / Nội tổng quát để bác sĩ kiểm tra và hướng dẫn xét nghiệm phù hợp."
                ),
                Arrays.asList(
                        "Triệu chứng này bắt đầu xuất hiện từ khi nào và có tăng dần không?",
                        "Bạn có đang dùng loại thuốc nào điều trị bệnh lý nền không?"
                )
        );
    }

    private static class MatchedSpecialtyScore {
        int id;
        String name;
        String code;
        int score;
        int matchCount;
        List<String> matchedWords;
        String description;
        String analysisTemplate;
        List<String> actionSteps;
        List<String> screeningQuestions;

        public MatchedSpecialtyScore(int id, String name, String code, int score, int matchCount,
                                     List<String> matchedWords, String description,
                                     String analysisTemplate, List<String> actionSteps,
                                     List<String> screeningQuestions) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.score = score;
            this.matchCount = matchCount;
            this.matchedWords = matchedWords;
            this.description = description;
            this.analysisTemplate = analysisTemplate;
            this.actionSteps = actionSteps;
            this.screeningQuestions = screeningQuestions;
        }
    }

    private static class OpenRouterResult {
        private final boolean success;
        private final String content;
        private final String model;

        public OpenRouterResult(boolean success, String content, String model) {
            this.success = success;
            this.content = content;
            this.model = model;
        }

        public boolean isSuccess() {
            return success;
        }

        public String getContent() {
            return content;
        }

        public String getModel() {
            return model;
        }
    }
}
