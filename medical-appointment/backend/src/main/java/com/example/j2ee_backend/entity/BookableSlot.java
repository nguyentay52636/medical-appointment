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

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public Doctor getDoctor() { return doctor; }
    public void setDoctor(Doctor doctor) { this.doctor = doctor; }

    public Date getSlotDate() { return slotDate; }
    public void setSlotDate(Date slotDate) { this.slotDate = slotDate; }

    public Time getStartTime() { return startTime; }
    public void setStartTime(Time startTime) { this.startTime = startTime; }

    public Time getEndTime() { return endTime; }
    public void setEndTime(Time endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public DoctorAvailability getDoctorAvailability() { return doctorAvailability; }
    public void setDoctorAvailability(DoctorAvailability doctorAvailability) { this.doctorAvailability = doctorAvailability; }
}