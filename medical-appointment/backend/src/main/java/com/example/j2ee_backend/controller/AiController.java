package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.ChatRequest;
import com.example.j2ee_backend.dto.ChatResponse;
import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.DoctorSuggestRequest;
import com.example.j2ee_backend.service.AiService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin("http://localhost:5173")
public class AiController {

    private final AiService aiService;

    public AiController(AiService aiService) {
        this.aiService = aiService;
    }

    @PostMapping("/suggest-doctors")
    public ResponseEntity<Object> chatString(@RequestBody DoctorSuggestRequest doctorSuggestRequest) {
        if (doctorSuggestRequest.getPatientSymptom().length() == 0 && doctorSuggestRequest.getPatientAddress().length() == 0) {
            return ResponseEntity.badRequest().body("Không có dữ liệu để tìm kiếm bác sĩ phù hợp.");
        }

        try {
            List<DoctorDTO> response = this.aiService.suggestedDoctorsString(doctorSuggestRequest);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Lỗi gọi dịch vụ AI: " + e.getMessage());
        }
    }
    @PostMapping("/chat")
    public ChatResponse getChatResponse(@RequestBody ChatRequest request) {

        String aiAnswer = aiService.chat(request.getSessionId(), request.getMessage(), request.getHistory());

        return new ChatResponse(aiAnswer);
    }
}