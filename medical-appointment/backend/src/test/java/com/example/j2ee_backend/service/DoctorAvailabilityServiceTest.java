package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorAvailabilityDTO;
import com.example.j2ee_backend.dto.ScheduleUpdateRequestDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.repository.DoctorAvailabilityRepository;
import com.example.j2ee_backend.repository.DoctorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.sql.Date;
import java.sql.Time;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DoctorAvailabilityServiceTest {

    @Mock
    private DoctorAvailabilityRepository doctorAvailabilityRepository;
    @Mock
    private DoctorRepository doctorRepository;
    @Mock
    private AppointmentRepository appointmentRepository;

    private DoctorAvailabilityService service;

    @BeforeEach
    void setUp() {
        service = new DoctorAvailabilityService(
                doctorAvailabilityRepository,
                doctorRepository,
                appointmentRepository
        );
    }

    @Test
    void updateDaySchedule_rejectsRemovingHoursWithConfirmedAppointment() {
        LocalDate nextMonday = nextDateOf(DayOfWeek.MONDAY);
        Appointment confirmed = appointment("confirmed", nextMonday, LocalTime.of(9, 0), LocalTime.of(9, 30));
        when(appointmentRepository.findActiveUpcomingAppointmentsByDoctor(10))
                .thenReturn(List.of(confirmed));

        ScheduleUpdateRequestDTO request = new ScheduleUpdateRequestDTO();
        request.setDayOfWeek("monday");
        request.setSlots(List.of());

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.updateDaySchedule(10, request));

        assertTrue(ex.getMessage().contains("đã xác nhận"));
        verify(doctorAvailabilityRepository, never()).disableByDoctorIdAndDay(10L, "monday");
    }

    @Test
    void updateDaySchedule_allowsChangeWhenConfirmedAppointmentStillCovered() {
        LocalDate nextMonday = nextDateOf(DayOfWeek.MONDAY);
        Appointment confirmed = appointment("confirmed", nextMonday, LocalTime.of(9, 0), LocalTime.of(9, 30));
        when(appointmentRepository.findActiveUpcomingAppointmentsByDoctor(10))
                .thenReturn(List.of(confirmed));

        DoctorAvailabilityDTO stillCoversMorning = new DoctorAvailabilityDTO();
        stillCoversMorning.setStartTime(LocalTime.of(8, 0));
        stillCoversMorning.setEndTime(LocalTime.of(11, 0));
        stillCoversMorning.setSlotDurationMinutes(30);

        assertDoesNotThrow(() ->
                service.assertNoBlockingAppointments(10, "monday", List.of(stillCoversMorning)));
    }

    @Test
    void updateDaySchedule_rejectsShrinkingWindowPastPendingAppointment() {
        LocalDate nextMonday = nextDateOf(DayOfWeek.MONDAY);
        Appointment pending = appointment("pending", nextMonday, LocalTime.of(10, 0), LocalTime.of(10, 30));
        when(appointmentRepository.findActiveUpcomingAppointmentsByDoctor(10))
                .thenReturn(List.of(pending));

        DoctorAvailabilityDTO shortened = new DoctorAvailabilityDTO();
        shortened.setStartTime(LocalTime.of(8, 0));
        shortened.setEndTime(LocalTime.of(9, 30));
        shortened.setSlotDurationMinutes(30);

        IllegalStateException ex = assertThrows(IllegalStateException.class,
                () -> service.assertNoBlockingAppointments(10, "monday", List.of(shortened)));
        assertTrue(ex.getMessage().contains("đang chờ xác nhận"));
    }

    private Appointment appointment(String status, LocalDate date, LocalTime start, LocalTime end) {
        BookableSlot slot = new BookableSlot();
        slot.setSlotDate(Date.valueOf(date));
        slot.setStartTime(Time.valueOf(start));
        slot.setEndTime(Time.valueOf(end));

        Appointment appointment = new Appointment();
        appointment.setStatus(status);
        appointment.setBookableSlot(slot);
        return appointment;
    }

    private LocalDate nextDateOf(DayOfWeek dayOfWeek) {
        LocalDate date = LocalDate.now().plusDays(1);
        while (date.getDayOfWeek() != dayOfWeek) {
            date = date.plusDays(1);
        }
        return date;
    }
}
