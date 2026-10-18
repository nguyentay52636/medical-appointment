package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorAvailabilityDTO;
import com.example.j2ee_backend.dto.ScheduleUpdateRequestDTO;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.DoctorAvailability;
import com.example.j2ee_backend.repository.DoctorAvailabilityRepository;
import com.example.j2ee_backend.repository.DoctorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final DoctorRepository doctorRepo;
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public DoctorAvailabilityService(DoctorAvailabilityRepository doctorAvailabilityRepository,
                                     DoctorRepository doctorRepo) {
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.doctorRepo = doctorRepo;
    }

    public List<DoctorAvailability> findByDoctorId(Integer doctorId) {
        return doctorAvailabilityRepository.findByDoctorIdAndActiveTrue(Long.valueOf(doctorId));
    }

    @Transactional
    public void updateDaySchedule(Integer doctorId, ScheduleUpdateRequestDTO request) {
        String day = request.getDayOfWeek().toLowerCase();
        List<DoctorAvailabilityDTO> incoming = Optional.ofNullable(request.getSlots())
                .orElse(Collections.emptyList());

        // 1. Disable tất cả slot cũ
        doctorAvailabilityRepository.disableByDoctorIdAndDay(doctorId.longValue(), day);
        entityManager.flush();
        entityManager.clear();

        if (incoming.isEmpty()) return;
        Doctor doctorRef = entityManager.getReference(Doctor.class, doctorId);
        for (DoctorAvailabilityDTO dto : incoming) {
            LocalTime start = dto.getStartTime();
            LocalTime end = dto.getEndTime();
            Integer duration = dto.getSlotDurationMinutes();

            // 2. Tìm slot cũ: cùng start_time + duration + active = false
            Optional<DoctorAvailability> old = doctorAvailabilityRepository.findOld(doctorId, day, start, duration);

            DoctorAvailability slot;
            if (old.isPresent()) {
                slot = old.get();
                slot.setEndTime(end);
                slot.setActive(true);
            } else {
                slot = new DoctorAvailability();
                slot.setDoctor(doctorRef);
                slot.setDayOfWeek(day);
                slot.setStartTime(start);
                slot.setEndTime(end);
                slot.setSlotDurationMinutes(duration);
                slot.setActive(true);
            }
            doctorAvailabilityRepository.save(slot);
        }
    }
}

