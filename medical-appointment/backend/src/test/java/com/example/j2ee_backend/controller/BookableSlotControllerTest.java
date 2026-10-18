package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.BookableSlotDTO;
import com.example.j2ee_backend.service.BookableSlotService;
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

import java.sql.Date;
import java.sql.Time;
import java.time.LocalDate;
import java.util.Collections;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookableSlotController.class)
@Import(BookableSlotControllerTest.TestSecurityConfig.class)
class BookableSlotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookableSlotService bookableSlotService;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Test
    void testGetSlots_Success() throws Exception {

        Integer doctorId = 5;
        LocalDate localDate = LocalDate.of(2025, 2, 15);

        Date sqlDate = Date.valueOf(localDate);

        Time start1 = Time.valueOf("08:00:00");
        Time end1   = Time.valueOf("08:30:00");

        Time start2 = Time.valueOf("09:00:00");
        Time end2   = Time.valueOf("09:30:00");

        List<BookableSlotDTO> mockList = List.of(
                new BookableSlotDTO(1, doctorId, sqlDate, start1, end1, "available"),
                new BookableSlotDTO(2, doctorId, sqlDate, start2, end2, "available")
        );

        when(bookableSlotService.getSlotsByDoctorAndDate(doctorId, localDate))
                .thenReturn(mockList);

        mockMvc.perform(get("/api/bookable_slots/doctor/{doctorId}/slots", doctorId)
                        .param("date", localDate.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].doctorId").value(doctorId))
                .andExpect(jsonPath("$[0].status").value("available"))
                .andExpect(jsonPath("$[0].startTime").value("08:00:00"))
                .andExpect(jsonPath("$[1].startTime").value("09:00:00"));
    }


    @Test
    void testGetSlots_EmptyList() throws Exception {
        Integer doctorId = 1;
        LocalDate date = LocalDate.of(2025, 1, 10);

        when(bookableSlotService.getSlotsByDoctorAndDate(doctorId, date))
                .thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/bookable_slots/doctor/{doctorId}/slots", doctorId)
                        .param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(0));
    }
}
