package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorSuggestRequest {
    private String patientAddress;
    private String patientSymptom;
}
