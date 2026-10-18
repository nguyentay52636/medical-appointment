package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DetailedReportResponse {
    private Long totalRevenue;
    private List<AppointmentDetailDTO> appointments;
}