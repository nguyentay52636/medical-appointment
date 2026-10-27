package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.ScheduleUpdateRequestDTO;
import com.example.j2ee_backend.entity.DoctorAvailability;
import com.example.j2ee_backend.service.DoctorAvailabilityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin("http://localhost:5173")
@RequiredArgsConstructor
@RequestMapping("/api/availability")
public class DoctorAvailabilityController {

    private final DoctorAvailabilityService doctorAvailabilityService;

    // LẤY LỊCH LÀM VIỆC (ACTIVE)
    @GetMapping("/schedule")
    public ResponseEntity<List<DoctorAvailability>> getSchedule(@RequestParam Integer doctorId) {

        List<DoctorAvailability> availabilities =
                doctorAvailabilityService.findByDoctorId(doctorId); // chỉ lấy active

        if (availabilities.isEmpty()) {
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.ok(availabilities);
    }

    // CẬP NHẬT LỊCH (SOFT DELETE)
    @PostMapping("/update")
    public ResponseEntity<String> updateSchedule(
            @RequestParam Integer doctorId,
            @RequestBody ScheduleUpdateRequestDTO request
    ) {
        try {
            doctorAvailabilityService.updateDaySchedule(doctorId, request);
            return ResponseEntity.ok("Cập nhật lịch thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }

    // TỔNG KẾT TUÂN THỦ QUY CHẾ THỜI GIAN LÀM VIỆC TỐI THIỂU
    @GetMapping("/summary")
    public ResponseEntity<com.example.j2ee_backend.dto.DoctorScheduleSummaryDTO> getScheduleSummary(@RequestParam Integer doctorId) {
        return ResponseEntity.ok(doctorAvailabilityService.getScheduleSummary(doctorId));
    }

    // KHỞI TẠO LỊCH LÀM VIỆC CHUẨN MẶC ĐỊNH (THỨ 2 - THỨ 6)
    @PostMapping("/init-default")
    public ResponseEntity<String> initDefaultSchedule(@RequestParam Integer doctorId) {
        try {
            doctorAvailabilityService.initDefaultAvailabilityByDoctorId(doctorId);
            return ResponseEntity.ok("Khởi tạo lịch làm việc chuẩn (Thứ 2 - Thứ 6) thành công!");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Lỗi: " + e.getMessage());
        }
    }
}



