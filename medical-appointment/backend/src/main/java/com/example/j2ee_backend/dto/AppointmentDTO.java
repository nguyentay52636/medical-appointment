package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.entity.Patient;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class AppointmentDTO {

    private Integer id;
    private String appointmentCode;
    private Integer patientId;
    private Integer doctorId;
    private Integer bookableSlotId;
    private String patientName;
    private String doctorName;
    private String patientPhone;
    private String patientEmail;
    private String date;      // slot_date
    private String time;      // startTime
    private String endTime;   // endTime
    private String status;
    private String reason;    // reasonForVisit
    private String note;
    private Timestamp createdAt;
    private Timestamp updatedAt;
    private String paymentMethod; // "online" hoặc "offline"
    private String paymentStatus; // "peding" hoặc "paid" hoặc "failed"
    private Integer price;
    private String vnpTxnRef;

    public AppointmentDTO(Appointment appointment) {
        this.id = appointment.getId();
        this.appointmentCode = appointment.getAppointmentCode();
        this.status = appointment.getStatus();
        this.reason = appointment.getReasonForVisit();
        this.note = appointment.getNote();
        this.createdAt = appointment.getCreatedAt();
        this.updatedAt = appointment.getUpdateAt();
        this.paymentMethod = appointment.getPaymentMethod();
        this.paymentStatus = appointment.getPaymentStatus();
        this.price = appointment.getPrice();
        this.vnpTxnRef = appointment.getVnpTxnRef();

        // Lấy thông tin bệnh nhân
        Patient patient = appointment.getPatient();
        if (patient != null) {
            this.patientId = patient.getId();
            this.patientName = patient.getFullName();
            this.patientPhone = patient.getPhoneNumber();
            this.patientEmail = patient.getEmail();
        }
        // Lấy thông tin lịch hẹn & bác sĩ
        BookableSlot slot = appointment.getBookableSlot();
        if (slot != null) {
            this.bookableSlotId = slot.getId();
            if (slot.getSlotDate() != null) this.date = slot.getSlotDate().toString();
            if (slot.getStartTime() != null) this.time = slot.getStartTime().toString();
            if (slot.getEndTime() != null) this.endTime = slot.getEndTime().toString();

            if (slot.getDoctor() != null) {
                this.doctorId = slot.getDoctor().getId();
                this.doctorName = slot.getDoctor().getFullName();
            }
        }
    }
}