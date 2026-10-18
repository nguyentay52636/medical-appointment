package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.ChatRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.client.advisor.vectorstore.QuestionAnswerAdvisor;
import org.springframework.ai.vectorstore.VectorStore;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/rag-chat")
public class ChatController {

    private final ChatClient chatClient;

    public ChatController(ChatClient.Builder builder, VectorStore vectorStore) {
        this.chatClient = builder
                .defaultAdvisors(QuestionAnswerAdvisor.builder(vectorStore).build())
                .build();
    }

    private static final String STYLE_INSTRUCTION =
            "Bạn là trợ lý bệnh viện, trả lời theo yêu cầu sau:\n" +
            "- Trả lời bằng tiếng Việt.\n" +
            "- Nếu nội dung yêu cầu không về hỏi về triệu chứng bệnh, chuyên khoa hoặc bác sĩ, trả lời: Xin lỗi, tôi không thể làm điều đó.\n" +
            "- Nếu nội dung yêu cầu chỉ cách chữa bệnh, trả lời: Tôi không thể cung cấp thông tin đó. Vui lòng liên hệ bác sĩ để được tư vấn chính xác.\n"+
            "- Giới thiệu bác sĩ và địa chỉ khám bệnh"+
            "- Giới thiệu chuyên khoa cho các triệu chứng bệnh.\n";

    @PostMapping("/ask")
    public String ask(@RequestBody ChatRequest request) {
        String message = request.getMessage() == null ? "" : request.getMessage();
        List<String> history = request.getHistory();

        String recentHistory = "";
        if (history != null && !history.isEmpty()) {
            int start = Math.max(0, history.size() - 2);
            recentHistory = String.join("\n", history.subList(start, history.size()));
        }

        String prompt = STYLE_INSTRUCTION + "\n" + recentHistory + "\nCâu hỏi: " + message;

        return chatClient.prompt()
                .user(prompt)
                .call()
                .content();
    }
}