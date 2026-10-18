package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.NotificationCountDTO;
import com.example.j2ee_backend.dto.NotificationDTO;
import com.example.j2ee_backend.service.NotificationService;
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
import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(NotificationController.class)
@Import(NotificationControllerTest.TestSecurityConfig.class)
public class NotificationControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private NotificationService notificationService;

    // --- Bypass Security ---
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

    @Test
    void testGetAllNotifications() throws Exception {
        Integer doctorId = 1;

        List<NotificationDTO> notifications = Arrays.asList(
                new NotificationDTO(1, 1, 1, "Nguyễn Văn A", "Thông báo hệ thống", "Thông báo 1", false, "2025-11-26T16:00:00"),
                new NotificationDTO(2, 1, 2, "Tran Thi B", "Thông báo hệ thống", "Thông báo 2", true, "2025-11-26T16:05:00")
        );

        when(notificationService.getAllNotifications(doctorId)).thenReturn(notifications);

        mockMvc.perform(get("/api/notification/doctor/{doctorId}", doctorId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(1))
                .andExpect(jsonPath("$[0].message").value("Thông báo 1"))
                .andExpect(jsonPath("$[0].read").value(false))
                .andExpect(jsonPath("$[1].id").value(2))
                .andExpect(jsonPath("$[1].message").value("Thông báo 2"))
                .andExpect(jsonPath("$[1].read").value(true));

        verify(notificationService, times(1)).getAllNotifications(doctorId);
    }

    @Test
    void testGetUnreadCounts() throws Exception {
        Integer doctorId = 1;

        NotificationCountDTO countDTO = new NotificationCountDTO(3);

        when(notificationService.getUnreadCounts(doctorId)).thenReturn(countDTO);

        mockMvc.perform(get("/api/notification/doctor/{doctorId}/unread_count", doctorId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notifications").value(3));

        verify(notificationService, times(1)).getUnreadCounts(doctorId);
    }

    @Test
    void testMarkAllAsRead() throws Exception {
        Integer doctorId = 1;

        doNothing().when(notificationService).markAllAsRead(doctorId);

        mockMvc.perform(post("/api/notification/doctor/{doctorId}/mark_all_read", doctorId)
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        verify(notificationService, times(1)).markAllAsRead(doctorId);
    }
}
