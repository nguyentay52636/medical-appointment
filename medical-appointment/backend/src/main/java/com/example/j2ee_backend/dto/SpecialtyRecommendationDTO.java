package com.example.j2ee_backend.dto;

public class SpecialtyRecommendationDTO {
    private Integer specialtyId;
    private String specialtyName;
    private String departmentCode;
    private int matchScore;
    private String reason;

    public SpecialtyRecommendationDTO() {}

    public SpecialtyRecommendationDTO(Integer specialtyId, String specialtyName, String departmentCode, int matchScore, String reason) {
        this.specialtyId = specialtyId;
        this.specialtyName = specialtyName;
        this.departmentCode = departmentCode;
        this.matchScore = matchScore;
        this.reason = reason;
    }

    public Integer getSpecialtyId() {
        return specialtyId;
    }

    public void setSpecialtyId(Integer specialtyId) {
        this.specialtyId = specialtyId;
    }

    public String getSpecialtyName() {
        return specialtyName;
    }

    public void setSpecialtyName(String specialtyName) {
        this.specialtyName = specialtyName;
    }

    public String getDepartmentCode() {
        return departmentCode;
    }

    public void setDepartmentCode(String departmentCode) {
        this.departmentCode = departmentCode;
    }

    public int getMatchScore() {
        return matchScore;
    }

    public void setMatchScore(int matchScore) {
        this.matchScore = matchScore;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }
}
