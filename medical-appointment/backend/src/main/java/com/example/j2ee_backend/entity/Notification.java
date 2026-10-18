package com.example.j2ee_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notification")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // Ai nhận thông báo
    @ManyToOne
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    // Ai gửi / bệnh nhân liên quan
    @ManyToOne
    @JoinColumn(name = "patient_id")
    private Patient patient;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String message;

    private boolean isRead = false;

    private LocalDateTime createdAt = LocalDateTime.now();
}
