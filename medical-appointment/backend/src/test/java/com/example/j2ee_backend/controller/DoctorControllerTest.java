package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.controller.DoctorController;
import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.PasswordChangeRequestDTO;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.example.j2ee_backend.service.AppointmentService;
import com.example.j2ee_backend.service.DoctorService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
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

import java.util.Arrays;
import java.util.Collections;
import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorController.class)
@Import(DoctorControllerTest.TestSecurityConfig.class)
public class DoctorControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper; // Dùng để chuyển Object -> JSON string

    // Mock các Service mà Controller phụ thuộc
    @MockBean
    private DoctorService doctorService;

    @MockBean
    private AppointmentService appointmentService;

    @MockBean
    private DoctorRepository doctorRepository;

    // --- Cấu hình Security cho Test (Bypass Auth) ---
    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    // --- TEST CASES ---

    @Test
    void testLogin_Success() throws Exception {
        // 1. Giả lập dữ liệu
        String email = "doctor@test.com";
        String password = "password123";
        Map<String, String> loginRequest = Map.of("email", email, "password", password);

        Doctor mockDoctor = new Doctor();
        mockDoctor.setId(1);
        mockDoctor.setEmail(email);
        mockDoctor.setFullName("Dr. Strange");

        // 2. Định nghĩa hành vi của Mock Service
        when(doctorService.login(email, password)).thenReturn(mockDoctor);

        // 3. Thực hiện request và kiểm tra kết quả
        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công!"))
                .andExpect(jsonPath("$.doctor.email").value(email));
    }

    @Test
    void testLogin_Failure() throws Exception {
        // Giả lập login thất bại (Service ném lỗi)
        Map<String, String> loginRequest = Map.of("email", "wrong@test.com", "password", "wrong");

        when(doctorService.login(anyString(), anyString()))
                .thenThrow(new RuntimeException("Thông tin đăng nhập không đúng"));

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized()) // Expect 401
                .andExpect(jsonPath("$.message").value("Thông tin đăng nhập không đúng"));
    }

    @Test
    void testGetAllDoctors() throws Exception {
        DoctorDTO doc1 = new DoctorDTO();
        doc1.setFullName("Dr. A");
        DoctorDTO doc2 = new DoctorDTO();
        doc2.setFullName("Dr. B");

        when(doctorService.getAllDoctors()).thenReturn(Arrays.asList(doc1, doc2));

        mockMvc.perform(get("/api/doctor/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].fullName").value("Dr. A"));
    }

    @Test
    void testGetDoctorsBySpecialty() throws Exception {
        when(doctorService.getDoctorsBySpecialtyId(1)).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/doctor/specialty/{id}", 1))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void testHandleAppointmentAction_Confirm() throws Exception {
        // Test case action = "confirm"
        Map<String, String> body = Map.of("action", "confirm");

        // appointmentService trả về void nên dùng doNothing (mặc định của Mockito) hoặc tường minh:
        doNothing().when(appointmentService).confirmAppointment(anyInt(), anyInt());

        mockMvc.perform(post("/api/doctor/{doctorId}/appointments/{appointmentId}/action", 1, 100)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đã xác nhận lịch hẹn."));
    }

    @Test
    void testHandleAppointmentAction_InvalidAction() throws Exception {
        // Test case action sai
        Map<String, String> body = Map.of("action", "delete_database");

        mockMvc.perform(post("/api/doctor/{doctorId}/appointments/{appointmentId}/action", 1, 100)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(body)))
                .andExpect(status().isBadRequest()) // Expect 400
                .andExpect(jsonPath("$.message").value("Hành động không hợp lệ"));
    }

    @Test
    void testChangePassword_Success() throws Exception {
        PasswordChangeRequestDTO requestDTO = new PasswordChangeRequestDTO();
        requestDTO.setOldPassword("old");
        requestDTO.setNewPassword("new");

        doNothing().when(doctorService).changePassword(anyInt(), any(PasswordChangeRequestDTO.class));

        mockMvc.perform(put("/api/doctor/change_password/{id}", 1)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Đổi mật khẩu thành công"));
    }
}