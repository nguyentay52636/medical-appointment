package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.DoctorAvailability;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorAvailabilityRepository extends JpaRepository<DoctorAvailability, Integer> {
    List<DoctorAvailability> findByDoctorIdAndDayOfWeekAndActive(Integer doctorId, String dayOfWeek, Boolean active);

    @Modifying
    @Query("UPDATE DoctorAvailability d SET d.active = false WHERE d.doctor.id = :doctorId AND d.dayOfWeek = :day")
    void disableByDoctorIdAndDay(@Param("doctorId") Long doctorId, @Param("day") String day);
    List<DoctorAvailability> findByDoctorIdAndActiveTrue(Long doctorId);

    @Query("""
    SELECT da FROM DoctorAvailability da 
    WHERE da.doctor.id = :doctorId 
      AND LOWER(da.dayOfWeek) = LOWER(:day)
      AND da.startTime = :start 
      AND da.slotDurationMinutes = :duration 
      AND da.active = false
    """)
    Optional<DoctorAvailability> findOld(
            @Param("doctorId") Integer doctorId,
            @Param("day") String day,
            @Param("start") LocalTime start,
            @Param("duration") Integer duration
    );
}
