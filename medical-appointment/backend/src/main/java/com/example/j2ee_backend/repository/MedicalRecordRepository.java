package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Integer> {
    Optional<MedicalRecord> findByAppointmentId(Integer appointmentId);
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(Integer patientId);
    List<MedicalRecord> findByDoctorIdOrderByCreatedAtDesc(Integer doctorId);
    boolean existsByAppointmentId(Integer appointmentId);
}
