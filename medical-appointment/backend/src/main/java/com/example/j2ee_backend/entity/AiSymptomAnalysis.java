package com.example.j2ee_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "ai_symptom_analysis")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AiSymptomAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;

    @Column(name = "symptoms", columnDefinition = "TEXT", nullable = false)
    private String symptoms;

    @Column(name = "ai_response", columnDefinition = "TEXT")
    private String aiResponse;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "suggested_specialty_id")
    private Specialty suggestedSpecialty;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
    }
}

