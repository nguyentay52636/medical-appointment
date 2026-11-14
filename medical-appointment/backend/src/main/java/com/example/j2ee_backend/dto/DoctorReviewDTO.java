package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.DoctorReview;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorReviewDTO {
    private Integer id;
    private Integer doctorId;
    private String doctorName;
    private Integer patientId;
    private String patientName;
    private String patientEmail;
    private Integer appointmentId;
    private String appointmentCode;
    private Integer rating;
    private String comment;
    private Timestamp createdAt;
    private Timestamp updatedAt;

    public DoctorReviewDTO(DoctorReview review) {
        if (review == null) return;
        this.id = review.getId();
        this.rating = review.getRating();
        this.comment = review.getComment();
        this.createdAt = review.getCreatedAt();
        this.updatedAt = review.getUpdatedAt();

        if (review.getDoctor() != null) {
            this.doctorId = review.getDoctor().getId();
            this.doctorName = review.getDoctor().getFullName();
        }

        if (review.getPatient() != null) {
            this.patientId = review.getPatient().getId();
            this.patientName = review.getPatient().getFullName();
            this.patientEmail = review.getPatient().getEmail();
        }

        if (review.getAppointment() != null) {
            this.appointmentId = review.getAppointment().getId();
            this.appointmentCode = review.getAppointment().getAppointmentCode();
        }
    }
}

