package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.MedicalRecordDTO;
import com.example.j2ee_backend.service.MedicalRecordService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/medical-record")
@RequiredArgsConstructor
public class MedicalRecordController {

    private final MedicalRecordService medicalRecordService;

    @PostMapping({"", "/save"})
    public ResponseEntity<?> saveMedicalRecord(@RequestBody MedicalRecordDTO dto) {
        try {
            MedicalRecordDTO saved = medicalRecordService.saveMedicalRecord(dto);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Lưu hồ sơ bệnh án và hoàn tất ca khám thành công!",
                    "data", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi khi lưu bệnh án: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/appointment/{appointmentId}")
    public ResponseEntity<?> getByAppointmentId(@PathVariable Integer appointmentId) {
        try {
            MedicalRecordDTO record = medicalRecordService.getRecordByAppointmentId(appointmentId);
            if (record == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                        "success", false,
                        "message", "Chưa có hồ sơ bệnh án cho lịch hẹn này."
                ));
            }
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", record
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getByPatientId(@PathVariable Integer patientId) {
        try {
            List<MedicalRecordDTO> list = medicalRecordService.getRecordsByPatientId(patientId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getByDoctorId(@PathVariable Integer doctorId) {
        try {
            List<MedicalRecordDTO> list = medicalRecordService.getRecordsByDoctorId(doctorId);
            return ResponseEntity.ok(list);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }
}
