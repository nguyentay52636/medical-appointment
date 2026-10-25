package com.example.j2ee_backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class UploadController {

    private final String uploadDir = "uploads";

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Tập tin tải lên không được để trống!"));
        }

        try {
            // Lấy phần mở rộng file
            String originalFilename = file.getOriginalFilename();
            String ext = ".jpg";
            if (originalFilename != null && originalFilename.contains(".")) {
                ext = originalFilename.substring(originalFilename.lastIndexOf(".")).toLowerCase();
            }

            // Tạo tên file ngẫu nhiên an toàn
            String filename = "doctor_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;

            // 1. Lưu vào thư mục uploads tại backend
            Path backendUploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
            Files.createDirectories(backendUploadPath);
            Path targetFile = backendUploadPath.resolve(filename);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            // 2. Lưu đồng thời vào thư mục public của frontend nếu tồn tại
            try {
                Path frontendUploadPath = Paths.get("../frontend/public/uploads").toAbsolutePath().normalize();
                Files.createDirectories(frontendUploadPath);
                Files.copy(file.getInputStream(), frontendUploadPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception ignore) {
            }

            // URL trả về client
            String imageUrl = "http://localhost:8080/uploads/" + filename;
            return ResponseEntity.ok(Map.of(
                    "message", "Tải ảnh lên thành công!",
                    "imageUrl", imageUrl,
                    "filename", filename
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi lưu ảnh: " + e.getMessage()));
        }
    }
}
