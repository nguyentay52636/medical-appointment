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
        this.id = doctorAvailability.getId();
        this.doctorId = doctorAvailability.getDoctor().getId();
        this.dayOfWeek = doctorAvailability.getDayOfWeek();
        this.startTime = doctorAvailability.getStartTime();
        this.endTime = doctorAvailability.getEndTime();
        this.slotDurationMinutes = doctorAvailability.getSlotDurationMinutes();
        this.active = doctorAvailability.getActive();
    }
}
