package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.AppointmentDTO;
import com.example.j2ee_backend.dto.DashboardStatsDTO;
import com.example.j2ee_backend.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/dashboard")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<DashboardStatsDTO> getStats(@RequestParam Long doctorId) {
        DashboardStatsDTO stats = dashboardService.getDashboardStats(doctorId);
        return ResponseEntity.ok(stats);
    }
    @GetMapping("/upcoming")
    public ResponseEntity<List<AppointmentDTO>> getUpcomingAppointments(@RequestParam Long doctorId) {
        List<AppointmentDTO> upcomingAppointments = dashboardService.getUpcomingAppointments(doctorId);
        return ResponseEntity.ok(upcomingAppointments);
    }
    @GetMapping("/missed")
    public ResponseEntity<List<AppointmentDTO>> getMissedAppointments(@RequestParam Long doctorId) {
        List<AppointmentDTO> missedAppointments = dashboardService.getMissedAppointments(doctorId);
        return ResponseEntity.ok(missedAppointments);
    }
}

