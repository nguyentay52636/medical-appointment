package com.example.j2ee_backend.dto;

import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
public class ScheduleUpdateRequestDTO {
    private String dayOfWeek;
    private List<DoctorAvailabilityDTO> slots;
}
