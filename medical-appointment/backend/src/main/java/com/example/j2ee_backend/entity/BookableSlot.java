package com.example.j2ee_backend.entity;

import jakarta.persistence.*;
import java.sql.Date;
import java.sql.Time;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity
@Table(name = "bookable_slot")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookableSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "doctor_id", nullable = false)
    private Doctor doctor;

    @Column(name = "slot_date", nullable = false)
    private Date slotDate;

    @Column(name = "start_time", nullable = false)
    private Time startTime;

    @Column(name = "end_time", nullable = false)
    private Time endTime;

    @Column(name = "status", nullable = false)
    private String status; // Giá trị ENUM: 'available', 'booked', 'off'

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "availability_id", nullable = false)
    private DoctorAvailability doctorAvailability;
}