package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.DoctorReviewDTO;
import com.example.j2ee_backend.dto.DoctorReviewSummaryDTO;
import com.example.j2ee_backend.service.DoctorReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping({"/api/reviews", "/api/review", "api/reviews", "api/review"})
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class DoctorReviewController {

    private final DoctorReviewService reviewService;

    @PostMapping({"", "/", "/save"})
    public ResponseEntity<?> submitReview(@RequestBody DoctorReviewDTO reviewDTO) {
        try {
            DoctorReviewDTO saved = reviewService.saveOrUpdateReview(reviewDTO);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Lưu đánh giá thành công!",
                    "data", saved
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi lưu đánh giá: " + e.getMessage()
            ));
        }
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<?> getDoctorReviews(@PathVariable Integer doctorId) {
        try {
            DoctorReviewSummaryDTO summary = reviewService.getDoctorReviewSummary(doctorId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "data", summary
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @GetMapping("/doctor/{doctorId}/patient/{patientId}")
    public ResponseEntity<?> getPatientReviewForDoctor(
            @PathVariable Integer doctorId,
            @PathVariable Integer patientId) {
        try {
            return reviewService.getPatientReviewForDoctor(doctorId, patientId)
                    .map(r -> ResponseEntity.ok(Map.of("success", true, "data", r)))
                    .orElseGet(() -> ResponseEntity.ok(Map.of("success", true, "data", (Object) null)));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", e.getMessage()
            ));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteReview(@PathVariable Integer id) {
        try {
            reviewService.deleteReview(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Xóa đánh giá thành công!"
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                    "success", false,
                    "message", "Lỗi xóa đánh giá: " + e.getMessage()
            ));
        }
    }
}

