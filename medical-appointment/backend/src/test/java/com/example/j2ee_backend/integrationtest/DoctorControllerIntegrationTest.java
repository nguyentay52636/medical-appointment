package com.example.j2ee_backend.integrationtest;

import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.Specialty;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.example.j2ee_backend.repository.SpecialtyRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public class DoctorControllerIntegrationTest {

    // --- Tắt Security/CSRF và tạo PasswordEncoder cho test ---
    @TestConfiguration
    @EnableWebSecurity
    static class TestSecurityConfig {

        @Bean
        @Primary
        public PasswordEncoder passwordEncoder() {
            return new BCryptPasswordEncoder();
        }

        @Bean
        @Primary
        public WebSecurityCustomizer webSecurityCustomizer() {
            return web -> web.ignoring().requestMatchers("/**");
        }

        @Bean
        @Primary
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http
                    .csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    private Doctor testDoctor;
    private static final String TEST_EMAIL = "test@example.com";
    private static final String TEST_PASSWORD = "password123";
    private static final String TEST_FULL_NAME = "Dr. Test";
    private static final String TEST_PHONE = "0123456789";

    @BeforeEach
    void setUp() {
        // --- Xóa dữ liệu cũ theo thứ tự đúng ---
        doctorRepository.deleteAll();
        specialtyRepository.deleteAll();
        doctorRepository.flush();
        specialtyRepository.flush();

        // --- Tạo Specialty ---
        Specialty specialty = new Specialty();
        specialty.setSpecialtyName("Da liễu");
        specialty = specialtyRepository.saveAndFlush(specialty);

        // --- Tạo doctor test ---
        testDoctor = new Doctor();
        testDoctor.setFullName(TEST_FULL_NAME);
        testDoctor.setEmail(TEST_EMAIL);
        testDoctor.setPassword(passwordEncoder.encode(TEST_PASSWORD));
        testDoctor.setPhoneNumber(TEST_PHONE);
        testDoctor.setExperienceYears(5);
        testDoctor.setPricePerAppointment(200000);
        testDoctor.setSpecialty(specialty);
        testDoctor.setBio("Chuyên khoa da liễu");

        testDoctor = doctorRepository.saveAndFlush(testDoctor);
    }

    // --- TEST CASES ---

    @Test
    void testLoginSuccess() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", TEST_EMAIL);
        request.put("password", TEST_PASSWORD);

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Đăng nhập thành công!"))
                .andExpect(jsonPath("$.doctor").exists())
                .andExpect(jsonPath("$.doctor.email").value(TEST_EMAIL))
                .andExpect(jsonPath("$.doctor.fullName").value(TEST_FULL_NAME))
                .andExpect(jsonPath("$.doctor.phoneNumber").value(TEST_PHONE))
                .andExpect(jsonPath("$.doctor.id").value(notNullValue()));
    }

    @Test
    void testLoginFailure_WrongPassword() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", TEST_EMAIL);
        request.put("password", "wrongpassword");

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Mật khẩu không đúng. Vui lòng nhập lại!"));
    }

    @Test
    void testLoginFailure_WrongEmail() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "wrong@example.com");
        request.put("password", TEST_PASSWORD);

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().isUnauthorized())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.message").value("Email không đúng. Vui lòng nhập lại!"));
    }

    @Test
    void testLoginFailure_EmptyEmail() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", "");
        request.put("password", TEST_PASSWORD);

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testLoginFailure_EmptyPassword() throws Exception {
        Map<String, String> request = new HashMap<>();
        request.put("email", TEST_EMAIL);
        request.put("password", "");

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testLoginFailure_NullCredentials() throws Exception {
        Map<String, Object> request = new HashMap<>();
        request.put("email", null);
        request.put("password", null);

        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andDo(print())
                .andExpect(status().is4xxClientError());
    }

    @Test
    void testLoginFailure_InvalidJson() throws Exception {
        mockMvc.perform(post("/api/doctor/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{invalid json}"))
                .andDo(print())
                .andExpect(status().isBadRequest());
    }
}
