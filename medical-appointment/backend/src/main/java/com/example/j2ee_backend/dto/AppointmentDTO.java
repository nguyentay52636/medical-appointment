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
    private String paymentStatus; // "pending" hoặc "paid" hoặc "failed"
    private Integer price;
    private String vnpTxnRef;

    public AppointmentDTO(Appointment appointment) {
        if (appointment == null) return;
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

    public Integer getId() { return id; }
    public void setId(Integer id) { this.id = id; }

    public String getAppointmentCode() { return appointmentCode; }
    public void setAppointmentCode(String appointmentCode) { this.appointmentCode = appointmentCode; }

    public Integer getPatientId() { return patientId; }
    public void setPatientId(Integer patientId) { this.patientId = patientId; }

    public Integer getDoctorId() { return doctorId; }
    public void setDoctorId(Integer doctorId) { this.doctorId = doctorId; }

    public Integer getBookableSlotId() { return bookableSlotId; }
    public void setBookableSlotId(Integer bookableSlotId) { this.bookableSlotId = bookableSlotId; }

    public String getPatientName() { return patientName; }
    public void setPatientName(String patientName) { this.patientName = patientName; }

    public String getDoctorName() { return doctorName; }
    public void setDoctorName(String doctorName) { this.doctorName = doctorName; }

    public String getPatientPhone() { return patientPhone; }
    public void setPatientPhone(String patientPhone) { this.patientPhone = patientPhone; }

    public String getPatientEmail() { return patientEmail; }
    public void setPatientEmail(String patientEmail) { this.patientEmail = patientEmail; }

    public String getDate() { return date; }
    public void setDate(String date) { this.date = date; }

    public String getTime() { return time; }
    public void setTime(String time) { this.time = time; }

    public String getEndTime() { return endTime; }
    public void setEndTime(String endTime) { this.endTime = endTime; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }

    public Timestamp getCreatedAt() { return createdAt; }
    public void setCreatedAt(Timestamp createdAt) { this.createdAt = createdAt; }

    public Timestamp getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Timestamp updatedAt) { this.updatedAt = updatedAt; }

    public String getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(String paymentMethod) { this.paymentMethod = paymentMethod; }

    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }

    public Integer getPrice() { return price; }
    public void setPrice(Integer price) { this.price = price; }

    public String getVnpTxnRef() { return vnpTxnRef; }
    public void setVnpTxnRef(String vnpTxnRef) { this.vnpTxnRef = vnpTxnRef; }
}