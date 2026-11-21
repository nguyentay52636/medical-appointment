package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorAvailabilityDTO;
import com.example.j2ee_backend.dto.ScheduleUpdateRequestDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.entity.DoctorAvailability;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.repository.DoctorAvailabilityRepository;
import com.example.j2ee_backend.repository.DoctorRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
public class DoctorAvailabilityService {

    private final DoctorAvailabilityRepository doctorAvailabilityRepository;
    private final DoctorRepository doctorRepo;
    private final AppointmentRepository appointmentRepository;
    @PersistenceContext
    private EntityManager entityManager;

    @Autowired
    public DoctorAvailabilityService(DoctorAvailabilityRepository doctorAvailabilityRepository,
                                     DoctorRepository doctorRepo,
                                     AppointmentRepository appointmentRepository) {
        this.doctorAvailabilityRepository = doctorAvailabilityRepository;
        this.doctorRepo = doctorRepo;
        this.appointmentRepository = appointmentRepository;
    }

    public List<DoctorAvailability> findByDoctorId(Integer doctorId) {
        return doctorAvailabilityRepository.findByDoctorIdAndActiveTrue(Long.valueOf(doctorId));
    }

    @Transactional
    public void updateDaySchedule(Integer doctorId, ScheduleUpdateRequestDTO request) {
        String day = request.getDayOfWeek().toLowerCase();
        List<DoctorAvailabilityDTO> incoming = Optional.ofNullable(request.getSlots())
                .orElse(Collections.emptyList());

        assertNoBlockingAppointments(doctorId, day, incoming);

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

    void assertNoBlockingAppointments(Integer doctorId, String dayOfWeek, List<DoctorAvailabilityDTO> incoming) {
        List<Appointment> upcoming = appointmentRepository.findActiveUpcomingAppointmentsByDoctor(doctorId);
        List<String> blocked = new ArrayList<>();
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        DateTimeFormatter timeFmt = DateTimeFormatter.ofPattern("HH:mm");

        for (Appointment appointment : upcoming) {
            BookableSlot slot = appointment.getBookableSlot();
            if (slot == null || slot.getSlotDate() == null) {
                continue;
            }
            if (!matchesDay(slot.getSlotDate(), dayOfWeek)) {
                continue;
            }

            LocalTime start = slot.getStartTime() != null ? slot.getStartTime().toLocalTime() : null;
            LocalTime end = slot.getEndTime() != null ? slot.getEndTime().toLocalTime() : null;
            if (isAppointmentCovered(start, end, incoming)) {
                continue;
            }

            String dateStr = slot.getSlotDate().toLocalDate().format(dateFmt);
            String startStr = start != null ? start.format(timeFmt) : "?";
            String endStr = end != null ? end.format(timeFmt) : "?";
            String statusLabel = "confirmed".equalsIgnoreCase(appointment.getStatus())
                    ? "đã xác nhận"
                    : "đang chờ xác nhận";
            blocked.add(dateStr + " " + startStr + "-" + endStr + " (" + statusLabel + ")");
        }

        if (!blocked.isEmpty()) {
            throw new IllegalStateException(
                    "Không thể xóa hoặc thu hẹp lịch làm việc vì đã có lịch hẹn trong khung giờ này: "
                            + String.join("; ", blocked)
                            + ". Bác sĩ không được xóa khung giờ trùng với lịch hẹn đã đặt/đã xác nhận.");
        }
    }

    private boolean matchesDay(java.sql.Date slotDate, String dayOfWeek) {
        if (slotDate == null || dayOfWeek == null) {
            return false;
        }
        String slotDay = slotDate.toLocalDate().getDayOfWeek()
                .getDisplayName(TextStyle.FULL, Locale.ENGLISH);
        return slotDay.equalsIgnoreCase(dayOfWeek);
    }

    boolean isAppointmentCovered(LocalTime start, LocalTime end, List<DoctorAvailabilityDTO> incoming) {
        if (start == null || end == null) {
            return true;
        }
        for (DoctorAvailabilityDTO dto : incoming) {
            if (dto.getStartTime() == null || dto.getEndTime() == null) {
                continue;
            }
            boolean startsInside = !start.isBefore(dto.getStartTime());
            boolean endsInside = !end.isAfter(dto.getEndTime());
            if (startsInside && endsInside) {
                return true;
            }
        }
        return false;
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

