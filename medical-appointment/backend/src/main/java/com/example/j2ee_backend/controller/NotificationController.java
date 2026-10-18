package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.NotificationDTO;
import com.example.j2ee_backend.dto.NotificationCountDTO;
import com.example.j2ee_backend.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Lấy tất cả thông báo
    @GetMapping("/doctor/{doctorId}")
    public List<NotificationDTO> getAllNotifications(@PathVariable Integer doctorId) {
        return notificationService.getAllNotifications(doctorId);
    }

    // Lấy số lượng thông báo chưa đọc
    @GetMapping("/doctor/{doctorId}/unread_count")
    public NotificationCountDTO getUnreadCounts(@PathVariable Integer doctorId) {
        return notificationService.getUnreadCounts(doctorId);
    }

    // Đánh dấu tất cả thông báo đã đọc
    @PostMapping("/doctor/{doctorId}/mark_all_read")
    public void markAllAsRead(@PathVariable Integer doctorId) {
        notificationService.markAllAsRead(doctorId);
    }
}
