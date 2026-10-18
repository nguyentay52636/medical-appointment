package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.SpecialtyDTO;
import com.example.j2ee_backend.service.SpecialtyService;
import com.fasterxml.jackson.databind.ObjectMapper;
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

import java.util.Arrays;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;

@WebMvcTest(SpecialtyController.class)
@Import(SpecialtyControllerTest.TestSecurityConfig.class)
public class SpecialtyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SpecialtyService specialtyService;

    @Autowired
    private ObjectMapper objectMapper;

    // --- Bypass Security ---
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
    // 1. TEST GET ALL SPECIALTIES
    // ============================

    @Test
    void testGetAllSpecialties() throws Exception {
        SpecialtyDTO s1 = new SpecialtyDTO();
        s1.setId(1);
        s1.setSpecialtyName("Cardiology");

        SpecialtyDTO s2 = new SpecialtyDTO();
        s2.setId(2);
        s2.setSpecialtyName("Dermatology");

        when(specialtyService.getAllSpecialties())
                .thenReturn(Arrays.asList(s1, s2));

        mockMvc.perform(get("/api/specialty/all"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].specialtyName").value("Cardiology"))
                .andExpect(jsonPath("$[1].specialtyName").value("Dermatology"));
    }


    // ============================
    // 2. TEST GET SPECIALTY BY ID
    // ============================

    @Test
    void testGetSpecialtyById_Success() throws Exception {
        SpecialtyDTO specialty = new SpecialtyDTO();
        specialty.setId(10);
        specialty.setSpecialtyName("Neurology");

        when(specialtyService.getSpecialtyById(10)).thenReturn(specialty);

        mockMvc.perform(get("/api/specialty/{id}", 10))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(10))
                .andExpect(jsonPath("$.specialtyName").value("Neurology"));
    }

    @Test
    void testGetSpecialtyById_NotFound() throws Exception {

        when(specialtyService.getSpecialtyById(99))
                .thenThrow(new RuntimeException("Không tìm thấy chuyên khoa"));

        mockMvc.perform(get("/api/specialty/99"))
                .andExpect(status().isNotFound());
    }

}

