package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.AdminDTO;
import com.example.j2ee_backend.entity.Admin;
import com.example.j2ee_backend.repository.AdminRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.sql.Timestamp;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminAuthController {

    private static final Logger log = LoggerFactory.getLogger(AdminAuthController.class);

    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Tự động khởi tạo tài khoản Quản trị viên (Admin) mặc định khi ứng dụng khởi chạy
     * nếu trong hệ thống chưa có tài khoản admin nào.
     */
    @PostConstruct
    public void initDefaultAdmin() {
        try {
            boolean adminExists = adminRepository.findByUsername("admin").isPresent()
                    || adminRepository.findByEmail("admin@medicare.com").isPresent();

            if (!adminExists) {
                Admin defaultAdmin = new Admin();
                defaultAdmin.setUsername("admin");
                defaultAdmin.setEmail("admin@medicare.com");
                defaultAdmin.setPassword(passwordEncoder.encode("admin123"));
                defaultAdmin.setFullName("Quản Trị Viên Hệ Thống");
                defaultAdmin.setRole("admin");
                defaultAdmin.setPhoneNumber("0901234567");
                defaultAdmin.setCreatedAt(new Timestamp(System.currentTimeMillis()));

                adminRepository.save(defaultAdmin);
                log.info(">>> [ADMIN SEEDER] Đã khởi tạo thành công tài khoản Admin mặc định: admin@medicare.com / admin123 (role: admin)");
            } else {
                log.info(">>> [ADMIN SEEDER] Tài khoản Admin mặc định đã tồn tại trong cơ sở dữ liệu.");
            }
        } catch (Exception e) {
            log.warn(">>> [ADMIN SEEDER] Không thể seed tài khoản admin mặc định: {}", e.getMessage());
        }
    }

    /**
     * API Đăng nhập cho Cổng Quản trị viên (Admin Portal)
     * POST /api/admin/login
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        try {
            String identifier = request.get("usernameOrEmail");
            if (identifier == null || identifier.trim().isEmpty()) {
                identifier = request.get("email");
            }
            if (identifier == null || identifier.trim().isEmpty()) {
                identifier = request.get("username");
            }

            String password = request.get("password");

            if (identifier == null || identifier.trim().isEmpty() || password == null || password.trim().isEmpty()) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                        "message", "Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu!"
                ));
            }

            identifier = identifier.trim();

            // Tìm kiếm admin theo username hoặc email
            Optional<Admin> adminOpt = adminRepository.findByUsername(identifier);
            if (adminOpt.isEmpty()) {
                adminOpt = adminRepository.findByEmail(identifier);
            }
            if (adminOpt.isEmpty()) {
                adminOpt = adminRepository.findByUsernameOrEmail(identifier, identifier);
            }

            if (adminOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "message", "Tài khoản quản trị viên không tồn tại trong hệ thống!"
                ));
            }

            Admin admin = adminOpt.get();

            // Kiểm tra mật khẩu (hỗ trợ cả BCrypt và so khớp trực tiếp dự phòng)
            boolean passwordMatches = passwordEncoder.matches(password, admin.getPassword())
                    || password.equals(admin.getPassword());

            if (!passwordMatches) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of(
                        "message", "Mật khẩu quản trị viên không chính xác!"
                ));
            }

            // Kiểm tra phân quyền (ROLE CHECK)
            if (admin.getRole() == null || !"admin".equalsIgnoreCase(admin.getRole().trim())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of(
                        "message", "Tài khoản của bạn không có quyền Quản trị viên (Admin)!"
                ));
            }

            // Sinh session token cho admin
            String token = "admin-session-" + UUID.randomUUID().toString();

            AdminDTO adminDTO = new AdminDTO(admin);

            return ResponseEntity.ok(Map.of(
                    "message", "Đăng nhập quản trị viên thành công!",
                    "admin", adminDTO,
                    "token", token
            ));

        } catch (Exception e) {
            log.error("Lỗi đăng nhập admin: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "message", "Lỗi máy chủ khi xác thực quản trị viên: " + e.getMessage()
            ));
        }
    }

    /**
     * API kiểm tra thông tin phiên đăng nhập admin
     * GET /api/admin/check
     */
    @GetMapping("/check")
    public ResponseEntity<?> check() {
        return ResponseEntity.ok(Map.of(
                "status", "UP",
                "service", "Admin Auth Service",
                "defaultAccount", "admin@medicare.com"
        ));
    }
}
