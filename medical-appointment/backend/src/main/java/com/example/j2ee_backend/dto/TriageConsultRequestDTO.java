package com.example.j2ee_backend.dto;

import java.util.List;

public class TriageConsultRequestDTO {
    private String message;
    private String sessionId;
    private List<String> history;
    private Integer patientId;

    public TriageConsultRequestDTO() {}

    public TriageConsultRequestDTO(String message, String sessionId, List<String> history) {
        this.message = message;
        this.sessionId = sessionId;
        this.history = history;
    }

    public Integer getPatientId() {
        return patientId;
    }

    public void setPatientId(Integer patientId) {
        this.patientId = patientId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getSessionId() {
        return sessionId;
    }

    public void setSessionId(String sessionId) {
        this.sessionId = sessionId;
    }

    public List<String> getHistory() {
        return history;
    }

    public void setHistory(List<String> history) {
        this.history = history;
    }
}
