package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.PasswordChangeRequestDTO;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.example.j2ee_backend.service.AppointmentService;
import com.example.j2ee_backend.service.DoctorService;
import com.example.j2ee_backend.service.GeocodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("api/doctor")
@RequiredArgsConstructor
public class DoctorController {
    @Autowired
    private DoctorService doctorServices;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private final DoctorRepository doctorRepository;

    @Autowired
    private final GeocodeService geocodeService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request){
        try{
            String email = request.get("email");
            String password = request.get("password");

            Doctor doctor = doctorServices.login(email, password);

            //chuyển từ entity sang dto
            DoctorDTO doctorDTO = new DoctorDTO(doctor);
            return ResponseEntity.ok().body(Map.of("message", "Đăng nhập thành công!",
                    "doctor", doctorDTO));

        }catch(Exception e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    // --- Google OAuth login ---
    @PostMapping("/google-login")
    public ResponseEntity<?> loginWithGoogle(@RequestBody Map<String, String> body) {
        try {
            String idToken = body.get("idToken"); // từ frontend

            Doctor doctor = doctorServices.loginWithGoogle(idToken);

            DoctorDTO doctorDTO = new DoctorDTO(doctor);
            String token = "generated-token"; // TODO: Tạo JWT

            return ResponseEntity.ok(Map.of(
                    "message", "Đăng nhập Google thành công!",
                    "doctor", doctorDTO,
                    "token", token
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @GetMapping("/all")
    public List<DoctorDTO> getAllDoctors() {
        return doctorServices.getAllDoctors();
    }

    @GetMapping("/specialty/{id}")
    public ResponseEntity<List<DoctorDTO>> getDoctorsBySpecialty(@PathVariable("id") Integer specialtyId) {
        List<DoctorDTO> doctors = doctorServices.getDoctorsBySpecialtyId(specialtyId);
        return ResponseEntity.ok(doctors);
    }

    @PostMapping("/{doctorId}/appointments/{appointmentId}/action")
    public ResponseEntity<?> handleAppointmentAction(
            @PathVariable Integer doctorId,
            @PathVariable Integer appointmentId,
            @RequestBody Map<String, String> body) {

        String action = body.get("action");

        try {
            switch (action) {
                case "confirm":
                    appointmentService.confirmAppointment(appointmentId, doctorId); // status = "confirmed"
                    return ResponseEntity.ok(Map.of("message", "Đã xác nhận lịch hẹn."));

                case "start":
                    appointmentService.startAppointment(appointmentId, doctorId); // status = "completed"
                    return ResponseEntity.ok(Map.of("message", "Đã bắt đầu khám."));

                case "reject":
                    appointmentService.rejectAppointment(appointmentId, doctorId); // status = "rejected"
                    return ResponseEntity.ok(Map.of("message", "Đã hủy lịch hẹn thành công."));

                default:
                    return ResponseEntity.badRequest().body(Map.of("message", "Hành động không hợp lệ"));
            }

        } catch (Exception e) {
            // Trả về lỗi nếu service ném ra (ví dụ: "Lịch hẹn đã hoàn thành")
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<?> doctorForgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            doctorServices.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "Đã gửi email đặt lại mật khẩu"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset_password")
    public ResponseEntity<?> doctorResetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");
            doctorServices.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PutMapping("/update")
    public ResponseEntity<DoctorDTO> updateDoctor(@RequestBody DoctorDTO doctorDTO) {
        DoctorDTO updatedoctorDTO = doctorServices.updateProfile(doctorDTO);
        return ResponseEntity.ok(updatedoctorDTO);
    }

    @PutMapping("/change_password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Integer id,
                                            @RequestBody PasswordChangeRequestDTO request) {
        try {
            doctorServices.changePassword(id, request);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // ============================================================
    // Lấy bác sĩ gần nhất
    // ============================================================
    @GetMapping("/nearby")
    public List<DoctorDTO> getNearestDoctors(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "2") int topN,
            @RequestParam(defaultValue = "10") double radiusKm
    ) {
        geocodeService.updateAllMissingCoordinates(lat, lng);
        List<Doctor> doctors = geocodeService.findNearByDoctors(lat, lng, topN, radiusKm);
        return doctors.stream().map(DoctorDTO::new).toList();
    }

    @PostMapping("/create")
    public ResponseEntity<?> createDoctor(@RequestBody Map<String, Object> body) {
        try {
            DoctorDTO dto = new DoctorDTO();
            dto.setFullName((String) body.get("fullName"));
            dto.setEmail((String) body.get("email"));
            dto.setPhoneNumber((String) body.get("phoneNumber"));
            dto.setSpecialtyId(body.get("specialtyId") != null ? Integer.valueOf(body.get("specialtyId").toString()) : null);
            dto.setExperienceYears(body.get("experienceYears") != null ? Integer.valueOf(body.get("experienceYears").toString()) : 1);
            dto.setPricePerAppointment(body.get("pricePerAppointment") != null ? Integer.valueOf(body.get("pricePerAppointment").toString()) : 200000);
            dto.setAddress((String) body.get("address"));
            dto.setBio((String) body.get("bio"));
            dto.setImageUrl((String) body.get("imageUrl"));

            String rawPassword = (String) body.get("password");
            DoctorDTO created = doctorServices.createDoctor(dto, rawPassword);
            return ResponseEntity.ok(Map.of("message", "Thêm bác sĩ thành công!", "doctor", created));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Integer id) {
        try {
            doctorServices.deleteDoctor(id);
            return ResponseEntity.ok(Map.of("message", "Xóa bác sĩ thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
