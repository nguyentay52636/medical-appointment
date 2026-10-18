package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.service.AppointmentService;
import com.example.j2ee_backend.service.DoctorService;
import com.example.j2ee_backend.service.ReportService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ReportController.class)
@Import(ReportControllerTest.TestSecurityConfig.class)
public class ReportControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private DoctorService doctorService;

    @MockBean
    private ReportService reportService;

    // --- Bypass security ---
    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void testPrintAppointment_Success() throws Exception {
        // --- chuẩn bị dữ liệu giả ---
        Integer appointmentId = 1;

        // Doctor giả
        Doctor doctor = new Doctor();
        doctor.setId(10);
        doctor.setFullName("Dr. Test");

        // BookableSlot giả
        BookableSlot slot = new BookableSlot();
        slot.setDoctor(doctor);

        // Appointment giả
        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setBookableSlot(slot);

        // PDF giả
        byte[] pdfBytes = "PDF_DATA".getBytes();

        // --- Mock behavior ---
        when(appointmentService.findById(appointmentId)).thenReturn(appointment);
        when(doctorService.findById(doctor.getId())).thenReturn(doctor);
        when(reportService.generateAppointmentReport(appointment, doctor)).thenReturn(pdfBytes);

        // --- Thực hiện request ---
        mockMvc.perform(get("/api/report/appointment/{id}", appointmentId))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition", "inline; filename=Lich_Kham" + appointmentId + ".pdf"))
                .andExpect(content().bytes(pdfBytes));

        // --- Verify ---
        verify(appointmentService, times(1)).findById(appointmentId);
        verify(doctorService, times(1)).findById(doctor.getId());
        verify(reportService, times(1)).generateAppointmentReport(appointment, doctor);
    }

    @Test
    void testPrintAppointment_Failure() throws Exception {
        Integer appointmentId = 1;

        // Mock service ném exception
        when(appointmentService.findById(appointmentId)).thenThrow(new RuntimeException("Not found"));

        mockMvc.perform(get("/api/report/appointment/{id}", appointmentId))
                .andExpect(status().isInternalServerError());

        verify(appointmentService, times(1)).findById(appointmentId);
        verifyNoInteractions(doctorService, reportService);
    }
}
