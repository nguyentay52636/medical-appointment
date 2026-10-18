package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentDetailDTO {
    private Integer id;
    private String appointmentCode;
    private String patientName;
    private String dateTime; // Định dạng chuỗi (YYYY-MM-DD HH:mm)
    private Integer price;
    private String status;
}