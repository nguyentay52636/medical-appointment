package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Integer> {

    Optional<Doctor> findByEmail(String email);

    List<Doctor> findBySpecialty_Id(Integer specialtyId);
}
