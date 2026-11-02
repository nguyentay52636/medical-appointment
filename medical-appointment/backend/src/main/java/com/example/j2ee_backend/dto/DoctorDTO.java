package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.Doctor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@Builder
@AllArgsConstructor
public class DoctorDTO {

    private Integer id;
    private String fullName;
    private String email;
    private String phoneNumber;
    private Integer specialtyId;
    private String specialtyName; // chỉ lấy tên chuyên khoa thay vì object
    private String imageUrl;
    private Integer experienceYears;
    private Integer pricePerAppointment;
    private String bio;
    private String address;
    private Timestamp createdAt;
    private Double lat;
    private Double lng;

    public DoctorDTO(Doctor doctor) {
        if (doctor == null) return;
        this.id = doctor.getId();
        this.fullName = doctor.getFullName();
        this.email = doctor.getEmail();
        this.phoneNumber = doctor.getPhoneNumber();
        this.imageUrl = doctor.getImageUrl();
        this.experienceYears = doctor.getExperienceYears();
        this.pricePerAppointment = doctor.getPricePerAppointment();
        this.bio = doctor.getBio();
        this.address = doctor.getAddress();
        this.createdAt = doctor.getCreatedAt();
        this.lat = doctor.getLat();
        this.lng = doctor.getLng();

        if (doctor.getSpecialty() != null) {
            this.specialtyId = doctor.getSpecialty().getId();
            this.specialtyName = doctor.getSpecialty().getSpecialtyName();
        }
    }

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public Integer getSpecialtyId() { return specialtyId; }
    public void setSpecialtyId(Integer specialtyId) { this.specialtyId = specialtyId; }

    public String getSpecialtyName() { return specialtyName; }
    public void setSpecialtyName(String specialtyName) { this.specialtyName = specialtyName; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }

    public Integer getExperienceYears() { return experienceYears; }
    public void setExperienceYears(Integer experienceYears) { this.experienceYears = experienceYears; }

    public Integer getPricePerAppointment() { return pricePerAppointment; }
    public void setPricePerAppointment(Integer pricePerAppointment) { this.pricePerAppointment = pricePerAppointment; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Double getLat() { return lat; }
    public void setLat(Double lat) { this.lat = lat; }

    public Double getLng() { return lng; }
    public void setLng(Double lng) { this.lng = lng; }
}
