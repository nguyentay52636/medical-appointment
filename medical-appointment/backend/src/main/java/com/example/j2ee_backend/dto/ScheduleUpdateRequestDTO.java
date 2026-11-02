package com.example.j2ee_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ScheduleUpdateRequestDTO {
    private String dayOfWeek;
    private List<DoctorAvailabilityDTO> slots;

    public String getDayOfWeek() {
        return dayOfWeek;
    }

    public void setDayOfWeek(String dayOfWeek) {
        this.dayOfWeek = dayOfWeek;
    }

    public List<DoctorAvailabilityDTO> getSlots() {
        return slots;
    }

    public void setSlots(List<DoctorAvailabilityDTO> slots) {
        this.slots = slots;
    }
}
