package com.example.j2ee_backend.repository;

import com.example.j2ee_backend.entity.AiSymptomAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AiSymptomAnalysisRepository extends JpaRepository<AiSymptomAnalysis, Integer> {
    List<AiSymptomAnalysis> findByPatientIdOrderByCreatedAtDesc(Integer patientId);
}

