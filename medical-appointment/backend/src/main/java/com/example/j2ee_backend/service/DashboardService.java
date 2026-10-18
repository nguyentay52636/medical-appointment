package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.AppointmentDTO;
import com.example.j2ee_backend.dto.DashboardStatsDTO;
import com.example.j2ee_backend.repository.AppointmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {
    private final AppointmentRepository appointmentRepo;

    public DashboardStatsDTO getDashboardStats(Long doctorId) {
        LocalDate today = LocalDate.now();

        Long total = appointmentRepo.countTotalAppointmentsToday(doctorId, today);
        Long pending = appointmentRepo.countPendingAppointmentsToday(doctorId, today);
        Long confirmed = appointmentRepo.countConfirmedAppointmentsToday(doctorId, today);
        Long uniquePatients = appointmentRepo.countUniquePatientsToday(doctorId, today);

        return new DashboardStatsDTO(
                total != null ? total : 0L,
                pending != null ? pending : 0L,
                confirmed != null ? confirmed : 0L,
                uniquePatients != null ? uniquePatients : 0L
        );
    }
    public List<AppointmentDTO> getUpcomingAppointments(Long doctorId) {
        return appointmentRepo.findUpcomingAppointmentsByDoctor(doctorId)
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getMissedAppointments(Long doctorId) {
        return appointmentRepo.findMissedAppointmentsByDoctor(doctorId)
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }
}