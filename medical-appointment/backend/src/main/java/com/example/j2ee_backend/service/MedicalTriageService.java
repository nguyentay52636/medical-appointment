package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.SpecialtyRecommendationDTO;
import com.example.j2ee_backend.dto.TriageConsultRequestDTO;
import com.example.j2ee_backend.dto.TriageConsultResponseDTO;
import com.example.j2ee_backend.entity.AiSymptomAnalysis;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.entity.Specialty;
import com.example.j2ee_backend.repository.AiSymptomAnalysisRepository;
import com.example.j2ee_backend.repository.PatientRepository;
import com.example.j2ee_backend.repository.SpecialtyRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Duration;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Thuật toán Tư Vấn Sàng Lọc Lâm Sàng & Phân Luồng Chuyên Khoa Lai Tối Ưu (Optimized Hybrid Clinical Triage Engine).
 * 
 * Các cải tiến tối ưu hóa vượt bậc:
 * 1. Khớp từ ranh giới từ (Word-Boundary Regex): Loại bỏ 100% tình trạng khớp nhầm chuỗi con (false positives, ví dụ: 'ho' trong 'hông'/'không').
 * 2. Chuẩn hóa Tiếng Việt (Vietnamese Unaccent Normalizer): Nhận diện chính xác triệu chứng dù người dùng gõ có dấu hay không dấu.
 * 3. Trọng số Triệu chứng Y khoa (Weighted Symptom Scoring):
 *    - Triệu chứng đặc hiệu / Điển hình: Trọng số 3 (Pathognomonic).
 *    - Triệu chứng thứ phát: Trọng số 2 (Secondary).
 *    - Triệu chứng chung / mơ hồ: Trọng số 1 (General).
 *    - Cờ đối tượng (Target Population Flag): Ưu tiên chuyên khoa Nhi khi phát hiện đối tượng là trẻ em/bé.
 * 4. Duy trì Ngữ cảnh Hội thoại Nhiều Lượt (Multi-turn Context Sliding Window): Kết hợp lịch sử các lượt chat trước.
 * 5. Tự động Lưu vết CSDL (Database Persistence): Lưu lịch sử triệu chứng vào bảng 'ai_symptom_analysis'.
 * 6. Cơ chế Phân cấp Đa Mô hình & Dự phòng Không gián đoạn (Cascade Routing & Zero-Downtime CRM Fallback).
 */
@Service
public class MedicalTriageService {

    private static final Logger log = LoggerFactory.getLogger(MedicalTriageService.class);

    private final DoctorService doctorService;
    private final ChatModel chatModel;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;

    @Autowired(required = false)
    private AiSymptomAnalysisRepository symptomAnalysisRepository;

    @Autowired(required = false)
    private SpecialtyRepository specialtyRepository;

    @Autowired(required = false)
    private PatientRepository patientRepository;

    @Value("${spring.ai.openai.api-key:}")
    private String openrouterApiKey;

    @Value("${spring.ai.openai.chat.options.model:google/gemma-4-26b-a4b-it:free}")
    private String primaryModel;

    private String rawCrmJson = "";
    private JsonNode crmRootNode = null;

    // Danh sách từ khóa đặc hiệu (Trọng số 3)
    private static final Set<String> HIGH_WEIGHT_SYMPTOMS = Set.of(
            "dau that nguc", "nhoi nguc", "thieu mau co tim", "loan nhip tim", "huyet ap cao",
            "mat ngu", "migraine", "dau nua dau", "tien dinh", "roi loan tien dinh", "te bi tay chan",
            "viem xoang", "u tai", "chay mu tai", "mat tieng", "khan tieng", "viem amidan",
            "zona", "gioi leo", "vay nen", "cham da", "noi me day", "nam da", "mun boc", "mun viem",
            "co giat do sot", "tay chan mieng", "tho kho khe o tre", "tre sot cao", "bieng an o tre"
    );

