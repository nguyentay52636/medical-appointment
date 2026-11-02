package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.MedicalRecord;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordDTO {
    private Integer id;
    private Integer appointmentId;
    private String appointmentCode;
    
    // Patient Info
    private Integer patientId;
    private String patientName;
    private String patientPhone;
    private String patientEmail;

    // Doctor & Specialty Info
    private Integer doctorId;
    private String doctorName;
    private String specialtyName;

    // Examination Type & Status
    private String examinationType;
    private String status;

    // Bước 1: Sinh hiệu & Triệu chứng lâm sàng
    private String bloodPressure;
    private Integer heartRate;
    private BigDecimal temperature;
    private BigDecimal weight;
    private BigDecimal height;
    private String clinicalSymptoms;

    // Bước 2: Chẩn đoán
    private String diagnosis;
    private String labResults;

    // Bước 3: Toa thuốc (JSON string)
    private String prescriptions;

    // Bước 4: Lời dặn & Hẹn tái khám
    private String doctorAdvice;
    private LocalDate followUpDate;

    // Timestamps
    private String createdAt;
    private String updatedAt;

    public MedicalRecordDTO(MedicalRecord record) {
        if (record == null) return;
        this.id = record.getId();
        if (record.getAppointment() != null) {
            this.appointmentId = record.getAppointment().getId();
            this.appointmentCode = record.getAppointment().getAppointmentCode();
        }
        if (record.getPatient() != null) {
            this.patientId = record.getPatient().getId();
            this.patientName = record.getPatient().getFullName();
            this.patientPhone = record.getPatient().getPhoneNumber();
            this.patientEmail = record.getPatient().getEmail();
        }
        if (record.getDoctor() != null) {
            this.doctorId = record.getDoctor().getId();
            this.doctorName = record.getDoctor().getFullName();
            if (record.getDoctor().getSpecialty() != null) {
                this.specialtyName = record.getDoctor().getSpecialty().getSpecialtyName();
            }
        }
        this.examinationType = record.getExaminationType();
        this.status = record.getStatus();
        this.bloodPressure = record.getBloodPressure();
        this.heartRate = record.getHeartRate();
        this.temperature = record.getTemperature();
        this.weight = record.getWeight();
        this.height = record.getHeight();
        this.clinicalSymptoms = record.getClinicalSymptoms();
        this.diagnosis = record.getDiagnosis();
        this.labResults = record.getLabResults();
        this.prescriptions = record.getPrescriptions();
        this.doctorAdvice = record.getDoctorAdvice();
        this.followUpDate = record.getFollowUpDate();
        this.createdAt = record.getCreatedAt() != null ? record.getCreatedAt().toString() : null;
        this.updatedAt = record.getUpdatedAt() != null ? record.getUpdatedAt().toString() : null;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getAppointmentId() {
        return appointmentId;
    }

    public void setAppointmentId(Integer appointmentId) {
        this.appointmentId = appointmentId;
    }

    public String getAppointmentCode() {
        return appointmentCode;
    }

    public void setAppointmentCode(String appointmentCode) {
        this.appointmentCode = appointmentCode;
    }

    public Integer getPatientId() {
        return patientId;
    }

    public void setPatientId(Integer patientId) {
        this.patientId = patientId;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getPatientPhone() {
        return patientPhone;
    }

    public void setPatientPhone(String patientPhone) {
        this.patientPhone = patientPhone;
    }

    public String getPatientEmail() {
        return patientEmail;
    }

    public void setPatientEmail(String patientEmail) {
        this.patientEmail = patientEmail;
    }

    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }

    public String getDoctorName() {
        return doctorName;
    }

    public void setDoctorName(String doctorName) {
        this.doctorName = doctorName;
    }

    public String getSpecialtyName() {
        return specialtyName;
    }

    public void setSpecialtyName(String specialtyName) {
        this.specialtyName = specialtyName;
    }

    public String getExaminationType() {
        return examinationType;
    }

    public void setExaminationType(String examinationType) {
        this.examinationType = examinationType;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getBloodPressure() {
        return bloodPressure;
    }

    public void setBloodPressure(String bloodPressure) {
        this.bloodPressure = bloodPressure;
    }

    public Integer getHeartRate() {
        return heartRate;
    }

    public void setHeartRate(Integer heartRate) {
        this.heartRate = heartRate;
    }

    public BigDecimal getTemperature() {
        return temperature;
    }

    public void setTemperature(BigDecimal temperature) {
        this.temperature = temperature;
    }

    public BigDecimal getWeight() {
        return weight;
    }

    public void setWeight(BigDecimal weight) {
        this.weight = weight;
    }

    public BigDecimal getHeight() {
        return height;
    }

    public void setHeight(BigDecimal height) {
        this.height = height;
    }

    public String getClinicalSymptoms() {
        return clinicalSymptoms;
    }

    public void setClinicalSymptoms(String clinicalSymptoms) {
        this.clinicalSymptoms = clinicalSymptoms;
    }

    public String getDiagnosis() {
        return diagnosis;
    }

    public void setDiagnosis(String diagnosis) {
        this.diagnosis = diagnosis;
    }

    public String getLabResults() {
        return labResults;
    }

    public void setLabResults(String labResults) {
        this.labResults = labResults;
    }

    public String getPrescriptions() {
        return prescriptions;
    }

    public void setPrescriptions(String prescriptions) {
        this.prescriptions = prescriptions;
    }

    public String getDoctorAdvice() {
        return doctorAdvice;
    }

    public void setDoctorAdvice(String doctorAdvice) {
        this.doctorAdvice = doctorAdvice;
    }

    public LocalDate getFollowUpDate() {
        return followUpDate;
    }

    public void setFollowUpDate(LocalDate followUpDate) {
        this.followUpDate = followUpDate;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
    }
}
