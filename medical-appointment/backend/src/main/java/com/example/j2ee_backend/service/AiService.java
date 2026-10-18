package com.example.j2ee_backend.service;


import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.DoctorSuggestRequest;
import com.example.j2ee_backend.dto.component.ConversationMemory;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiService {

    private final DoctorService doctorService;
    private final ChatModel chatModel;
    private final ConversationMemory conversationMemory;
    public List<DoctorDTO> suggestedDoctorsString(DoctorSuggestRequest doctorSuggestRequest) {
        try {
            List<DoctorDTO> allDoctors = doctorService.getAllDoctors();
            String patientSymptoms = doctorSuggestRequest.getPatientSymptom();
            String patientAddress = doctorSuggestRequest.getPatientAddress().isEmpty() ? "Không có địa chỉ bệnh nhân " : doctorSuggestRequest.getPatientAddress();

            String doctorStringData = allDoctors.stream()
                    .map(doctor -> String.format(
                            "Doctor_id: %d, chuyên khoa: %s, bio: %s, địa chỉ: \n",
                            doctor.getId(),
                            doctor.getSpecialtyName(),
                            doctor.getBio()
                    ))
                    .collect(Collectors.joining());

            String prompt =
                    "Bạn là một hệ thống gợi ý chuyên gia y tế. Nhiệm vụ của bạn là phân tích dữ liệu và trả về danh sách ID của các bác sĩ phù hợp nhất và địa chỉ bác sĩ gần bệnh nhân.\n\n" +
                            "### Dữ liệu đầu vào\n" +
                            "1. Thông tin chi tiết về các bác sĩ (specialtyName, bio):\n" +
                            "--- Dữ liệu bác sĩ ---\n" +
                            doctorStringData + "\n\n" +
                            "2. Triệu chứng của bệnh nhân:\n" +
                            "- Địa chỉ của bệnh nhân: " + patientAddress + " \n" +
                            "--- Mô tả của bệnh nhân ---\n" +
                            patientSymptoms  + "\n\n" +
                            "### Yêu cầu đầu ra\n" +
                            "1. Lọc ra các doctor_id có chuyên môn TƯƠNG THÍCH NHẤT với các triệu chứng bệnh.\n" +
                            "2. Định dạng đầu ra BẮT BUỘT phải là một chuỗi các số nguyên được phân tách bằng dấu phẩy và một khoảng trắng.\n\n" +
                            "### Quy tắc Phản hồi Quan trọng\n" +
                            "* KHÔNG BAO GỒM bất kỳ lời giải thích, văn bản mở đầu, hoặc ký tự bổ sung nào khác.\n" +
                            "* CHỈ trả về chuỗi ID. Ví dụ: 10, 25, 42, 99, 5";

            String aiResponse = chatModel.call(prompt);
            Integer[] listedDoctorIds = parseDoctorIds(aiResponse);

            Set<Integer> listedDoctorIdSet = Arrays.stream(listedDoctorIds)
                    .collect(Collectors.toSet());

            List<DoctorDTO> suggestedDoctors = allDoctors.stream()
                    .filter(doctor -> listedDoctorIdSet.contains(doctor.getId())) // Lọc
                    .collect(Collectors.toList());

            return suggestedDoctors;

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Lỗi khi gọi dịch vụ AI: " + e.getMessage());
        }
    }

    public String chat(String sessionId, String userMessage) {
        String sid = sessionId == null ? "default" : sessionId;

        // add user message to memory before calling model
        conversationMemory.addUserMessage(sid, userMessage);

        List<DoctorDTO> allDoctors = doctorService.getAllDoctors();

        String doctorStringData = allDoctors.stream()
                .map(doctor -> String.format(
                        "Tên bác sĩ: %s, chuyên khoa: %s, bio: %s, địa chỉ của bác sĩ : %s \n",
                        doctor.getFullName(),
                        doctor.getSpecialtyName(),
                        doctor.getBio(),
                        doctor.getAddress()
                ))
                .collect(Collectors.joining());

        String systemInstruction = """
            Bạn là một trợ lý bệnh viện. Dựa trên YÊU CẦU của người dùng và DỮ LIỆU BÁC SĨ được cung cấp dưới đây,
            hãy chọn ra 1-2 bác sĩ phù hợp nhất khi người dùng cần giới thiệu bác sĩ.
            Nếu không tìm thấy bác sĩ phù hợp, hãy thông báo rõ ràng.
            Không hỗ trợ đặt lịch.
            Không trả lời các câu hỏi ngoài phạm vi giới thiệu bác sĩ và địa chỉ nơi bác sĩ khám.
            """;

        // include only the most recent conversation entries
        final int HISTORY_LIMIT = 5;
        List<String> history = conversationMemory.getConversation(sid);
        int startIdx = Math.max(0, history.size() - HISTORY_LIMIT);
        String conversationHistory = history.subList(startIdx, history.size()).stream().collect(Collectors.joining("\n"));

        String promptString = systemInstruction +
                "\n--- DỮ LIỆU BÁC SĨ ---\n" +
                doctorStringData +
                "\n--- CUỘC TRÒ CHUYỆN TRƯỚC ĐÓ ---\n" +
                conversationHistory +
                "\n--- YÊU CẦU NGƯỜI DÙNG ---\n" +
                userMessage;

        PromptTemplate promptTemplate = new PromptTemplate(promptString);
        Prompt prompt = promptTemplate.create(Collections.emptyMap());

        ChatResponse response = chatModel.call(prompt);
        String assistantText = response.getResult().getOutput().getText();

        // remember assistant response for the session
        conversationMemory.addAssistantMessage(sid, assistantText);

        return assistantText;
    }

    /**
     * Chat using conversation history provided by the client. The provided history should be a list
     * of strings where each entry is prefixed with "User:" or "Assistant:" (case-insensitive),
     * e.g. "User: Tôi bị sốt" or "Assistant: Bạn nên...". The server will replace its in-memory
     * conversation for the session with the provided history before adding the current user message.
     */
    public String chat(String sessionId, String userMessage, List<String> clientHistory) {
        String sid = sessionId == null ? "default" : sessionId;

        // replace server-side memory with client-provided history (if any)
        if (clientHistory != null) {
            conversationMemory.clear(sid);
            for (String entry : clientHistory) {
                if (entry == null) continue;
                String trimmed = entry.trim();
                if (trimmed.length() == 0) continue;
                if (trimmed.toLowerCase().startsWith("user:")) {
                    conversationMemory.addUserMessage(sid, trimmed.substring(trimmed.indexOf(":") + 1).trim());
                } else if (trimmed.toLowerCase().startsWith("assistant:")) {
                    conversationMemory.addAssistantMessage(sid, trimmed.substring(trimmed.indexOf(":") + 1).trim());
                } else {
                    // Unknown prefix: treat as user message
                    conversationMemory.addUserMessage(sid, trimmed);
                }
            }
        }

        // add current user message
        conversationMemory.addUserMessage(sid, userMessage);

        List<DoctorDTO> allDoctors = doctorService.getAllDoctors();

        String doctorStringData = allDoctors.stream()
                .map(doctor -> String.format(
                        "Tên bác sĩ: %s, chuyên khoa: %s, bio: %s, địa chỉ của bác sĩ : %s \n",
                        doctor.getFullName(),
                        doctor.getSpecialtyName(),
                        doctor.getBio(),
                        doctor.getAddress()
                ))
                .collect(Collectors.joining());

        String systemInstruction = """
            Bạn là một trợ lý bệnh viện. Dựa trên YÊU CẦU của người dùng và DỮ LIỆU BÁC SĨ được cung cấp dưới đây,
            hãy chọn ra 1-2 bác sĩ phù hợp nhất khi người dùng cần tư vấn.
            Nếu không tìm thấy bác sĩ phù hợp, hãy thông báo rõ ràng.
            Không hỗ trợ đặt lịch.
            Không trả lời các câu hỏi ngoài phạm vi giới thiệu bác sĩ và địa chỉ nơi bác sĩ khám.
            Không gợi ý chữa bệnh.
            """;

        // include only the most recent conversation entries
        final int HISTORY_LIMIT = 5;
        List<String> history = conversationMemory.getConversation(sid);
        int startIdx = Math.max(0, history.size() - HISTORY_LIMIT);
        String conversationHistory = history.subList(startIdx, history.size()).stream().collect(Collectors.joining("\n"));

        String promptString = systemInstruction +
                "\n--- DỮ LIỆU BÁC SĨ ---\n" +
                doctorStringData +
                "\n--- CUỘC TRÒ CHUYỆN TRƯỚC ĐÓ ---\n" +
                conversationHistory +
                "\n--- YÊU CẦU NGƯỜI DÙNG ---\n" +
                userMessage;

        PromptTemplate promptTemplate = new PromptTemplate(promptString);
        Prompt prompt = promptTemplate.create(Collections.emptyMap());

        ChatResponse response = chatModel.call(prompt);
        String assistantText = response.getResult().getOutput().getText();

        // remember assistant response for the session
        conversationMemory.addAssistantMessage(sid, assistantText);

        return assistantText;
    }
    public static Integer[] parseDoctorIds(String aiResponse) {
        if (aiResponse == null || aiResponse.trim().isEmpty()) {
            return new Integer[0];
        }

        String[] parts = aiResponse.split(",");
        List<Integer> ids = new ArrayList<>(parts.length);

        for (String part : parts) {
            String trimmed = part.trim();
            if (trimmed.isEmpty()) continue;
            try {
                ids.add(Integer.valueOf(trimmed));
            } catch (NumberFormatException ignored) {
            }
        }

        return ids.toArray(new Integer[0]);
    }
    public String chat(String userMessage) {
        return chat("default", userMessage);
    }
}
