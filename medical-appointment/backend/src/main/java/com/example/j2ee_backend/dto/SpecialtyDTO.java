package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.Specialty;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Data
@NoArgsConstructor
public class SpecialtyDTO {

    private Integer id;
    private String specialtyName;
    private String description;

    public SpecialtyDTO(Specialty specialty) {
        if (specialty != null) {
            this.id = specialty.getId();
            this.specialtyName = specialty.getSpecialtyName();
            this.description = specialty.getDescription();
        }
    }
}
