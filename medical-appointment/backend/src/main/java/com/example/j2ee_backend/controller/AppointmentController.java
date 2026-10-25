package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.AppointmentDTO;
import com.example.j2ee_backend.dto.DetailedReportResponse;
import com.example.j2ee_backend.dto.MonthlyRevenuePatientDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.j2ee_backend.dto.AppointmentStatisticResponse;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/appointment")
public class AppointmentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private PatientService patientService;

    @Autowired
    private BookableSlotService bookableSlotService;

    @GetMapping("/all")
    public ResponseEntity<?> getAllAppointments() {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAllAppointments();
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getAppointments(@PathVariable Integer doctorId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByDoctorId(doctorId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    // Lấy chi tiết 1 appointment
    @GetMapping("/doctor/{doctorId}/{appointmentId}")
    public ResponseEntity<AppointmentDTO> getAppointmentDetail(
            @PathVariable Integer doctorId,
            @PathVariable Integer appointmentId) {
        AppointmentDTO dto = appointmentService.getAppointmentDetail(doctorId, appointmentId);
        if (dto == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<?> getAppointmentsByPatientId(@PathVariable Integer patientId) {
        try {
            List<AppointmentDTO> appointments = appointmentService.getAppointmentsByPatientId(patientId);
            return ResponseEntity.ok(appointments);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/reschedule/{id}")
    public ResponseEntity<?> rescheduleAppointment(
            @PathVariable Integer id,
            @RequestBody Map<String, String> body
    ) {
        try {
            LocalDate newDate = LocalDate.parse(body.get("date"));
            LocalTime newTime = LocalTime.parse(body.get("time"));

            Appointment updated = appointmentService.rescheduleAppointment(id, newDate, newTime);
            return ResponseEntity.ok(Map.of(
                    "message", "Dời lịch thành công",
                    "appointment", new AppointmentDTO(updated) // chuyển sang DTO
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    // Tự động cancel nếu pending/confirmed nhưng quá ngày khám
    @PutMapping("/expired/{id}")
    public ResponseEntity<Void> autoExpireAppointment(@PathVariable Integer id) {
        appointmentService.updateExpiredAppointment(id);
        return ResponseEntity.ok().build();   // Không trả body
    }

    @PostMapping("/save")
    public ResponseEntity<?> bookAppointment(@RequestBody AppointmentDTO dto) {
        Map<String, String> result = appointmentService.createAppointment(dto);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/doctor/{doctorId}/reject/{appointmentId}")
    public ResponseEntity<?> rejectAppointment(
            @PathVariable Integer doctorId,
            @PathVariable Integer appointmentId) {
        try {
            appointmentService.rejectAppointment(appointmentId, doctorId);
            return ResponseEntity.ok(Map.of("message", "Đã hủy lịch hẹn và hoàn tiền nếu cần"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }
   //kết quả cho biểu đồ tròn
    @GetMapping(
            value = "/statistics/status", produces = "application/json")
    public ResponseEntity<AppointmentStatisticResponse> getStatusStatistics(
            @RequestParam("month") int month,
            @RequestParam("year") int year,
            @RequestParam("doctorId") Integer doctorId ){
        // Gọi Service để thực hiện logic nghiệp vụ
        AppointmentStatisticResponse response =
                appointmentService.getAppointmentStatusStatistics(month, year, doctorId);
        return ResponseEntity.ok(response);
    }
    // Lấy thống kê doanh thu và lượt khám theo 12 tháng trong năm.
    @GetMapping(value ="/statistics/revenue-patient", produces = "application/json")
    public ResponseEntity<List<MonthlyRevenuePatientDTO>> getRevenuePatientStatistics(
            @RequestParam("year") int year,
            @RequestParam("doctorId") Integer doctorId) {

        List<MonthlyRevenuePatientDTO> response =
                appointmentService.getYearlyRevenuePatientStatistics(year,doctorId);

        return ResponseEntity.ok(response);
    }
    //Lấy dữ liểu bảng chi tiết
    @GetMapping(value= "/reports/detailed-list",produces ="application/json" )
    public ResponseEntity<DetailedReportResponse> getDetailedListReport(
            @RequestParam("startDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam("endDate") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam("doctorId") Integer doctorId
    ) {

        DetailedReportResponse response =
                appointmentService.getDetailedAppointmentReport(startDate, endDate,doctorId);

        return ResponseEntity.ok(response);
    }

}