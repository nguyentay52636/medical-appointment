package com.example.j2ee_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
public class AppointmentDetailDTO {
    private Integer id;
    private String appointmentCode;
    private String patientName;
    private String dateTime; // Định dạng chuỗi (YYYY-MM-DD HH:mm)
    private Integer price;
    private String status;

    public AppointmentDetailDTO() {
    }

    public AppointmentDetailDTO(Integer id, String appointmentCode, String patientName, String dateTime, Integer price, String status) {
        this.id = id;
        this.appointmentCode = appointmentCode;
        this.patientName = patientName;
        this.dateTime = dateTime;
        this.price = price;
        this.status = status;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getAppointmentCode() {
        return appointmentCode;
    }

    public void setAppointmentCode(String appointmentCode) {
        this.appointmentCode = appointmentCode;
    }

    public String getPatientName() {
        return patientName;
    }

    public void setPatientName(String patientName) {
        this.patientName = patientName;
    }

    public String getDateTime() {
        return dateTime;
    }

    public void setDateTime(String dateTime) {
        this.dateTime = dateTime;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}