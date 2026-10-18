package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.SpecialtyDTO;
import com.example.j2ee_backend.entity.Specialty;
import com.example.j2ee_backend.repository.SpecialtyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SpecialtyService {
    private final SpecialtyRepository specialtyRepository;

    @Autowired
    public SpecialtyService(SpecialtyRepository specialtyRepository){
        this.specialtyRepository = specialtyRepository;
    }

    public List<SpecialtyDTO> getAllSpecialties() {
        return specialtyRepository.findAll()
                .stream()
                .map(SpecialtyDTO::new)
                .toList();
    }

    public SpecialtyDTO getSpecialtyById(Integer id) {
        Specialty s = specialtyRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Not found"));
        return new SpecialtyDTO(s);
    }

}
