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
            this.password = null;
            this.email = patient.getEmail();
            this.phoneNumber = patient.getPhoneNumber();
            this.address = patient.getAddress();
            this.createdAt = patient.getCreatedAt();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
    }
}
