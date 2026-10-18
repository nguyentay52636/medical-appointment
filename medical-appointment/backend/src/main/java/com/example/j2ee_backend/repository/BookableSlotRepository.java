package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Optional;

@Repository
public interface BookableSlotRepository extends JpaRepository<BookableSlot, Integer> {

    Optional<BookableSlot> findByDoctorAndSlotDateAndStartTime(Doctor doctor, LocalDate date, LocalTime startTime);
}
