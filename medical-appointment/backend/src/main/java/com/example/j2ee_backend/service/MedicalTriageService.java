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
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class MedicalTriageService {

    private static final Logger log = LoggerFactory.getLogger(MedicalTriageService.class);

    private final DoctorService doctorService;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;

    private String rawCrmJson = "";
    private JsonNode crmRootNode = null;

    public MedicalTriageService(DoctorService doctorService, ChatModel chatModel, ObjectMapper objectMapper) {
        this.doctorService = doctorService;
        this.chatModel = chatModel;
        this.objectMapper = objectMapper;
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

        // Trường hợp không có từ khóa khớp cụ thể -> Mặc định gợi ý Nội khoa (Đa khoa / Thần kinh)
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
                // Fallback nếu chuyên khoa chưa có bác sĩ cụ thể
                suggestedDoctors = doctorService.getAllDoctors().stream().limit(3).toList();
            }
        } catch (Exception e) {
            log.warn("Error fetching doctors for specialty {}: {}", primaryMatch.id, e.getMessage());
        }

        // Thiết lập mức độ khẩn cấp (Urgency Level)
        String urgencyLevel = isEmergency ? "EMERGENCY" : (primaryMatch.score >= 80 ? "ATTENTION" : "NORMAL");

        // Chuẩn bị kết quả mặc định từ CRM Rules (đảm bảo 100% chuẩn xác không bị lỗi)
        String analysis = primaryMatch.analysisTemplate;
        if (isEmergency && emergencyReason != null) {
            analysis = "⚠️ CẢNH BÁO DẤU HIỆU CẤP CỨU: Phát hiện dấu hiệu nghiêm trọng (" + emergencyReason + "). " + analysis;
        }

        List<String> actionSteps = new ArrayList<>(primaryMatch.actionSteps);
        List<String> followUpQuestions = new ArrayList<>(primaryMatch.screeningQuestions);

        // Thử gọi Spring AI để cá nhân hóa phân tích và câu hỏi hỏi thêm (nếu model hoạt động)
        try {
            String aiRefinedPrompt = String.format(
                "Bạn là Trợ lý AI Bác sĩ Sàng lọc Y khoa (Triage Consultant) tại Phòng khám MediCare.\n" +
                "Người dùng hỏi: \"%s\"\n" +
                "Chuyên khoa phù hợp nhất được hệ thống CRM phân loại là: %s (Mã: %s).\n" +
                "Các triệu chứng ghi nhận: %s.\n\n" +
                "Hãy phân tích ngắn gọn theo 4 phần chuẩn:\n" +
                "1. AI phân tích vấn đề: Phân tích 1-2 câu ngắn gọn về nguyên nhân khả dĩ (rối loạn giấc ngủ, căng thẳng, đau đầu...).\n" +
                "2. Đề xuất chuyên khoa: Nêu rõ nên khám chuyên khoa %s.\n" +
                "3. 3 hướng xử lý: Đưa ra đúng 3 gạch đầu dòng hướng dẫn chăm sóc/theo dõi tại nhà.\n" +
                "4. AI hỏi thêm: Đưa ra 1-2 câu hỏi ngắn để làm rõ thêm triệu chứng.\n" +
                "Yêu cầu: Không kê đơn thuốc cụ thể. Văn phong ân cần, y khoa chuẩn mực.",
                userMessage, primaryMatch.name, primaryMatch.code, String.join(", ", primaryMatch.matchedWords)
            );

            // Chỉ gọi nếu ChatModel không ném lỗi
            String aiResponseText = chatModel.call(aiRefinedPrompt);
            if (aiResponseText != null && !aiResponseText.trim().isEmpty()) {
                // Sử dụng phân tích linh hoạt từ AI nếu phản hồi tốt
                analysis = parseAiAnalysis(aiResponseText, primaryMatch.analysisTemplate);
            }
        } catch (Exception e) {
            log.info("Spring AI chatModel not available or error ({}), smoothly falling back to CRM Knowledge Base rules.", e.getMessage());
        }

        return new TriageConsultResponseDTO(
                analysis,
                recommendedSpecialties,
                actionSteps,
                followUpQuestions,
                urgencyLevel,
                matchedKeywordsTotal,
                suggestedDoctors
        );
    }

    private String parseAiAnalysis(String aiResponseText, String defaultAnalysis) {
        try {
            if (aiResponseText.contains("AI phân tích vấn đề") || aiResponseText.contains("phân tích vấn đề")) {
                String[] parts = aiResponseText.split("(?i)(AI đề xuất|3 hướng xử lý|hướng xử lý|đề xuất chuyên khoa)");
                if (parts.length > 0) {
                    String part0 = parts[0].replaceAll("(?i)(###|\\*\\*|AI phân tích vấn đề:?|Phân tích vấn đề:?)", "").trim();
                    if (!part0.isEmpty()) {
                        return part0;
                    }
                }
            }
            return defaultAnalysis;
        } catch (Exception e) {
            return defaultAnalysis;
        }
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
}
