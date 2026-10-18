package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.ScheduleUpdateRequestDTO;
import com.example.j2ee_backend.entity.DoctorAvailability;
import com.example.j2ee_backend.service.DoctorAvailabilityService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
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

import java.util.Arrays;
import java.util.Collections;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DoctorAvailabilityController.class)
@Import(DoctorAvailabilityControllerTest.TestSecurityConfig.class)
public class DoctorAvailabilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DoctorAvailabilityService doctorAvailabilityService;

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

    // ===================================
    // 1. GET /schedule -> Có dữ liệu
    // ===================================

    @Test
    void testGetSchedule_Success() throws Exception {
        DoctorAvailability a1 = new DoctorAvailability();
        a1.setId(1);
        DoctorAvailability a2 = new DoctorAvailability();
        a2.setId(2);

        when(doctorAvailabilityService.findByDoctorId(10))
                .thenReturn(Arrays.asList(a1, a2));

        mockMvc.perform(get("/api/availability/schedule")
                        .param("doctorId", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    // ===================================
    // 2. GET /schedule -> Không có dữ liệu (204)
    // ===================================

    @Test
    void testGetSchedule_NoContent() throws Exception {
        when(doctorAvailabilityService.findByDoctorId(10))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/availability/schedule")
                        .param("doctorId", "10"))
                .andExpect(status().isNoContent());
    }

    // ===================================
    // 3. POST /update -> Update thành công
    // ===================================

    @Test
    void testUpdateSchedule_Success() throws Exception {
        ScheduleUpdateRequestDTO request = new ScheduleUpdateRequestDTO();
        // bỏ trống nếu DTO không yêu cầu gì

        doNothing().when(doctorAvailabilityService)
                .updateDaySchedule(eq(10), any(ScheduleUpdateRequestDTO.class));

        mockMvc.perform(post("/api/availability/update")
                        .param("doctorId", "10")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Cập nhật lịch thành công!"));
    }

    // ===================================
    // 4. POST /update -> Lỗi (400)
    // ===================================

    @Test
    void testUpdateSchedule_Failed() throws Exception {
        ScheduleUpdateRequestDTO request = new ScheduleUpdateRequestDTO();

        doThrow(new RuntimeException("Sai dữ liệu"))
                .when(doctorAvailabilityService)
                .updateDaySchedule(eq(10), any(ScheduleUpdateRequestDTO.class));

        mockMvc.perform(post("/api/availability/update")
                        .param("doctorId", "10")
                        .contentType("application/json")
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(content().string("Lỗi: Sai dữ liệu"));
    }
}

