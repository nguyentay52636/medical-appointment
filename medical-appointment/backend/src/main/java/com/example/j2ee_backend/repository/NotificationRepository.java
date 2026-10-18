package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    // Lấy tất cả thông báo của bác sĩ theo thứ tự mới nhất
    List<Notification> findAllByDoctorOrderByCreatedAtDesc(Doctor doctor);

    // Đếm số thông báo chưa đọc
    Long countByDoctorAndIsReadFalse(Doctor doctor);

    // Lấy tất cả thông báo chưa đọc
    List<Notification> findAllByDoctorAndIsReadFalse(Doctor doctor);

    boolean existsByDoctorAndTitleAndMessage(Doctor doctor, String title, String message);

    List<Notification> findByDoctorId(Integer doctorId);
}
