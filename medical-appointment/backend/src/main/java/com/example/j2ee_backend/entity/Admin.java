package com.example.j2ee_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.sql.Timestamp;

@Entity
@Table(name = "admin")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Admin {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Integer id;

    @Column(name = "username", nullable = false, unique = true, length = 100)
    private String username;

    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;

    @Column(name = "password", nullable = false, length = 255)
    private String password;

    @Column(name = "full_name", nullable = false, length = 255)
    private String fullName;

    @Column(name = "role", nullable = false, length = 50)
    private String role; // "admin"

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "avatar_url", columnDefinition = "LONGTEXT")
    private String avatarUrl;

    @Column(name = "created_at", updatable = false)
    private Timestamp createdAt;

    @Column(name = "updated_at")
    private Timestamp updatedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = new Timestamp(System.currentTimeMillis());
        }
        if (role == null || role.isBlank()) {
            role = "admin";
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = new Timestamp(System.currentTimeMillis());
    }
}
