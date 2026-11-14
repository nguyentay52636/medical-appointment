package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.DoctorReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorReviewRepository extends JpaRepository<DoctorReview, Integer> {

    List<DoctorReview> findByDoctorIdOrderByCreatedAtDesc(Integer doctorId);

    Optional<DoctorReview> findByDoctorIdAndPatientId(Integer doctorId, Integer patientId);

    boolean existsByDoctorIdAndPatientId(Integer doctorId, Integer patientId);

    @Query("SELECT AVG(r.rating) FROM DoctorReview r WHERE r.doctor.id = :doctorId")
    Double getAverageRatingByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT COUNT(r) FROM DoctorReview r WHERE r.doctor.id = :doctorId")
    Integer countReviewsByDoctorId(@Param("doctorId") Integer doctorId);

    @Query("SELECT r.rating, COUNT(r) FROM DoctorReview r WHERE r.doctor.id = :doctorId GROUP BY r.rating")
    List<Object[]> getRatingDistributionByDoctorId(@Param("doctorId") Integer doctorId);
}

