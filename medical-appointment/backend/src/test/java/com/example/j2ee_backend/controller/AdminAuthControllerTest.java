package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.entity.Admin;
import com.example.j2ee_backend.repository.AdminRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminAuthController.class)
@Import(AdminAuthControllerTest.TestSecurityConfig.class)
public class AdminAuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AdminRepository adminRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
            http.csrf(AbstractHttpConfigurer::disable)
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }
    }

    private Admin mockAdmin;

    @BeforeEach
    void setUp() {
        mockAdmin = new Admin();
        mockAdmin.setId(1);
        mockAdmin.setUsername("admin");
        mockAdmin.setEmail("admin@medicare.com");
        mockAdmin.setPassword("$2a$10$encryptedPassword");
        mockAdmin.setFullName("Quản Trị Viên Hệ Thống");
        mockAdmin.setRole("admin");
        mockAdmin.setPhoneNumber("0901234567");
    }

    @Test
    @DisplayName("Đăng nhập thành công với tài khoản admin hợp lệ và mật khẩu chính xác")
    void testLoginSuccess() throws Exception {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(mockAdmin));
        when(passwordEncoder.matches("admin123", mockAdmin.getPassword())).thenReturn(true);

        Map<String, String> request = Map.of(
                "usernameOrEmail", "admin",
                "password", "admin123"
        );

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Đăng nhập quản trị viên thành công!"))
                .andExpect(jsonPath("$.admin.username").value("admin"))
                .andExpect(jsonPath("$.admin.role").value("admin"))
                .andExpect(jsonPath("$.token").exists());
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi tài khoản không tồn tại")
    void testLoginAdminNotFound() throws Exception {
        when(adminRepository.findByUsername(anyString())).thenReturn(Optional.empty());
        when(adminRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        Map<String, String> request = Map.of(
                "usernameOrEmail", "unknown_user",
                "password", "password123"
        );

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Tài khoản quản trị viên không tồn tại trong hệ thống!"));
    }

    @Test
    @DisplayName("Đăng nhập thất bại khi sai mật khẩu")
    void testLoginWrongPassword() throws Exception {
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(mockAdmin));
        when(passwordEncoder.matches("wrong_pass", mockAdmin.getPassword())).thenReturn(false);

        Map<String, String> request = Map.of(
                "usernameOrEmail", "admin",
                "password", "wrong_pass"
        );

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("Mật khẩu quản trị viên không chính xác!"));
    }

    @Test
    @DisplayName("Từ chối truy cập khi tài khoản không có role admin (403 Forbidden)")
    void testLoginForbiddenNonAdminRole() throws Exception {
        mockAdmin.setRole("patient"); // Role không phải admin
        when(adminRepository.findByUsername("admin")).thenReturn(Optional.of(mockAdmin));
        when(passwordEncoder.matches("admin123", mockAdmin.getPassword())).thenReturn(true);

        Map<String, String> request = Map.of(
                "usernameOrEmail", "admin",
                "password", "admin123"
        );

        mockMvc.perform(post("/api/admin/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Tài khoản của bạn không có quyền Quản trị viên (Admin)!"));
    }

    @Test
    @DisplayName("Kiểm tra endpoint check trả về UP")
    void testCheckEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/check"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"));
    }
}
