package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.NotificationDTO;
import com.example.j2ee_backend.dto.NotificationCountDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.Notification;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.example.j2ee_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final DoctorRepository doctorRepository;
    private final AppointmentRepository appointmentRepository;

    // Lấy tất cả thông báo của bác sĩ
    public List<NotificationDTO> getAllNotifications(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        return notificationRepository.findAllByDoctorOrderByCreatedAtDesc(doctor)
                .stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    // Lấy số lượng thông báo chưa đọc
    public NotificationCountDTO getUnreadCounts(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        Long notificationsLong = notificationRepository.countByDoctorAndIsReadFalse(doctor);
        int notifications = notificationsLong != null ? notificationsLong.intValue() : 0;

        return new NotificationCountDTO(notifications);
    }

    // Đánh dấu tất cả thông báo đã đọc
    public void markAllAsRead(Integer doctorId) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        List<Notification> unread = notificationRepository.findAllByDoctorAndIsReadFalse(doctor);
        unread.forEach(n -> n.setRead(true));
        if (!unread.isEmpty()) {
            notificationRepository.saveAll(unread);
        }
    }

    // Chuyển Notification entity → NotificationDTO
    private NotificationDTO convertToDTO(Notification n) {
        return new NotificationDTO(
                n.getId(),
                n.getDoctor().getId(),
                n.getPatient() != null ? n.getPatient().getId() : 0,
                n.getPatient() != null ? n.getPatient().getFullName() : null,
                n.getTitle(),
                n.getMessage(),
                n.isRead(),
                n.getCreatedAt().toString()
        );
    }

    @Scheduled(fixedRate = 60 * 60 * 1000) // Chạy tự động mỗi 1 giờ (60 phút * 60 giây * 1000 ms)
    public void sendAppointmentReminders() {
        // Lấy thời gian hiện tại
        LocalDateTime now = LocalDateTime.now();
        // Tính thời điểm 24h tới (dùng để nhắc trước 24h)
        LocalDateTime in24h = now.plusHours(24);

        // Lấy tất cả các appointment có slot bắt đầu trong khoảng từ now đến in24h
        List<Appointment> upcoming = appointmentRepository.findAllByBookableSlotSlotDateBetween(
                java.sql.Date.valueOf(now.toLocalDate()),
                java.sql.Date.valueOf(in24h.toLocalDate())
        );

        // Duyệt từng appointment sắp tới
        for (Appointment appt : upcoming) {
            // Bỏ qua nếu slot hoặc doctor bị null (bảo vệ tránh NullPointerException)
            if (appt.getBookableSlot() == null || appt.getBookableSlot().getDoctor() == null) continue;

            // Tạo nội dung thông báo nhắc nhở
            String msg = "Bệnh nhân " + appt.getPatient().getFullName()
                    + " sẽ đến khám vào ngày " + appt.getBookableSlot().getSlotDate()
                    + " lúc " + appt.getBookableSlot().getStartTime()
                    + " đến " + appt.getBookableSlot().getEndTime();

            // Kiểm tra xem thông báo này đã tồn tại chưa để tránh trùng lặp
            boolean exists = notificationRepository.existsByDoctorAndTitleAndMessage(
                    appt.getBookableSlot().getDoctor(),
                    "Nhắc nhở lịch khám",
                    msg
            );

            // Nếu chưa tồn tại, tạo mới notification
            if (!exists) {
                Notification n = new Notification();
                n.setDoctor(appt.getBookableSlot().getDoctor());
                n.setPatient(appt.getPatient());
                n.setTitle("Nhắc nhở lịch khám");
                n.setMessage(msg);
                n.setRead(false);
                n.setCreatedAt(LocalDateTime.now());
                notificationRepository.save(n);
            }
        }
    }
}
