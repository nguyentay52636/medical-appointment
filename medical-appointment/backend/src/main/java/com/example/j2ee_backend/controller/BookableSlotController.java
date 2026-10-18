package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.BookableSlotDTO;
import com.example.j2ee_backend.service.BookableSlotService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/bookable_slots")
@RequiredArgsConstructor
public class BookableSlotController {

    private final BookableSlotService bookableSlotService;

    @GetMapping("/doctor/{doctorId}/slots")
    public List<BookableSlotDTO> getSlots(
            @PathVariable Integer doctorId,
            @RequestParam("date") @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date
    ) {
        return bookableSlotService.getSlotsByDoctorAndDate(doctorId, date);
    }
}
