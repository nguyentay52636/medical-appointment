package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.Appointment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Integer> {

    @Query("SELECT a FROM Appointment a " +
            "JOIN FETCH a.patient p " +
            "JOIN FETCH a.bookableSlot b " +
            "WHERE b.doctor.id = :doctorId " +
            "ORDER BY a.bookableSlot.startTime ASC")
    List<Appointment> findByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT a FROM Appointment a " +
            "JOIN a.bookableSlot b " +
            "WHERE a.id = :appointmentId AND b.doctor.id = :doctorId")
    Optional<Appointment> findByIdAndDoctor(@Param("appointmentId") Integer appointmentId,
                                            @Param("doctorId") Integer doctorId);

    List<Appointment> findByPatientId(Integer patientId);

    Optional<Appointment> findTopByOrderByIdDesc();

    Optional<Appointment> findByVnpTxnRef(String vnpTxnRef);

    // 1. Tổng số lịch hẹn hôm nay (không tính hủy)
    @Query("""
        SELECT COUNT(a) 
        FROM Appointment a 
        JOIN a.bookableSlot bs 
        WHERE bs.doctor.id = :doctorId 
          AND bs.slotDate = :today 
          AND a.status <> 'cancelled'
        """)
    Long countTotalAppointmentsToday(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );

    // 2. Số lịch hẹn chờ duyệt hôm nay
    @Query("""
        SELECT COUNT(a) 
        FROM Appointment a 
        JOIN a.bookableSlot bs 
        WHERE bs.doctor.id = :doctorId 
          AND bs.slotDate = :today 
          AND a.status = 'pending'
        """)
    Long countPendingAppointmentsToday(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );

    // 3. Số lịch hẹn đã xác nhận hôm nay
    @Query("""
        SELECT COUNT(a) 
        FROM Appointment a 
        JOIN a.bookableSlot bs 
        WHERE bs.doctor.id = :doctorId 
          AND bs.slotDate = :today 
          AND a.status = 'confirmed'
        """)
    Long countConfirmedAppointmentsToday(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );

    // 4. Tổng số bệnh nhân DUY NHẤT có lịch hôm nay (không hủy)
    @Query("""
        SELECT COUNT(DISTINCT a.patient.id) 
        FROM Appointment a 
        JOIN a.bookableSlot bs 
        WHERE bs.doctor.id = :doctorId 
          AND bs.slotDate = :today 
          AND a.status <> 'cancelled'
        """)
    Long countUniquePatientsToday(
            @Param("doctorId") Long doctorId,
            @Param("today") LocalDate today
    );
    @Query("""
    SELECT a FROM Appointment a
    JOIN a.bookableSlot bs
    WHERE bs.doctor.id = :doctorId
    AND (
        bs.slotDate > CURRENT_DATE
        OR (bs.slotDate = CURRENT_DATE AND bs.startTime > CURRENT_TIME)
    )
    ORDER BY bs.slotDate ASC, bs.startTime ASC
""")
    List<Appointment> findUpcomingAppointmentsByDoctor(@Param("doctorId") Long doctorId);

    @Query("""
    SELECT a FROM Appointment a 
    JOIN a.bookableSlot bs 
    WHERE bs.doctor.id = :doctorId 
      AND bs.slotDate = CURRENT_DATE 
      AND bs.startTime < CURRENT_TIME 
      AND a.status NOT IN ('completed', 'cancelled')
    ORDER BY bs.startTime DESC
    """)
    List<Appointment> findMissedAppointmentsByDoctor(@Param("doctorId") Long doctorId);

    // Lấy các appointment trong khoảng thời gian
    List<Appointment> findAllByBookableSlotSlotDateBetween(Date startDate, Date endDate);

    //====================== biểu đồ tròn =====================

    interface StatusCountProjection {
        String getStatus();
        Long getCount();
    }

    // Đếm tổng số lịch hẹn theo từng trạng thái trong tháng,năm (slot_date) và theo bác sĩ
    @Query(value = "SELECT a.status as status, COUNT(a.id) as count " +
            "FROM Appointment a JOIN a.bookableSlot b " +
            "WHERE MONTH(b.slotDate) = :month AND YEAR(b.slotDate) = :year " +
            "AND b.doctor.id = :doctorId " +
            "GROUP BY a.status")
    List<StatusCountProjection> countAppointmentsByStatusAndMonthYear(
            @Param("month") int month,
            @Param("year") int year,
            @Param("doctorId") Integer doctorId // <--- THAM SỐ MỚI
    );

    //====================== biểu đồ cột =====================
    interface MonthlyStatsProjection {
        Integer getMonth();
        Long getTotalAppointments();
        Long getRevenue(); // Dùng Long vì đây là SUM
    }

    @Query(value = """
    SELECT 
        MONTH(bs.slot_date) AS month, 
        COUNT(CASE WHEN a.status = 'completed' THEN a.id END) AS totalAppointments, 
        SUM(CASE WHEN a.status = 'completed' AND a.payment_status = 'paid' THEN a.price ELSE 0 END) AS revenue 
        
    FROM dat_lich_kham_benh.appointment a
    JOIN dat_lich_kham_benh.bookable_slot bs ON a.bookable_slot_id = bs.id
    WHERE YEAR(bs.slot_date) = :year
      AND bs.doctor_id = :doctorId  /* <--- ĐIỀU KIỆN MỚI CHO NATIVE QUERY */
    GROUP BY MONTH(bs.slot_date)
    ORDER BY MONTH(bs.slot_date) ASC
""", nativeQuery = true)
    List<MonthlyStatsProjection> getMonthlyRevenueAndAppointmentsByYear(
            @Param("year") int year,
            @Param("doctorId") Integer doctorId // <--- THAM SỐ MỚI
    );

    // Truy vấn dữ liệu chi tiết lịch hẹn trong khoảng thời gian
    // Truy vấn dữ liệu chi tiết lịch hẹn trong khoảng thời gian
    @Query("""
    SELECT a 
    FROM Appointment a 
    JOIN FETCH a.bookableSlot bs
    JOIN FETCH a.patient p
    WHERE bs.slotDate BETWEEN :startDate AND :endDate
    AND bs.doctor.id = :doctorId 
    ORDER BY bs.slotDate ASC, bs.startTime ASC
""")
    List<Appointment> findDetailedAppointmentsByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("doctorId") Integer doctorId // <--- THAM SỐ MỚI
    );

    //Truy vấn Tổng Doanh thu theo Khoảng thời gian
    // Chỉ tính khi status = 'completed' VÀ payment_status = 'paid'
    @Query(value = """
    SELECT SUM(a.price) 
    FROM Appointment a 
    JOIN a.bookableSlot bs 
    WHERE bs.slotDate BETWEEN :startDate AND :endDate 
      AND a.status = 'completed'
      AND a.paymentStatus = 'paid'
      AND bs.doctor.id = :doctorId 
""")
    Long calculateTotalRevenueByDateRange(
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("doctorId") Integer doctorId // <--- THAM SỐ MỚI
    );

}



