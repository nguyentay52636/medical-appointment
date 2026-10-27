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

    @Transactional
    public void initDefaultAvailability(Doctor doctor) {
        if (doctor == null || doctor.getId() == null) return;
        String[] defaultDays = {"Monday", "Tuesday", "Wednesday", "Thursday", "Friday"};
        LocalTime morningStart = LocalTime.of(8, 0);
        LocalTime morningEnd = LocalTime.of(11, 30);
        LocalTime afternoonStart = LocalTime.of(13, 30);
        LocalTime afternoonEnd = LocalTime.of(17, 0);
        int slotDuration = 30;

        for (String day : defaultDays) {
            // Disable existing if any
            doctorAvailabilityRepository.disableByDoctorIdAndDay(doctor.getId().longValue(), day.toLowerCase());

            // Ca sáng
            DoctorAvailability morning = new DoctorAvailability();
            morning.setDoctor(doctor);
            morning.setDayOfWeek(day);
            morning.setStartTime(morningStart);
            morning.setEndTime(morningEnd);
            morning.setSlotDurationMinutes(slotDuration);
            morning.setActive(true);
            doctorAvailabilityRepository.save(morning);

            // Ca chiều
            DoctorAvailability afternoon = new DoctorAvailability();
            afternoon.setDoctor(doctor);
            afternoon.setDayOfWeek(day);
            afternoon.setStartTime(afternoonStart);
            afternoon.setEndTime(afternoonEnd);
            afternoon.setSlotDurationMinutes(slotDuration);
            afternoon.setActive(true);
            doctorAvailabilityRepository.save(afternoon);
        }
    }

    @Transactional
    public void initDefaultAvailabilityByDoctorId(Integer doctorId) {
        Doctor doctor = doctorRepo.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ với ID: " + doctorId));
        initDefaultAvailability(doctor);
    }

    public com.example.j2ee_backend.dto.DoctorScheduleSummaryDTO getScheduleSummary(Integer doctorId) {
        List<DoctorAvailability> availabilities = findByDoctorId(doctorId);

        java.util.Map<String, String> dayViMap = new java.util.LinkedHashMap<>();
        dayViMap.put("Monday", "Thứ Hai");
        dayViMap.put("Tuesday", "Thứ Ba");
        dayViMap.put("Wednesday", "Thứ Tư");
        dayViMap.put("Thursday", "Thứ Năm");
        dayViMap.put("Friday", "Thứ Sáu");
        dayViMap.put("Saturday", "Thứ Bảy");
        dayViMap.put("Sunday", "Chủ Nhật");

        java.util.Set<String> activeDaySet = new java.util.HashSet<>();
        long totalMinutes = 0;

        for (DoctorAvailability da : availabilities) {
            if (da.getActive() != null && da.getActive() && da.getStartTime() != null && da.getEndTime() != null) {
                String normDay = da.getDayOfWeek().substring(0, 1).toUpperCase() + da.getDayOfWeek().substring(1).toLowerCase();
                activeDaySet.add(normDay);

                long mins = java.time.Duration.between(da.getStartTime(), da.getEndTime()).toMinutes();
                if (mins > 0) {
                    totalMinutes += mins;
                }
            }
        }

        double totalHours = Math.round((totalMinutes / 60.0) * 10.0) / 10.0;
        int activeDaysCount = activeDaySet.size();
        double minRequiredHours = 20.0;
        int minRequiredDays = 3;
        boolean isCompliant = totalHours >= minRequiredHours && activeDaysCount >= minRequiredDays;

        List<String> orderedDays = new java.util.ArrayList<>();
        List<String> orderedDaysVi = new java.util.ArrayList<>();
        for (String dayEn : dayViMap.keySet()) {
            if (activeDaySet.contains(dayEn)) {
                orderedDays.add(dayEn);
                orderedDaysVi.add(dayViMap.get(dayEn));
            }
        }

        String complianceMessage;
        if (isCompliant) {
            complianceMessage = "Đạt chuẩn quy chế phòng khám (" + totalHours + "h/tuần, " + activeDaysCount + " ngày).";
        } else {
            complianceMessage = "Chưa đạt chuẩn tối thiểu của phòng khám (Cần tối thiểu " + minRequiredHours + "h/tuần và " + minRequiredDays + " ngày trực). Hiện tại: " + totalHours + "h, " + activeDaysCount + " ngày.";
        }

        return com.example.j2ee_backend.dto.DoctorScheduleSummaryDTO.builder()
                .doctorId(doctorId)
                .totalWeeklyHours(totalHours)
                .activeDaysCount(activeDaysCount)
                .minRequiredHours(minRequiredHours)
                .minRequiredDays(minRequiredDays)
                .isCompliant(isCompliant)
                .workingDays(orderedDays)
                .workingDaysVi(orderedDaysVi)
                .complianceMessage(complianceMessage)
                .build();
    }
}

