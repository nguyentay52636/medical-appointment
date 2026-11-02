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

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getSpecialtyName() {
        return specialtyName;
    }

    public void setSpecialtyName(String specialtyName) {
        this.specialtyName = specialtyName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
