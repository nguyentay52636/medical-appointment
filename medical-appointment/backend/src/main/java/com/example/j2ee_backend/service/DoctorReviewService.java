package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorReviewDTO;
import com.example.j2ee_backend.dto.DoctorReviewSummaryDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.DoctorReview;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.example.j2ee_backend.repository.DoctorReviewRepository;
import com.example.j2ee_backend.repository.PatientRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DoctorReviewService {

    private final DoctorReviewRepository reviewRepository;
    private final DoctorRepository doctorRepository;
    private final PatientRepository patientRepository;
    private final AppointmentRepository appointmentRepository;

    @Transactional
    public DoctorReviewDTO saveOrUpdateReview(DoctorReviewDTO dto) {
        if (dto.getDoctorId() == null || dto.getPatientId() == null) {
            throw new IllegalArgumentException("doctorId và patientId không được để trống!");
        }

        if (dto.getRating() == null || dto.getRating() < 1 || dto.getRating() > 5) {
            throw new IllegalArgumentException("Điểm đánh giá rating phải từ 1 đến 5 sao!");
        }

        if (dto.getComment() == null || dto.getComment().trim().isEmpty()) {
            throw new IllegalArgumentException("Nội dung đánh giá không được để trống!");
        }

        Doctor doctor = doctorRepository.findById(dto.getDoctorId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bác sĩ ID: " + dto.getDoctorId()));

        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bệnh nhân ID: " + dto.getPatientId()));

        Appointment appointment = null;
        if (dto.getAppointmentId() != null) {
            appointment = appointmentRepository.findById(dto.getAppointmentId()).orElse(null);
        }

        // Tìm xem bệnh nhân đã từng đánh giá bác sĩ này chưa (1 đánh giá / 1 bác sĩ)
        Optional<DoctorReview> existingOpt = reviewRepository.findByDoctorIdAndPatientId(dto.getDoctorId(), dto.getPatientId());

        DoctorReview review;
        if (existingOpt.isPresent()) {
            // Cập nhật đánh giá hiện tại
            review = existingOpt.get();
            review.setRating(dto.getRating());
            review.setComment(dto.getComment().trim());
            if (appointment != null) {
                review.setAppointment(appointment);
            }
            review.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        } else {
            // Tạo mới đánh giá
            review = new DoctorReview();
            review.setDoctor(doctor);
            review.setPatient(patient);
            review.setAppointment(appointment);
            review.setRating(dto.getRating());
            review.setComment(dto.getComment().trim());
            review.setCreatedAt(new Timestamp(System.currentTimeMillis()));
            review.setUpdatedAt(new Timestamp(System.currentTimeMillis()));
        }

        DoctorReview saved = reviewRepository.save(review);
        return new DoctorReviewDTO(saved);
    }

    @Transactional(readOnly = true)
    public DoctorReviewSummaryDTO getDoctorReviewSummary(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new NoSuchElementException("Không tìm thấy bác sĩ ID: " + doctorId));

        List<DoctorReview> reviews = reviewRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId);
        int totalReviews = reviews.size();

        Double rawAvg = reviewRepository.getAverageRatingByDoctorId(doctorId);
        double averageRating = (rawAvg != null) ? Math.round(rawAvg * 10.0) / 10.0 : 5.0;

        // Thống kê phân bố sao (1 - 5 sao)
        Map<Integer, Long> breakdown = new HashMap<>();
        for (int star = 1; star <= 5; star++) {
            breakdown.put(star, 0L);
        }
        for (DoctorReview r : reviews) {
            int rating = r.getRating();
            breakdown.put(rating, breakdown.getOrDefault(rating, 0L) + 1);
        }

        List<DoctorReviewDTO> reviewDTOs = reviews.stream()
                .map(DoctorReviewDTO::new)
                .collect(Collectors.toList());

        return DoctorReviewSummaryDTO.builder()
                .doctorId(doctor.getId())
                .doctorName(doctor.getFullName())
                .averageRating(averageRating)
                .totalReviews(totalReviews)
                .ratingBreakdown(breakdown)
                .reviews(reviewDTOs)
                .build();
    }

    @Transactional(readOnly = true)
    public Optional<DoctorReviewDTO> getPatientReviewForDoctor(Integer doctorId, Integer patientId) {
        return reviewRepository.findByDoctorIdAndPatientId(doctorId, patientId)
                .map(DoctorReviewDTO::new);
    }

    @Transactional
    public void deleteReview(Integer reviewId) {
        reviewRepository.deleteById(reviewId);
    }
}

