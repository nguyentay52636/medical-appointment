package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NotificationCountDTO {
    private int notifications;  // số thông báo chưa đọc
}
