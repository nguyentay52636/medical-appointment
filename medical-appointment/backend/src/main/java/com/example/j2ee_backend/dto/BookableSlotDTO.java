package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.BookableSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Time;

@Data
public class BookableSlotDTO {

    private Integer id;
    private Integer doctorId;
    private Date slotDate;
    private Time startTime;
    private Time endTime;
    private String status;// 'available', 'booked', 'off'

    public BookableSlotDTO() {
    }

    public BookableSlotDTO(Integer id, Integer doctorId, Date slotDate, Time startTime, Time endTime, String status) {
        this.id = id;
        this.doctorId = doctorId;
        this.slotDate = slotDate;
        this.startTime = startTime;
        this.endTime = endTime;
        this.status = status;
    }

    public BookableSlotDTO(BookableSlot bookableSlot) {
        if (bookableSlot != null) {
            this.id = bookableSlot.getId();
            this.doctorId = bookableSlot.getDoctor() != null ? bookableSlot.getDoctor().getId() : null;
            this.slotDate = bookableSlot.getSlotDate();
            this.startTime = bookableSlot.getStartTime();
            this.endTime = bookableSlot.getEndTime();
            this.status = bookableSlot.getStatus();
        }
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Integer getDoctorId() {
        return doctorId;
    }

    public void setDoctorId(Integer doctorId) {
        this.doctorId = doctorId;
    }

    public Date getSlotDate() {
        return slotDate;
    }

    public void setSlotDate(Date slotDate) {
        this.slotDate = slotDate;
    }

    public Time getStartTime() {
        return startTime;
    }

    public void setStartTime(Time startTime) {
        this.startTime = startTime;
    }

    public Time getEndTime() {
        return endTime;
    }

    public void setEndTime(Time endTime) {
        this.endTime = endTime;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
