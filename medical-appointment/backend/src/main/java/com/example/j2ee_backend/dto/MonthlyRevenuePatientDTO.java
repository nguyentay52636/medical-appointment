package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MonthlyRevenuePatientDTO {
    private int month;
    private String monthName; // "Thg 1", "Thg 2", ...
    private Long revenue; // Tổng giá trị (sum of price)
    private Long totalAppointments; // Tổng số lượt khám
}