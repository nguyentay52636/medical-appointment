package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
public class DetailedReportResponse {
    private Long totalRevenue;
    private List<AppointmentDetailDTO> appointments;

    public DetailedReportResponse() {
    }

    public DetailedReportResponse(Long totalRevenue, List<AppointmentDetailDTO> appointments) {
        this.totalRevenue = totalRevenue;
        this.appointments = appointments;
    }

    public Long getTotalRevenue() {
        return totalRevenue;
    }

    public void setTotalRevenue(Long totalRevenue) {
        this.totalRevenue = totalRevenue;
    }

    public List<AppointmentDetailDTO> getAppointments() {
        return appointments;
    }

    public void setAppointments(List<AppointmentDetailDTO> appointments) {
        this.appointments = appointments;
    }
}