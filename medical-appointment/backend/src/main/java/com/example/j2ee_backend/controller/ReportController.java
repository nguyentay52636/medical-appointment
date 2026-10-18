package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.service.AppointmentService;
import com.example.j2ee_backend.service.DoctorService;
import com.example.j2ee_backend.service.ReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/report")
@RequiredArgsConstructor
public class ReportController {

    private final AppointmentService appointmentService;
    private final DoctorService doctorService;
    private final ReportService reportService;

    @GetMapping("/appointment/{id}")
    public ResponseEntity<byte[]> printAppointment(@PathVariable Integer id) throws Exception {

        Appointment appointment = appointmentService.findById(id);
        Doctor doctor = doctorService.findById(appointment.getBookableSlot().getDoctor().getId());

        try {
            byte[] pdfBytes = reportService.generateAppointmentReport(appointment, doctor);

            return ResponseEntity.ok()
                    .header("Content-Type", "application/pdf")
                    .header("Content-Disposition", "inline; filename=Lich_Kham" + id + ".pdf")
                    .body(pdfBytes);
        } catch (Exception e) {
            e.printStackTrace(); // In log lỗi ra console
            return ResponseEntity.internalServerError().body(null);
        }
    }
}


