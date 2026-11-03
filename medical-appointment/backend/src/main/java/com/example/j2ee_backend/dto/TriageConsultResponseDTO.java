package com.example.j2ee_backend.dto;

import java.util.ArrayList;
import java.util.List;

public class TriageConsultResponseDTO {
    private String analysis;
    private List<SpecialtyRecommendationDTO> recommendedSpecialties = new ArrayList<>();
    private List<String> actionSteps = new ArrayList<>();
    private List<String> followUpQuestions = new ArrayList<>();
    private String urgencyLevel;
    private List<String> matchedKeywords = new ArrayList<>();
    private List<DoctorDTO> suggestedDoctors = new ArrayList<>();

    public TriageConsultResponseDTO() {}

    public TriageConsultResponseDTO(String analysis, List<SpecialtyRecommendationDTO> recommendedSpecialties,
                                   List<String> actionSteps, List<String> followUpQuestions,
                                   String urgencyLevel, List<String> matchedKeywords,
                                   List<DoctorDTO> suggestedDoctors) {
        this.analysis = analysis;
        this.recommendedSpecialties = recommendedSpecialties;
        this.actionSteps = actionSteps;
        this.followUpQuestions = followUpQuestions;
        this.urgencyLevel = urgencyLevel;
        this.matchedKeywords = matchedKeywords;
        this.suggestedDoctors = suggestedDoctors;
    }

    public String getAnalysis() {
        return analysis;
    }

    public void setAnalysis(String analysis) {
        this.analysis = analysis;
    }

    public List<SpecialtyRecommendationDTO> getRecommendedSpecialties() {
        return recommendedSpecialties;
    }

    public void setRecommendedSpecialties(List<SpecialtyRecommendationDTO> recommendedSpecialties) {
        this.recommendedSpecialties = recommendedSpecialties;
    }

    public List<String> getActionSteps() {
        return actionSteps;
    }

    public void setActionSteps(List<String> actionSteps) {
        this.actionSteps = actionSteps;
    }

    public List<String> getFollowUpQuestions() {
        return followUpQuestions;
    }

    public void setFollowUpQuestions(List<String> followUpQuestions) {
        this.followUpQuestions = followUpQuestions;
    }

    public String getUrgencyLevel() {
        return urgencyLevel;
    }

    public void setUrgencyLevel(String urgencyLevel) {
        this.urgencyLevel = urgencyLevel;
    }

    public List<String> getMatchedKeywords() {
        return matchedKeywords;
    }

    public void setMatchedKeywords(List<String> matchedKeywords) {
        this.matchedKeywords = matchedKeywords;
    }

    public List<DoctorDTO> getSuggestedDoctors() {
        return suggestedDoctors;
    }

    public void setSuggestedDoctors(List<DoctorDTO> suggestedDoctors) {
        this.suggestedDoctors = suggestedDoctors;
    }
}
