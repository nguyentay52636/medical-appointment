package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import java.util.List;

@Data
public class AppointmentStatisticResponse {
    private long totalAppointments;
    private List<StatisticItem> statistics;

    public AppointmentStatisticResponse() {
    }

    public AppointmentStatisticResponse(long totalAppointments, List<StatisticItem> statistics) {
        this.totalAppointments = totalAppointments;
        this.statistics = statistics;
    }

    public long getTotalAppointments() {
        return totalAppointments;
    }

    public void setTotalAppointments(long totalAppointments) {
        this.totalAppointments = totalAppointments;
    }

    public List<StatisticItem> getStatistics() {
        return statistics;
    }

    public void setStatistics(List<StatisticItem> statistics) {
        this.statistics = statistics;
    }
}