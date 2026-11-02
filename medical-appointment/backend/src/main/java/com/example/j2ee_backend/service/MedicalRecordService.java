package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.MedicalRecordDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.MedicalRecord;
import com.example.j2ee_backend.entity.Notification;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.repository.MedicalRecordRepository;
import com.example.j2ee_backend.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MedicalRecordService {

    private final MedicalRecordRepository medicalRecordRepository;
    private final AppointmentRepository appointmentRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public MedicalRecordDTO saveMedicalRecord(MedicalRecordDTO dto) {
        if (dto.getAppointmentId() == null) {
            throw new IllegalArgumentException("Mã lịch hẹn (appointmentId) không được để trống!");
        }

        Appointment appointment = appointmentRepository.findById(dto.getAppointmentId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy lịch hẹn với ID: " + dto.getAppointmentId()));

        MedicalRecord record = medicalRecordRepository.findByAppointmentId(dto.getAppointmentId())
                .orElse(new MedicalRecord());

        record.setAppointment(appointment);
        record.setPatient(appointment.getPatient());
        if (appointment.getBookableSlot() != null && appointment.getBookableSlot().getDoctor() != null) {
            record.setDoctor(appointment.getBookableSlot().getDoctor());
        }

        if (dto.getExaminationType() != null && !dto.getExaminationType().trim().isEmpty()) {
            record.setExaminationType(dto.getExaminationType().trim());
        } else {
            record.setExaminationType("Khám tổng quát");
        }

        record.setStatus("completed");
        record.setBloodPressure(dto.getBloodPressure());
        record.setHeartRate(dto.getHeartRate());
        record.setTemperature(dto.getTemperature());
        record.setWeight(dto.getWeight());
        record.setHeight(dto.getHeight());
        record.setClinicalSymptoms(dto.getClinicalSymptoms());
        record.setDiagnosis(dto.getDiagnosis() != null && !dto.getDiagnosis().trim().isEmpty() 
                ? dto.getDiagnosis().trim() 
                : "Chưa có chẩn đoán cụ thể");
        record.setLabResults(dto.getLabResults());
        record.setPrescriptions(dto.getPrescriptions());
        record.setDoctorAdvice(dto.getDoctorAdvice());
        record.setFollowUpDate(dto.getFollowUpDate());

        MedicalRecord saved = medicalRecordRepository.save(record);

        // Cập nhật trạng thái lịch hẹn thành 'completed'
        appointment.setStatus("completed");
        // Nếu offline payment thì chuyển sang 'paid' khi khám xong
        if ("offline".equalsIgnoreCase(appointment.getPaymentMethod()) && "pending".equalsIgnoreCase(appointment.getPaymentStatus())) {
            appointment.setPaymentStatus("paid");
        }
        appointmentRepository.save(appointment);

        // Gửi thông báo cho bệnh nhân
        try {
            if (appointment.getPatient() != null && appointment.getBookableSlot() != null && appointment.getBookableSlot().getDoctor() != null) {
                Notification notif = new Notification();
                notif.setDoctor(appointment.getBookableSlot().getDoctor());
                notif.setPatient(appointment.getPatient());
                notif.setTitle("Hoàn tất ca khám - Mã " + appointment.getAppointmentCode());
                notif.setMessage("Bác sĩ " + appointment.getBookableSlot().getDoctor().getFullName() + 
                                 " đã hoàn tất ca khám và cập nhật hồ sơ bệnh án/đơn thuốc cho bạn. Bạn có thể vào mục Lịch sử đặt lịch để xem chi tiết.");
                notif.setIsRead(false);
                notificationRepository.save(notif);
            }
        } catch (Exception e) {
            System.err.println("Gửi thông báo bệnh nhân thất bại: " + e.getMessage());
        }

        return new MedicalRecordDTO(saved);
    }

    @Transactional(readOnly = true)
    public MedicalRecordDTO getRecordByAppointmentId(Integer appointmentId) {
        return medicalRecordRepository.findByAppointmentId(appointmentId)
                .map(MedicalRecordDTO::new)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordDTO> getRecordsByPatientId(Integer patientId) {
        return medicalRecordRepository.findByPatientIdOrderByCreatedAtDesc(patientId)
                .stream()
                .map(MedicalRecordDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MedicalRecordDTO> getRecordsByDoctorId(Integer doctorId) {
        return medicalRecordRepository.findByDoctorIdOrderByCreatedAtDesc(doctorId)
                .stream()
                .map(MedicalRecordDTO::new)
                .collect(Collectors.toList());
    }
}
