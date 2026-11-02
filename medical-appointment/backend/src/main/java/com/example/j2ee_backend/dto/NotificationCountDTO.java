package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class NotificationCountDTO {
    private int notifications;  // số thông báo chưa đọc

    public NotificationCountDTO() {
    }

    public NotificationCountDTO(int notifications) {
        this.notifications = notifications;
    }

    public int getNotifications() {
        return notifications;
    }

    public void setNotifications(int notifications) {
        this.notifications = notifications;
    }
}