    // Danh sách từ khóa đối tượng Trẻ em / Nhi khoa
    private static final List<String> PEDIATRIC_TARGET_KEYWORDS = Arrays.asList(
            "bé", "be", "trẻ", "tre", "trẻ em", "tre em", "trẻ nhỏ", "tre nho",
            "sơ sinh", "so sinh", "em bé", "em be", "con nít", "con nit", "cháu nhỏ", "chau nho"
    );

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
                log.info("MedicalTriageService: Loaded Medical Specialty CRM Rules successfully. Total specialties: {}",
                        crmRootNode.has("specialties") ? crmRootNode.get("specialties").size() : 0);
            }
        } catch (Exception e) {
            log.error("Failed to load medical_specialty_crm_rules.json: {}", e.getMessage(), e);
        }
    }

    public String getCrmRulesRawJson() {
        return this.rawCrmJson;
    }

    /**
     * Thuật toán Sàng lọc Triệu chứng & Phân luồng Chuyên khoa
     */
    public TriageConsultResponseDTO triageConsult(TriageConsultRequestDTO request) {
        String currentMessage = request.getMessage() == null ? "" : request.getMessage().trim();

        // 1. Ghép nối ngữ cảnh lịch sử trò chuyện nhiều lượt (Multi-turn Context Sliding Window)
        StringBuilder contextBuilder = new StringBuilder();
        if (request.getHistory() != null && !request.getHistory().isEmpty()) {
            for (String turn : request.getHistory()) {
                if (turn != null && !turn.trim().isEmpty()) {
                    contextBuilder.append(turn.trim()).append(" ");
                }
            }
        }
        contextBuilder.append(currentMessage);
        String fullContextMessage = contextBuilder.toString().trim();

        String lowerMessage = fullContextMessage.toLowerCase();
        String unaccentedMessage = stripAccents(lowerMessage);

        // 2. Kiểm tra cờ đối tượng Trẻ em / Nhi khoa
        boolean hasPediatricTarget = false;
        for (String targetWord : PEDIATRIC_TARGET_KEYWORDS) {
            if (matchesWordBoundary(lowerMessage, targetWord, unaccentedMessage, stripAccents(targetWord))) {
                hasPediatricTarget = true;
                break;
            }
        }

        // 3. Phân tích từ khóa triệu chứng & tính điểm trọng số theo từng chuyên khoa
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

                int totalWeight = 0;
                int matchCount = 0;
                List<String> matchedWords = new ArrayList<>();

                // A. Kiểm tra danh mục từ khóa triệu chứng (Keywords) với Word-Boundary & Unaccent
                if (specNode.has("keywords")) {
                    for (JsonNode kw : specNode.get("keywords")) {
                        String word = kw.asText().trim();
                        String wordLower = word.toLowerCase();
                        String wordUnaccented = stripAccents(wordLower);

                        if (matchesWordBoundary(lowerMessage, wordLower, unaccentedMessage, wordUnaccented)) {
                            matchCount++;
                            int weight = determineSymptomWeight(wordUnaccented);
                            totalWeight += weight;
                            matchedWords.add(word);
                            if (!matchedKeywordsTotal.contains(word)) {
                                matchedKeywordsTotal.add(word);
                            }
                        }
                    }
                }

                // B. Kiểm tra bí danh chuyên khoa (Aliases)
                if (specNode.has("aliases")) {
                    for (JsonNode al : specNode.get("aliases")) {
                        String alias = al.asText().trim().toLowerCase();
                        String aliasUnaccented = stripAccents(alias);
                        if (matchesWordBoundary(lowerMessage, alias, unaccentedMessage, aliasUnaccented)) {
                            matchCount++;
                            totalWeight += 2; // Alias có trọng số 2
                        }
                    }
                }

                // C. Kiểm tra dấu hiệu cấp cứu y tế nghiêm trọng (Emergency Warning)
                if (specNode.has("emergencyWarningKeywords")) {
                    for (JsonNode em : specNode.get("emergencyWarningKeywords")) {
                        String emWord = em.asText().trim().toLowerCase();
                        String emUnaccented = stripAccents(emWord);
                        if (matchesWordBoundary(lowerMessage, emWord, unaccentedMessage, emUnaccented)) {
                            isEmergency = true;
                            emergencyReason = em.asText();
                        }
                    }
                }

                // D. Điểm thưởng đối tượng (Population Bonus): Nếu có dấu hiệu trẻ em, ưu tiên Nhi khoa
                int populationBonus = 0;
                if (hasPediatricTarget && "PEDIATRICS".equalsIgnoreCase(code)) {
                    populationBonus = 25;
                }

                // E. Đọc các chỉ dẫn và câu hỏi sàng lọc
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

                // F. Tính điểm phù hợp (Match Score Formula)
                if (totalWeight > 0 || populationBonus > 0) {
                    // Công thức trọng số: Score = min(98, 60 + TotalWeight * 7 + Bonus)
                    int calculatedScore = Math.min(98, 60 + (totalWeight * 7) + populationBonus);
                    scoredList.add(new MatchedSpecialtyScore(
                            id, name, code, calculatedScore, matchCount, totalWeight, matchedWords,
                            description, analysisTemplate, actionSteps, screeningQuestions
                    ));
                }
            }
        }

        // Sắp xếp các chuyên khoa theo điểm phù hợp giảm dần
        scoredList.sort((a, b) -> Integer.compare(b.score, a.score));

        // Trường hợp không có từ khóa khớp cụ thể -> Mặc định gợi ý Nội khoa
        if (scoredList.isEmpty()) {
            MatchedSpecialtyScore defaultScore = getDefaultSpecialty();
            scoredList.add(defaultScore);
        }

        MatchedSpecialtyScore primaryMatch = scoredList.get(0);

        // Chuẩn bị danh sách chuyên khoa đề xuất (Top 2)
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
        String urgencyLevel = isEmergency ? "EMERGENCY" : (primaryMatch.score >= 85 ? "ATTENTION" : "NORMAL");

        // Chuẩn bị kết quả mặc định từ CRM Rules
        String analysis = primaryMatch.analysisTemplate;
        if (isEmergency && emergencyReason != null) {
            analysis = "Dấu hiệu cấp cứu cần lưu ý đặc biệt: Phát hiện triệu chứng nghiêm trọng (" + emergencyReason + "). " + analysis;
        }

        List<String> actionSteps = new ArrayList<>(primaryMatch.actionSteps);
        List<String> followUpQuestions = new ArrayList<>(primaryMatch.screeningQuestions);

        String consultationSource = "CRM_RULES_OFFLINE";
        String aiModelUsed = null;

        // 4. KẾT HỢP CHAT AI: Gọi OpenRouter API kết hợp CRM
        // Trong trường hợp hàng đợi các model free AI bị quá tải (429/503), tự động chuyển sang CRM Rules
        OpenRouterResult aiResult = callOpenRouterWithFallback(currentMessage, fullContextMessage, primaryMatch);
        if (aiResult != null && aiResult.isSuccess()) {
            analysis = cleanClinicalText(aiResult.getContent());
            consultationSource = "AI_LLM_ONLINE";
            aiModelUsed = aiResult.getModel();
            log.info("AI Triage: Generated via model [{}] for query: {}", aiModelUsed, currentMessage);
        } else {
            log.info("AI Triage: Online models queued/timeout -> Fallback smoothly to CRM Knowledge Base rules.");
            analysis = cleanClinicalText(analysis);
            consultationSource = "CRM_RULES_OFFLINE";
        }

        // 5. Lưu vết phiên tư vấn vào CSDL (bảng 'ai_symptom_analysis') nếu có repository
        saveSymptomAnalysisLog(request.getPatientId(), currentMessage, analysis, primaryMatch.id);

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

    /**
     * Xác định trọng số triệu chứng y khoa (1, 2 hoặc 3)
     */
    private int determineSymptomWeight(String unaccentedKeyword) {
        if (HIGH_WEIGHT_SYMPTOMS.contains(unaccentedKeyword)) {
            return 3; // Triệu chứng đặc hiệu / Điển hình
        }
        // Cụm từ dài >= 2 từ thường có độ đặc hiệu cao hơn từ đơn
        if (unaccentedKeyword.contains(" ")) {
            return 2; // Triệu chứng thứ phát
        }
        return 1; // Triệu chứng chung / đơn lẻ
    }

    /**
     * Kiểm tra khớp từ chính xác theo Ranh giới từ (Word Boundary Regex)
     * Hỗ trợ cả văn bản nguyên bản và văn bản không dấu.
     */
    private boolean matchesWordBoundary(String sourceText, String keyword, String unaccentedSource, String unaccentedKeyword) {
        if (sourceText == null || keyword == null || keyword.isEmpty()) {
            return false;
        }

        // 1. Kiểm tra trên văn bản có dấu với regex ranh giới từ tiếng Việt
        if (checkRegexBoundary(sourceText, keyword)) {
            return true;
        }

        // 2. Kiểm tra trên văn bản không dấu để bắt trường hợp người dùng gõ không dấu
        if (unaccentedSource != null && unaccentedKeyword != null && !unaccentedKeyword.isEmpty()) {
            return checkRegexBoundary(unaccentedSource, unaccentedKeyword);
        }

        return false;
    }

    private boolean checkRegexBoundary(String text, String target) {
        try {
            // Regex: (?<!\p{L})target(?!\p{L}) đảm bảo trước và sau target không phải là chữ cái Unicode
            String regex = "(?i)(?<!\\p{L})" + Pattern.quote(target) + "(?!\\p{L})";
            return Pattern.compile(regex, Pattern.UNICODE_CHARACTER_CLASS).matcher(text).find();
        } catch (Exception e) {
            return text.contains(target);
        }
    }

    /**
     * Chuẩn hóa văn bản Tiếng Việt loại bỏ dấu thanh
     */
    public static String stripAccents(String text) {
        if (text == null) return "";
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        String withoutMarks = normalized.replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return withoutMarks.replace('đ', 'd').replace('Đ', 'D').toLowerCase();
    }

    /**
     * Gọi OpenRouter API kết hợp đa mô hình (Cascade Routing)
     */
    private OpenRouterResult callOpenRouterWithFallback(String currentQuery, String contextQuery, MatchedSpecialtyScore primaryMatch) {
        String apiKey = this.openrouterApiKey;
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("dummy")) {
            apiKey = System.getenv("OPENROUTER_API_KEY");
        }
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("dummy")) {
            log.info("Khong tim thay OPENROUTER_API_KEY hop le, chuyen sang che do CRM Offline Rules.");
            return null;
        }

        try {
            List<String> fallbackModels = Arrays.asList(
                    "google/gemma-4-26b-a4b-it:free",
                    "nvidia/nemotron-3-ultra-550b-a55b:free",
                    "dots-studio/dots-3-note-preview:free"
            );

            String systemPrompt = "Bạn là Trợ lý Sàng lọc Y khoa chuyên nghiệp tại Phòng khám MediCare.\n" +
                    "Nhiệm vụ: Dựa trên triệu chứng bệnh nhân mô tả và thông tin chuyên khoa từ hệ thống CRM, hãy viết 2-3 câu ngắn gọn phân tích nguyên nhân khả dĩ và đưa ra lời khuyên y khoa ân cần, súc tích. Không kê đơn thuốc cụ thể.\n" +
                    "Quy định nghiêm ngặt về định dạng:\n" +
                    "1. Tuyệt đối KHÔNG sử dụng ký tự Markdown như ** (dấu sao kép), * (dấu sao đơn), # (tiêu đề), hoặc các ký tự gạch đầu dòng (*, -, +).\n" +
                    "2. Tuyệt đối KHÔNG chèn bất kỳ biểu tượng cảm xúc (emoji) nào trong nội dung phản hồi.\n" +
                    "3. Trình bày bằng tiếng Việt văn xuôi chuẩn mực, ngôn từ y khoa lịch thiệp, dễ hiểu, liền mạch và gãy gọn.";

            String userPrompt = String.format(
                    "Bệnh nhân hỏi: \"%s\"\n" +
                    "Ngữ cảnh triệu chứng ghi nhận: \"%s\"\n" +
                    "Chuyên khoa phù hợp nhất từ CRM: %s (Mã: %s).\n" +
                    "Triệu chứng nhận diện: %s.\n" +
                    "Hãy phân tích nguyên nhân tiềm ẩn và lời khuyên y tế súc tích, văn xuôi thuần túy, không có dấu sao ** và không có emoji.",
                    currentQuery, contextQuery, primaryMatch.name, primaryMatch.code, String.join(", ", primaryMatch.matchedWords)
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
                        return new OpenRouterResult(true, cleanClinicalText(content.trim()), returnedModel);
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

    /**
     * Tiền xử lý và làm sạch văn bản y khoa
     */
    private String cleanClinicalText(String text) {
        if (text == null) return "";
        String cleaned = text.replaceAll("\\*\\*(.*?)\\*\\*", "$1")
                             .replaceAll("\\*(.*?)\\*", "$1")
                             .replaceAll("__(.*?)__", "$1")
                             .replaceAll("_(.*?)_", "$1");
        cleaned = cleaned.replaceAll("(?m)^#{1,6}\\s*", "");
        cleaned = cleaned.replaceAll("(?m)^[\\*\\-\\+]\\s+", "");
        cleaned = cleaned.replace("`", "");
        cleaned = cleaned.replaceAll("[\\p{So}\\p{Cn}]", "");
        cleaned = cleaned.replaceAll("[\\uD83C-\\uDBFF\\uDC00-\\uDFFF]", "");
        cleaned = cleaned.replaceAll("[ \\t]+", " ")
                         .replaceAll("(\\r?\\n){3,}", "\n\n")
                         .trim();
        return cleaned;
    }

    /**
     * Tự động lưu vết phiên tư vấn triệu chứng vào CSDL
     */
    private void saveSymptomAnalysisLog(Integer patientId, String symptoms, String aiResponse, Integer specialtyId) {
        if (symptomAnalysisRepository == null) return;
        try {
            Patient patient = null;
            if (patientId != null && patientRepository != null) {
                patient = patientRepository.findById(patientId).orElse(null);
            }
            if (patient == null && patientRepository != null) {
                // Nếu chưa đăng nhập, gán cho tài khoản patient mặc định số 1 nếu có
                patient = patientRepository.findById(1).orElse(null);
            }

            if (patient != null) {
                Specialty specialty = null;
                if (specialtyId != null && specialtyRepository != null) {
                    specialty = specialtyRepository.findById(specialtyId).orElse(null);
                }

                AiSymptomAnalysis record = new AiSymptomAnalysis();
                record.setPatient(patient);
                record.setSymptoms(symptoms);
                record.setAiResponse(aiResponse);
                record.setSuggestedSpecialty(specialty);

                symptomAnalysisRepository.save(record);
                log.info("AI Triage: Saved symptom analysis log for patient ID {}", patient.getId());
            }
        } catch (Exception e) {
            log.warn("Could not save AI symptom analysis log to database: {}", e.getMessage());
        }
    }

    private MatchedSpecialtyScore getDefaultSpecialty() {
        return new MatchedSpecialtyScore(
                1,
                "Nội khoa",
                "INTERNAL_MED",
                70,
                0,
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
        int totalWeight;
        List<String> matchedWords;
        String description;
        String analysisTemplate;
        List<String> actionSteps;
        List<String> screeningQuestions;

        public MatchedSpecialtyScore(int id, String name, String code, int score, int matchCount,
                                     int totalWeight, List<String> matchedWords, String description,
                                     String analysisTemplate, List<String> actionSteps,
                                     List<String> screeningQuestions) {
            this.id = id;
            this.name = name;
            this.code = code;
            this.score = score;
            this.matchCount = matchCount;
            this.totalWeight = totalWeight;
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
