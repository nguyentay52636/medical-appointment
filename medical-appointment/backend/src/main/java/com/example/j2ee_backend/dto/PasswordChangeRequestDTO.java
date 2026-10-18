package com.example.j2ee_backend.dto;

import lombok.Data;

@Data
public class PasswordChangeRequestDTO {
    private String oldPassword;
    private String newPassword;
    private String confirmPassword;
}
