package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.BookableSlot;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Date;
import java.sql.Time;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class BookableSlotDTO {

    private Integer id;
    private Integer doctorId;
    private Date slotDate;
    private Time startTime;
    private Time endTime;
    private String status;// 'available', 'booked', 'off'

    public BookableSlotDTO(BookableSlot bookableSlot) {
        this.id = bookableSlot.getId();
        this.doctorId = bookableSlot.getDoctor().getId();
        this.slotDate = bookableSlot.getSlotDate();
        this.startTime = bookableSlot.getStartTime();
        this.endTime = bookableSlot.getEndTime();
        this.status = bookableSlot.getStatus();
    }

}
