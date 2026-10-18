package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
@AllArgsConstructor
public class AppointmentStatisticResponse {
    private long totalAppointments;
    private List<StatisticItem> statistics;
}