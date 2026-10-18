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

    // dùng contructor để map dữ liệu từ entity sang dto
    public DoctorDTO(Doctor doctor) {
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

        // Nếu specialty có thể null, kiểm tra trước khi lấy tên
        if (doctor.getSpecialty() != null) {
            this.specialtyId = doctor.getSpecialty().getId();
            this.specialtyName = doctor.getSpecialty().getSpecialtyName();
        }
    }
}
