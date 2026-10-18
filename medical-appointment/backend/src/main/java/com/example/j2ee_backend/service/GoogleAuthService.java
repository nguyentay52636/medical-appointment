package com.example.j2ee_backend.service;


import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.repository.DoctorRepository;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.jackson2.JacksonFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class GoogleAuthService {

    private final DoctorRepository doctorRepository;

    private final GoogleIdTokenVerifier verifier; // Lưu verifier như một thành viên của class

    public GoogleAuthService(DoctorRepository doctorRepository,
                             @Value("${google.client.id}") String CLIENT_ID) {
        this.doctorRepository = doctorRepository;

        // Khởi tạo verifier một lần duy nhất trong constructor
        this.verifier = new GoogleIdTokenVerifier.Builder(
                new NetHttpTransport(),
                JacksonFactory.getDefaultInstance()
        )
                .setAudience(Collections.singletonList(CLIENT_ID))
                .build();
    }

    /**
     * Verify Google ID token từ frontend và trả về Doctor.
     */
    public Doctor verifyDoctorGoogleToken(String idToken) throws Exception {

        // Hàm này có thể ném ra GeneralSecurityException hoặc IOException
        GoogleIdToken googleIdToken = verifier.verify(idToken);

        if (googleIdToken == null) {
            throw new Exception("Invalid Google ID token");
        }

        String email = googleIdToken.getPayload().getEmail();

        // Kiểm tra email bác sĩ trong DB
        return doctorRepository.findByEmail(email)
                .orElseThrow(() -> new Exception("Bác sĩ với email " + email + " không tìm thấy trong hệ thống. Vui lòng liên hệ admin."));
    }
}