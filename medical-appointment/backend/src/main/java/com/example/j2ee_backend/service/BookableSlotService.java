package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.BookableSlotDTO;
import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.DoctorAvailability;
import com.example.j2ee_backend.repository.BookableSlotRepository;
import com.example.j2ee_backend.repository.DoctorAvailabilityRepository;
import com.example.j2ee_backend.repository.DoctorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.sql.Time;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BookableSlotService {

    @Autowired
    private final BookableSlotRepository bookableSlotRepository;
    @Autowired
    private final DoctorRepository doctorRepository;
    @Autowired
    private final DoctorAvailabilityRepository doctorAvailabilityRepository;

    private BookableSlotDTO mapToDTO(BookableSlot slot) {
        return new BookableSlotDTO(
                slot.getId(),
                slot.getDoctor().getId(),
                slot.getSlotDate(),
                slot.getStartTime(),
                slot.getEndTime(),
                slot.getStatus()
        );
    }

    public List<BookableSlotDTO> getSlotsByDoctorAndDate(Integer doctorId, LocalDate date) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));

        String dayName = date.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<DoctorAvailability> availabilities = doctorAvailabilityRepository.findByDoctorIdAndDayOfWeekAndActive(doctorId, dayName, true);

        List<BookableSlotDTO> result = new ArrayList<>();

        for (DoctorAvailability avail : availabilities) {
            LocalTime start = avail.getStartTime();
            LocalTime end = avail.getEndTime();
            int duration = avail.getSlotDurationMinutes();

            while (start.plusMinutes(duration).compareTo(end) <= 0) {
                Optional<BookableSlot> existing = bookableSlotRepository.findByDoctorAndSlotDateAndStartTime(doctor, date, start);

                BookableSlot slot;
                if (existing.isPresent()) {
                    slot = existing.get();
                } else {
                    slot = new BookableSlot();
                    slot.setDoctor(doctor);
                    slot.setSlotDate(java.sql.Date.valueOf(date));
                    slot.setStartTime(Time.valueOf(start));
                    slot.setEndTime(Time.valueOf(start.plusMinutes(duration)));
                    slot.setDoctorAvailability(avail);
                    slot.setStatus("available");
                    bookableSlotRepository.save(slot);
                }

                result.add(new BookableSlotDTO(
                        slot.getId(),
                        doctorId,
                        slot.getSlotDate(),
                        slot.getStartTime(),
                        slot.getEndTime(),
                        slot.getStatus()
                ));

                start = start.plusMinutes(duration);
            }
        }

        return result;
    }
}

