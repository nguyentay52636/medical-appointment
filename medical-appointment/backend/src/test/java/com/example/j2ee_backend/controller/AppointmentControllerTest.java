package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.AppointmentDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.service.AppointmentService;
import com.example.j2ee_backend.service.PatientService;
import com.example.j2ee_backend.service.BookableSlotService;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AppointmentController.class)
@Import(AppointmentControllerTest.TestSecurityConfig.class)
public class AppointmentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private PatientService patientService;

    @MockBean
    private BookableSlotService bookableSlotService;

    @Autowired
    private ObjectMapper objectMapper;

    // Bypass security
    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    // =======================================================
    // 1. GET /doctor/{doctorId} — Lấy danh sách appointment
    // =======================================================
    @Test
    void testGetAppointments_Success() throws Exception {

        AppointmentDTO a1 = new AppointmentDTO();
        a1.setId(1);

        AppointmentDTO a2 = new AppointmentDTO();
        a2.setId(2);

        when(appointmentService.getAppointmentsByDoctorId(10))
                .thenReturn(Arrays.asList(a1, a2));

        mockMvc.perform(get("/api/appointment/doctor/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    void testGetAppointments_Fail() throws Exception {

        when(appointmentService.getAppointmentsByDoctorId(10))
                .thenThrow(new RuntimeException("Lỗi bất ngờ"));

        mockMvc.perform(get("/api/appointment/doctor/10"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Lỗi bất ngờ"));
    }

    // =======================================================
    // 2. GET /doctor/{doctorId}/{appointmentId} — Chi tiết
    // =======================================================
    @Test
    void testGetAppointmentDetail_Success() throws Exception {

        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(5);

        when(appointmentService.getAppointmentDetail(10, 5))
                .thenReturn(dto);

        mockMvc.perform(get("/api/appointment/doctor/10/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(5));
    }

    @Test
    void testGetAppointmentDetail_NotFound() throws Exception {

        when(appointmentService.getAppointmentDetail(10, 5))
                .thenReturn(null);

        mockMvc.perform(get("/api/appointment/doctor/10/5"))
                .andExpect(status().isNotFound());
    }

    // =======================================================
    // 3. GET /patient/{patientId}
    // =======================================================
    @Test
    void testGetAppointmentsByPatient_Success() throws Exception {

        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(123);

        when(appointmentService.getAppointmentsByPatientId(20))
                .thenReturn(Collections.singletonList(dto));

        mockMvc.perform(get("/api/appointment/patient/20"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(123));
    }

    @Test
    void testGetAppointmentsByPatient_Fail() throws Exception {

        when(appointmentService.getAppointmentsByPatientId(20))
                .thenThrow(new RuntimeException("Lỗi db"));

        mockMvc.perform(get("/api/appointment/patient/20"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Lỗi db"));
    }

    // =======================================================
    // 4. PUT /reschedule/{id}
    // =======================================================
    @Test
    void testRescheduleAppointment_Success() throws Exception {

        Appointment appointment = new Appointment();
        appointment.setId(7);

        Map<String, String> request = new HashMap<>();
        request.put("date", "2025-01-10");
        request.put("time", "09:30");

        when(appointmentService.rescheduleAppointment(
                eq(7),
                eq(LocalDate.parse("2025-01-10")),
                eq(LocalTime.parse("09:30"))
        )).thenReturn(appointment);

        mockMvc.perform(put("/api/appointment/reschedule/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Dời lịch thành công"));
    }

    @Test
    void testRescheduleAppointment_Fail() throws Exception {

        Map<String, String> request = new HashMap<>();
        request.put("date", "2025-01-10");
        request.put("time", "09:30");

        when(appointmentService.rescheduleAppointment(anyInt(), any(), any()))
                .thenThrow(new RuntimeException("Giờ không hợp lệ"));

        mockMvc.perform(put("/api/appointment/reschedule/7")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Giờ không hợp lệ"));
    }

    // =======================================================
    // 5. PUT /expired/{id}
    // =======================================================
    @Test
    void testAutoExpireAppointment() throws Exception {

        doNothing().when(appointmentService).updateExpiredAppointment(9);

        mockMvc.perform(put("/api/appointment/expired/9"))
                .andExpect(status().isOk());
    }

    // =======================================================
    // 6. POST /save
    // =======================================================
    @Test
    void testBookAppointment() throws Exception {

        AppointmentDTO dto = new AppointmentDTO();
        dto.setId(100);

        when(appointmentService.createAppointment(any()))
                .thenReturn(Map.of("message", "Đặt lịch thành công"));

        mockMvc.perform(post("/api/appointment/save")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đặt lịch thành công"));
    }

    // =======================================================
    // 7. POST /doctor/{doctorId}/reject/{appointmentId}
    // =======================================================
    @Test
    void testRejectAppointment_Success() throws Exception {

        doNothing().when(appointmentService).rejectAppointment(5, 10);

        mockMvc.perform(post("/api/appointment/doctor/10/reject/5"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã hủy lịch hẹn và hoàn tiền nếu cần"));
    }

    @Test
    void testRejectAppointment_Fail() throws Exception {

        doThrow(new RuntimeException("Không thể hủy"))
                .when(appointmentService).rejectAppointment(5, 10);

        mockMvc.perform(post("/api/appointment/doctor/10/reject/5"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.message").value("Không thể hủy"));
    }
}
