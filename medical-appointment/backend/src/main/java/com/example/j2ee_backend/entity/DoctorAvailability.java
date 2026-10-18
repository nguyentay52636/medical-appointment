package com.example.j2ee_backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalTime;

import lombok.AllArgsConstructor;
import lombok.Data; // Bao gồm @Getter, @Setter, @ToString, @EqualsAndHashCode
import lombok.NoArgsConstructor;

@Entity
@Table(name = "doctor_availability")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorAvailability {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    @JsonIgnore
    private Doctor doctor;

    @Column(name = "day_of_week", nullable = false)
    private String dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @Column(name = "slot_duration_minutes", nullable = false)
    private Integer slotDurationMinutes;

    @Column(name = "doctor_id", insertable = false, updatable = false)
    private Integer doctorId;
    @Transient // Không lưu vào DB
    public Integer getDoctorId() {
        return doctor != null ? doctor.getId() : null;
    }
    @Column(nullable = false)
    private Boolean active = true;
}