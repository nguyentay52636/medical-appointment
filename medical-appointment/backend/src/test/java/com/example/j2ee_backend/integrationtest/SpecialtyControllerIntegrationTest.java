package com.example.j2ee_backend.integrationtest;

import com.example.j2ee_backend.entity.Specialty;
import com.example.j2ee_backend.repository.SpecialtyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@ActiveProfiles("test")
@Transactional
public class SpecialtyControllerIntegrationTest {

    @TestConfiguration
    static class TestSecurityConfig {
        @Bean
        @Primary
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
            http.csrf(csrf -> csrf.disable())
                    .authorizeHttpRequests(auth -> auth.anyRequest().permitAll());
            return http.build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    private Specialty s1;
    private Specialty s2;

    @BeforeEach
    void setUp() {
        specialtyRepository.deleteAll();

        s1 = new Specialty();
        s1.setSpecialtyName("Da liễu");
        s1 = specialtyRepository.saveAndFlush(s1);

        s2 = new Specialty();
        s2.setSpecialtyName("Tim mạch");
        s2 = specialtyRepository.saveAndFlush(s2);
    }

    @Test
    void testGetAllSpecialties() throws Exception {
        mockMvc.perform(get("/api/specialty/all")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(2)))
                .andExpect(jsonPath("$[0].specialtyName", is("Da liễu")))
                .andExpect(jsonPath("$[1].specialtyName", is("Tim mạch")));
    }

    @Test
    void testGetSpecialtyById_Success() throws Exception {
        mockMvc.perform(get("/api/specialty/{id}", s1.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(s1.getId()))
                .andExpect(jsonPath("$.specialtyName").value("Da liễu"));
    }

    @Test
    void testGetSpecialtyById_NotFound() throws Exception {
        mockMvc.perform(get("/api/specialty/{id}", 999))
                .andExpect(status().isInternalServerError());
    }
}
