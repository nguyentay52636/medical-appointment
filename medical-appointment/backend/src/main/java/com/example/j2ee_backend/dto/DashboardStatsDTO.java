package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
public class DashboardStatsDTO {

    private Long totalAppointmentsToday;
    private Long pendingAppointments;
    private Long confirmedAppointments;
    private Long totalUniquePatientsToday;

    public DashboardStatsDTO() {
    }

    public DashboardStatsDTO(Long totalAppointmentsToday, Long pendingAppointments, Long confirmedAppointments, Long totalUniquePatientsToday) {
        this.totalAppointmentsToday = totalAppointmentsToday;
        this.pendingAppointments = pendingAppointments;
        this.confirmedAppointments = confirmedAppointments;
        this.totalUniquePatientsToday = totalUniquePatientsToday;
    }

    public Long getTotalAppointmentsToday() {
        return totalAppointmentsToday;
    }

    public void setTotalAppointmentsToday(Long totalAppointmentsToday) {
        this.totalAppointmentsToday = totalAppointmentsToday;
    }

    public Long getPendingAppointments() {
        return pendingAppointments;
    }

    public void setPendingAppointments(Long pendingAppointments) {
        this.pendingAppointments = pendingAppointments;
    }

    public Long getConfirmedAppointments() {
        return confirmedAppointments;
    }

    public void setConfirmedAppointments(Long confirmedAppointments) {
        this.confirmedAppointments = confirmedAppointments;
    }

    public Long getTotalUniquePatientsToday() {
        return totalUniquePatientsToday;
    }

    public void setTotalUniquePatientsToday(Long totalUniquePatientsToday) {
        this.totalUniquePatientsToday = totalUniquePatientsToday;
    }
}