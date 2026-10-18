package com.example.j2ee_backend.integrationtest;

import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.Notification;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.entity.Specialty;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.example.j2ee_backend.repository.NotificationRepository;
import com.example.j2ee_backend.repository.PatientRepository;
import com.example.j2ee_backend.repository.SpecialtyRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@AutoConfigureTestDatabase
@Transactional
@ActiveProfiles("test")
public class NotificationControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private SpecialtyRepository specialtyRepository;

    private Doctor doctor;
    private Patient patient1;
    private Patient patient2;

    @BeforeEach
    void setUp() {
        // Xóa dữ liệu cũ
        notificationRepository.deleteAll();
        doctorRepository.deleteAll();
        patientRepository.deleteAll();
        specialtyRepository.deleteAll();

        // Tạo Specialty cho Doctor
        Specialty specialty = new Specialty();
        specialty.setSpecialtyName("Da liễu");
        specialty = specialtyRepository.saveAndFlush(specialty);

        // Tạo doctor test
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

        // Tạo patients
        patient1 = new Patient();
        patient1.setFullName("Nguyễn Văn A");
        patient1.setEmail("patient1@example.com");
        patient1.setPassword("123456");
        patient1.setPhoneNumber("0123456789");
        patient1.setAddress("Võ Văn Kiệt");
        patient1 = patientRepository.saveAndFlush(patient1);

        patient2 = new Patient();
        patient2.setFullName("Trần Thị B");
        patient2.setEmail("patient2@example.com");
        patient2.setPassword("123456");
        patient2.setPhoneNumber("0987654321");
        patient2.setAddress("Võ Văn Kiệt");
        patient2 = patientRepository.saveAndFlush(patient2);

        // Tạo notifications
        Notification n1 = new Notification();
        n1.setDoctor(doctor);
        n1.setPatient(patient1);
        n1.setTitle("Thông báo hệ thống");
        n1.setMessage("Thông báo 1");
        n1.setRead(false);
        n1.setCreatedAt(LocalDateTime.now());

        Notification n2 = new Notification();
        n2.setDoctor(doctor);
        n2.setPatient(patient2);
        n2.setTitle("Thông báo hệ thống");
        n2.setMessage("Thông báo 2");
        n2.setRead(true);
        n2.setCreatedAt(LocalDateTime.now());

        notificationRepository.saveAll(List.of(n1, n2));
    }

    @Test
    void testGetAllNotifications() throws Exception {
        mockMvc.perform(get("/api/notification/doctor/{doctorId}", doctor.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].message").value("Thông báo 1"))
                .andExpect(jsonPath("$[0].read").value(false))
                .andExpect(jsonPath("$[1].message").value("Thông báo 2"))
                .andExpect(jsonPath("$[1].read").value(true));
    }

    @Test
    void testGetUnreadCounts() throws Exception {
        mockMvc.perform(get("/api/notification/doctor/{doctorId}/unread_count", doctor.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.notifications").value(1)); // Chỉ có 1 chưa đọc
    }

    @Test
    void testMarkAllAsRead() throws Exception {
        mockMvc.perform(post("/api/notification/doctor/{doctorId}/mark_all_read", doctor.getId())
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());

        List<Notification> notifications = notificationRepository.findByDoctorId(doctor.getId());
        assertThat(notifications).allMatch(Notification::isRead); // tất cả phải read = true
    }
}
