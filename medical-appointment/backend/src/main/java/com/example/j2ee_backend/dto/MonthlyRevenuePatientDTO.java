package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class MonthlyRevenuePatientDTO {
    private int month;
    private String monthName; // "Thg 1", "Thg 2", ...
    private Long revenue; // Tổng giá trị (sum of price)
    private Long totalAppointments; // Tổng số lượt khám

    public MonthlyRevenuePatientDTO() {
    }

    public MonthlyRevenuePatientDTO(int month, String monthName, Long revenue, Long totalAppointments) {
        this.month = month;
        this.monthName = monthName;
        this.revenue = revenue;
        this.totalAppointments = totalAppointments;
    }

    public int getMonth() {
        return month;
    }

    public void setMonth(int month) {
        this.month = month;
    }

    public String getMonthName() {
        return monthName;
    }

    public void setMonthName(String monthName) {
        this.monthName = monthName;
    }

    public Long getRevenue() {
        return revenue;
    }

    public void setRevenue(Long revenue) {
        this.revenue = revenue;
    }

    public Long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(Long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }
}