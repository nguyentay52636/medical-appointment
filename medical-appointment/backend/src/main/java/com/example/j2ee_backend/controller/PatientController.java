package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.PasswordChangeRequestDTO;
import com.example.j2ee_backend.dto.PatientDTO;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.service.PatientService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("api/patient")
public class PatientController {

    private final PatientService patientService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request){
        try{
            String email = request.get("email");
            String password = request.get("password");

            Patient patient = patientService.login(email, password);

            //chuyển từ entity sang dto
            PatientDTO patientDTO = new PatientDTO(patient);
            return ResponseEntity.ok().body(Map.of("message", "Đăng nhập thành công!",
                    "patient", patientDTO));

        }catch(Exception e){
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody PatientDTO dto) {

        if (patientService.existsByPhoneNumber(dto.getPhoneNumber())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Số điện thoại đã được sử dụng"));
        }

        if (patientService.existsByEmail(dto.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email đã được sử dụng"));
        }

        Patient savedPatient = patientService.registerPatient(dto);

        return ResponseEntity.ok(Map.of(
                "message", "Đăng ký thành công!",
                "patient", savedPatient
        ));
    }

    @PostMapping("/forgot_password")
    public ResponseEntity<?> patientForgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            patientService.forgotPassword(email);
            return ResponseEntity.ok(Map.of("message", "Đã gửi email đặt lại mật khẩu"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/reset_password")
    public ResponseEntity<?> patientResetPassword(@RequestBody Map<String, String> body) {
        try {
            String token = body.get("token");
            String newPassword = body.get("newPassword");
            patientService.resetPassword(token, newPassword);
            return ResponseEntity.ok(Map.of("message", "Đổi mật khẩu thành công"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }


    @PutMapping("/update/{id}")
    public ResponseEntity<?> updatePatient(@PathVariable Integer id, @RequestBody PatientDTO dto) {
        try {
            Patient updated = patientService.updatePatient(id, dto);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @PutMapping("/change_password/{id}")
    public ResponseEntity<?> changePassword(@PathVariable Integer id,
                                            @RequestBody PasswordChangeRequestDTO request) {
        try {
            patientService.changePassword(id, request);
            return ResponseEntity.ok("Đổi mật khẩu thành công");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllPatients() {
        try {
            return ResponseEntity.ok(patientService.getAllPatients());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/{id}")
    public ResponseEntity<?> deletePatient(@PathVariable Integer id) {
        try {
            patientService.deletePatient(id);
            return ResponseEntity.ok(Map.of("message", "Xóa hồ sơ bệnh nhân thành công!"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
