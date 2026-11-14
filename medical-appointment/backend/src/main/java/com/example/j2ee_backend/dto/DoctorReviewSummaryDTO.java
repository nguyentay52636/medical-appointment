package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DoctorReviewSummaryDTO {
    private Integer doctorId;
    private String doctorName;
    private Double averageRating;
    private Integer totalReviews;
    private Map<Integer, Long> ratingBreakdown;
    private List<DoctorReviewDTO> reviews;
}

