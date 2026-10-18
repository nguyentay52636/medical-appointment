package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.Patient;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class PatientDTO {

    private Integer id;
    private String fullName;
    private String password;
    private String email;
    private String phoneNumber;
    private String address;
    private Timestamp createdAt;

    public PatientDTO(Patient patient) {
        if (patient != null) {
            this.id = patient.getId();
            this.fullName = patient.getFullName();
            this.password = patient.getPassword();
            this.email = patient.getEmail();
            this.phoneNumber = patient.getPhoneNumber();
            this.address = patient.getAddress();
            this.createdAt = patient.getCreatedAt();
        }
    }
}
