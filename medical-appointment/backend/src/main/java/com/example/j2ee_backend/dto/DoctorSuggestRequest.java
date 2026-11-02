package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class DoctorSuggestRequest {
    private String patientAddress;
    private String patientSymptom;

    public DoctorSuggestRequest() {
    }

    public DoctorSuggestRequest(String patientAddress, String patientSymptom) {
        this.patientAddress = patientAddress;
        this.patientSymptom = patientSymptom;
    }

    public String getPatientAddress() {
        return patientAddress;
    }

    public void setPatientAddress(String patientAddress) {
        this.patientAddress = patientAddress;
    }

    public String getPatientSymptom() {
        return patientSymptom;
    }

    public void setPatientSymptom(String patientSymptom) {
        this.patientSymptom = patientSymptom;
    }
}
