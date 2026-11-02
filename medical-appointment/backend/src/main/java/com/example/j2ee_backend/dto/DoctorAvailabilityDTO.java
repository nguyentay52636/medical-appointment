package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.DoctorAvailability;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalTime;

@Data
@NoArgsConstructor
public class DoctorAvailabilityDTO {

    private Integer id;
    private Integer doctorId;
    private String dayOfWeek;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer slotDurationMinutes;
    private Boolean active;

    public DoctorAvailabilityDTO(DoctorAvailability doctorAvailability) {
        if (doctorAvailability != null) {
            this.id = doctorAvailability.getId();
            this.doctorId = doctorAvailability.getDoctor() != null ? doctorAvailability.getDoctor().getId() : null;
            this.dayOfWeek = doctorAvailability.getDayOfWeek();
            this.startTime = doctorAvailability.getStartTime();
            this.endTime = doctorAvailability.getEndTime();
            this.slotDurationMinutes = doctorAvailability.getSlotDurationMinutes();
            this.active = doctorAvailability.getActive();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public LocalTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalTime startTime) {
        this.startTime = startTime;
    }

    public LocalTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalTime endTime) {
        this.endTime = endTime;
    }

    public Integer getSlotDurationMinutes() {
        return slotDurationMinutes;
    }

    public void setSlotDurationMinutes(Integer slotDurationMinutes) {
        this.slotDurationMinutes = slotDurationMinutes;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }
}
