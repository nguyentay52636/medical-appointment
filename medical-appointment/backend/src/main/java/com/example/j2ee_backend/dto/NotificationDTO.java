package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificationDTO {
    private int id;
    private int doctorId;
    private int patientId;
    private String patientName;
    private String title;
    private String message;
    private boolean isRead;
    private String createdAt;
}
