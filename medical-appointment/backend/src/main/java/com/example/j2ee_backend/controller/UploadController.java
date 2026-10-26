package com.example.j2ee_backend.controller;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@RestController
@CrossOrigin(origins = "*")
public class UploadController {

    private Path resolveDirectory(String folder) {
        Path direct = Paths.get(folder).toAbsolutePath().normalize();
        if (Files.exists(direct)) return direct;
        Path nested = Paths.get("backend", folder).toAbsolutePath().normalize();
        if (Files.exists(nested)) return nested;
        try {
            Files.createDirectories(direct);
            return direct;
        } catch (Exception e) {
            return direct;
        }
    }

    /**
     * Tải lên avatar bác sĩ từ máy tính:
     * - Lưu trực tiếp vào thư mục `backend/images/`
     * - Lưu đồng thời vào `frontend/public/images/` để hỗ trợ hiển thị tối ưu
     * - Lưu vào `backend/uploads/` để đảm bảo tương thích ngược
     * - Trả về URL: http://localhost:8080/images/{filename}
     */
    @PostMapping("/api/upload/image")
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

            // Tạo tên file an toàn: doctor_{timestamp}_{uuid}.ext
            String filename = "doctor_" + System.currentTimeMillis() + "_" + UUID.randomUUID().toString().substring(0, 8) + ext;

            // 1. Lưu vào thư mục backend/images/
            Path backendImagesPath = resolveDirectory("images");
            Files.createDirectories(backendImagesPath);
            Path targetFile = backendImagesPath.resolve(filename);
            Files.copy(file.getInputStream(), targetFile, StandardCopyOption.REPLACE_EXISTING);

            // 2. Lưu đồng thời vào frontend/public/images/ (nếu tồn tại)
            try {
                Path frontendImagesPath = Paths.get("../frontend/public/images").toAbsolutePath().normalize();
                if (!Files.exists(frontendImagesPath)) {
                    frontendImagesPath = Paths.get("frontend/public/images").toAbsolutePath().normalize();
                }
                Files.createDirectories(frontendImagesPath);
                Files.copy(file.getInputStream(), frontendImagesPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception ignore) {
            }

            // 3. Đồng bộ vào backend/uploads/ để hỗ trợ tương thích ngược
            try {
                Path backendUploadsPath = resolveDirectory("uploads");
                Files.createDirectories(backendUploadsPath);
                Files.copy(file.getInputStream(), backendUploadsPath.resolve(filename), StandardCopyOption.REPLACE_EXISTING);
            } catch (Exception ignore) {
            }

            // URL trả về client
            String imageUrl = "http://localhost:8080/images/" + filename;
            return ResponseEntity.ok(Map.of(
                    "message", "Tải ảnh lên thành công!",
                    "imageUrl", imageUrl,
                    "filename", filename
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Lỗi khi lưu ảnh: " + e.getMessage()));
        }
    }

    /**
     * API đọc ảnh trực tiếp từ thư mục `images/` của backend để hiển thị
     */
    @GetMapping("/images/{filename:.+}")
    public ResponseEntity<Resource> serveImage(@PathVariable String filename) {
        return getResourceResponseEntity(filename, "images");
    }

    /**
     * API đọc ảnh qua tiền tố upload (nếu có)
     */
    @GetMapping("/api/upload/images/{filename:.+}")
    public ResponseEntity<Resource> serveImageApi(@PathVariable String filename) {
        return getResourceResponseEntity(filename, "images");
    }

    /**
     * API đọc ảnh từ thư mục `uploads/` (tương thích ngược)
     */
    @GetMapping("/uploads/{filename:.+}")
    public ResponseEntity<Resource> serveUpload(@PathVariable String filename) {
        return getResourceResponseEntity(filename, "uploads");
    }

    private ResponseEntity<Resource> getResourceResponseEntity(String filename, String primaryFolder) {
        try {
            Path filePath = resolveDirectory(primaryFolder).resolve(filename).normalize();
            if (!Files.exists(filePath)) {
                // Thử tìm trong thư mục còn lại
                String altFolder = primaryFolder.equals("images") ? "uploads" : "images";
                filePath = resolveDirectory(altFolder).resolve(filename).normalize();
            }

            if (!Files.exists(filePath)) {
                return ResponseEntity.notFound().build();
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (!resource.exists() || !resource.isReadable()) {
                return ResponseEntity.notFound().build();
            }

            String contentType = Files.probeContentType(filePath);
            if (contentType == null) {
                if (filename.endsWith(".png")) contentType = "image/png";
                else if (filename.endsWith(".webp")) contentType = "image/webp";
                else if (filename.endsWith(".gif")) contentType = "image/gif";
                else contentType = "image/jpeg";
            }

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(contentType))
                    .header(HttpHeaders.CACHE_CONTROL, "max-age=86400")
                    .body(resource);

        } catch (MalformedURLException e) {
            return ResponseEntity.badRequest().build();
        } catch (IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
