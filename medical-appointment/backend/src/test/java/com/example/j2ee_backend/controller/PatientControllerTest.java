package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.PasswordChangeRequestDTO;
import com.example.j2ee_backend.dto.PatientDTO;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.service.PatientService;
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

import java.util.Map;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(PatientController.class)
@Import(PatientControllerTest.TestSecurityConfig.class)
public class PatientControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private PatientService patientService;

    // Bypass Security cho test
    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    // ============================
    // 1. TEST LOGIN
    // ============================

    @Test
    void testLogin_Success() throws Exception {
        String email = "patient@test.com";
        String password = "123456";

        Map<String, String> loginRequest = Map.of("email", email, "password", password);

        Patient mockPatient = new Patient();
        mockPatient.setId(1);
        mockPatient.setEmail(email);
        mockPatient.setFullName("Patient A");

        when(patientService.login(email, password)).thenReturn(mockPatient);

        mockMvc.perform(post("/api/patient/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công!"))
                .andExpect(jsonPath("$.patient.email").value(email));
    }

    @Test
    void testLogin_Failure() throws Exception {
        Map<String, String> loginRequest = Map.of("email", "wrong@test.com", "password", "wrongpw");

        when(patientService.login(anyString(), anyString()))
                .thenThrow(new RuntimeException("Sai thông tin đăng nhập"));

        mockMvc.perform(post("/api/patient/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Sai thông tin đăng nhập"));
    }

    // ============================
    // 2. TEST REGISTER
    // ============================

    @Test
    void testRegister_Fail_PhoneExists() throws Exception {
        PatientDTO dto = new PatientDTO();
        dto.setPhoneNumber("0123456789");
        dto.setEmail("test@mail.com");

        when(patientService.existsByPhoneNumber(dto.getPhoneNumber())).thenReturn(true);

        mockMvc.perform(post("/api/patient/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Số điện thoại đã được sử dụng"));
    }

    @Test
    void testRegister_Fail_EmailExists() throws Exception {
        PatientDTO dto = new PatientDTO();
        dto.setPhoneNumber("0123456789");
        dto.setEmail("test@mail.com");

        when(patientService.existsByPhoneNumber(dto.getPhoneNumber())).thenReturn(false);
        when(patientService.existsByEmail(dto.getEmail())).thenReturn(true);

        mockMvc.perform(post("/api/patient/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Email đã được sử dụng"));
    }

    @Test
    void testRegister_Success() throws Exception {
        PatientDTO dto = new PatientDTO();
        dto.setPhoneNumber("0123456789");
        dto.setEmail("test@mail.com");
        dto.setFullName("New Patient");

        Patient saved = new Patient();
        saved.setId(10);
        saved.setEmail(dto.getEmail());
        saved.setFullName(dto.getFullName());

        when(patientService.existsByPhoneNumber(dto.getPhoneNumber())).thenReturn(false);
        when(patientService.existsByEmail(dto.getEmail())).thenReturn(false);
        when(patientService.registerPatient(dto)).thenReturn(saved);

        mockMvc.perform(post("/api/patient/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đăng ký thành công!"))
                .andExpect(jsonPath("$.patient.id").value(10))
                .andExpect(jsonPath("$.patient.email").value("test@mail.com"));
    }

    // ============================
    // 3. TEST UPDATE PATIENT
    // ============================

    @Test
    void testUpdatePatient_Success() throws Exception {
        PatientDTO dto = new PatientDTO();
        dto.setFullName("Updated Name");

        Patient updated = new Patient();
        updated.setId(1);
        updated.setFullName("Updated Name");

        when(patientService.updatePatient(eq(1), any(PatientDTO.class)))
                .thenReturn(updated);

        mockMvc.perform(put("/api/patient/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fullName").value("Updated Name"));
    }

    @Test
    void testUpdatePatient_Failure() throws Exception {
        PatientDTO dto = new PatientDTO();
        dto.setFullName("Name");

        when(patientService.updatePatient(eq(1), any(PatientDTO.class)))
                .thenThrow(new RuntimeException("Không tìm thấy bệnh nhân"));

        mockMvc.perform(put("/api/patient/update/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Không tìm thấy bệnh nhân"));
    }

    // ============================
    // 4. CHANGE PASSWORD
    // ============================

    @Test
    void testChangePassword_Success() throws Exception {
        PasswordChangeRequestDTO requestDTO = new PasswordChangeRequestDTO();
        requestDTO.setOldPassword("old");
        requestDTO.setNewPassword("new");

        doNothing().when(patientService).changePassword(eq(1), any(PasswordChangeRequestDTO.class));

        mockMvc.perform(put("/api/patient/change_password/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestDTO)))
                .andExpect(status().isOk())
                .andExpect(content().string("Đổi mật khẩu thành công"));
    }

    @Test
    void testChangePassword_Failure() throws Exception {
        PasswordChangeRequestDTO dto = new PasswordChangeRequestDTO();
        dto.setOldPassword("old");
        dto.setNewPassword("new");

        doThrow(new RuntimeException("Mật khẩu cũ không đúng"))
                .when(patientService).changePassword(eq(1), any(PasswordChangeRequestDTO.class));

        mockMvc.perform(put("/api/patient/change_password/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Mật khẩu cũ không đúng"));
    }
}
