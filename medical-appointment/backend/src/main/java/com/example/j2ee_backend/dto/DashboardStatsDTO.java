package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {

    private Long totalAppointmentsToday;
    private Long pendingAppointments;
    private Long confirmedAppointments;
    private Long totalUniquePatientsToday;

}