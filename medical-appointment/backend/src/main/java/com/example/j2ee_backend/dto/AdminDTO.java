package com.example.j2ee_backend.dto;

import com.example.j2ee_backend.entity.Admin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminDTO {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String phoneNumber;
    private String avatarUrl;

    public AdminDTO(Admin admin) {
        if (admin != null) {
            this.id = admin.getId();
            this.username = admin.getUsername();
            this.email = admin.getEmail();
            this.fullName = admin.getFullName();
            this.role = admin.getRole();
            this.phoneNumber = admin.getPhoneNumber();
            this.avatarUrl = admin.getAvatarUrl();
        }
    }
}
