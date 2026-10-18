package com.example.j2ee_backend.integrationtest;

import com.example.j2ee_backend.entity.*;
import com.example.j2ee_backend.repository.*;
import com.example.j2ee_backend.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Time;
import java.sql.Timestamp;
import java.time.LocalDateTime;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@ActiveProfiles("test")
@Transactional
public class ReportControllerIntegrationTest {

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
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private BookableSlotRepository bookableSlotRepository;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    @Autowired
    private DoctorAvailabilityRepository doctorAvailabilityRepository;

    @MockBean
    private ReportService reportService;

    private Doctor doctor;
    private Patient patient;
    private BookableSlot slot;
    private Appointment appointment;
    private Specialty specialty;

    @BeforeEach
    void setUp() throws Exception {
        // Xóa dữ liệu cũ
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        bookableSlotRepository.deleteAll();
        appointmentRepository.deleteAll();
        specialtyRepository.deleteAll();
        doctorAvailabilityRepository.deleteAll();

        // Tạo Specialty cho Doctor
        Specialty specialty = new Specialty();
        specialty.setSpecialtyName("Da liễu");
        specialty = specialtyRepository.saveAndFlush(specialty);

        // --- tạo Doctor ---
        doctor = new Doctor();
        doctor.setFullName("Dr. Test");
        doctor.setEmail("doctor@test.com");
        doctor.setPassword("password");
        doctor.setPhoneNumber("0123456789");
        doctor.setSpecialty(specialty);
        doctor.setCreatedAt(Timestamp.valueOf(LocalDateTime.now()));
        doctor.setExperienceYears(5);
        doctor.setPricePerAppointment(200000);
        doctor = doctorRepository.saveAndFlush(doctor);

        // --- tạo Patient ---
        patient = new Patient();
        patient.setFullName("Nguyen Van A");
        patient.setEmail("patient@test.com");
        patient.setPassword("123456");
        patient.setAddress("Võ Văn Kiệt");
        patient.setPhoneNumber("0999888777");
        patient = patientRepository.saveAndFlush(patient);

        // Tạo availability cho doctor
        DoctorAvailability availability = new DoctorAvailability();
        availability.setDoctor(doctor);
        availability.setId(1);
        availability.setDayOfWeek("monday");
        availability.setStartTime(Time.valueOf("09:00:00").toLocalTime());
        availability.setEndTime(Time.valueOf("17:00:00").toLocalTime());
        availability.setSlotDurationMinutes(30);
        availability.setActive(true);
        doctorAvailabilityRepository.saveAndFlush(availability);

        // --- tạo BookableSlot ---
        slot = new BookableSlot();
        slot.setDoctor(doctor);
        slot.setDoctorAvailability(availability);
        slot.setSlotDate(Date.valueOf("2025-11-26"));
        slot.setStartTime(Time.valueOf("09:00:00"));
        slot.setEndTime(Time.valueOf("09:30:00"));
        slot.setStatus("available");
        slot = bookableSlotRepository.saveAndFlush(slot);

        // --- tạo Appointment ---
        appointment = new Appointment();
        appointment.setAppointmentCode("APPT001");
        appointment.setPatient(patient);
        appointment.setBookableSlot(slot);
        appointment.setStatus("scheduled");
        appointment = appointmentRepository.saveAndFlush(appointment);

        // --- mock reportService để trả PDF ---
        byte[] pdfBytes = "PDF_DATA".getBytes();
        when(reportService.generateAppointmentReport(appointment, doctor)).thenReturn(pdfBytes);
    }

    @Test
    void testPrintAppointment_Success() throws Exception {
        byte[] pdfBytes = reportService.generateAppointmentReport(appointment, doctor);

        mockMvc.perform(get("/api/report/appointment/{id}", appointment.getId()))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/pdf"))
                .andExpect(header().string("Content-Disposition",
                        "inline; filename=Lich_Kham" + appointment.getId() + ".pdf"))
                .andExpect(content().bytes(pdfBytes));
    }

    @Test
    void testPrintAppointment_Failure_NotFound() throws Exception {
        mockMvc.perform(get("/api/report/appointment/{id}", 999))
                .andExpect(status().isInternalServerError());
    }
}
