package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.SpecialtyDTO;
import com.example.j2ee_backend.service.SpecialtyService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/specialty")
public class SpecialtyController {
    private final SpecialtyService specialtyService;

    @GetMapping("/all")
    public List<SpecialtyDTO> getAllSpecialties(){
        return specialtyService.getAllSpecialties();
    }

    @GetMapping("/{id}")
    public SpecialtyDTO getSpecialtyById(@PathVariable Integer id){
        return specialtyService.getSpecialtyById(id);
    }
}
