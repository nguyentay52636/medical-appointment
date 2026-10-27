package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleSummaryDTO {
    private Integer doctorId;
    private Double totalWeeklyHours;
    private Integer activeDaysCount;
    private Double minRequiredHours;
    private Integer minRequiredDays;
    private Boolean isCompliant;
    private List<String> workingDays;
    private List<String> workingDaysVi;
    private String complianceMessage;
}
