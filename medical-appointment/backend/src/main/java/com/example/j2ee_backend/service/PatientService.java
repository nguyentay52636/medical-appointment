package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.PasswordChangeRequestDTO;
import com.example.j2ee_backend.dto.PatientDTO;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.repository.PatientRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Base64;

@Service
public class PatientService {
    private final PatientRepository patientRepository;
    private final PasswordEncoder passwordEncoder;
    private EmailService emailService;
    private TokenService tokenService;

    @Autowired
    public PatientService(PatientRepository patientRepository, PasswordEncoder passwordEncoder, EmailService emailService, TokenService tokenService){
        this.patientRepository = patientRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.tokenService = tokenService;
    }

    public Patient login(String email, String password) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("Email không đúng. Vui lòng nhập lại!"));
        if (!passwordEncoder.matches(password, patient.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng. Vui lòng nhập lại!");
        }
        return patient;
    }

    public boolean existsByEmail(String email){
        return patientRepository.existsByEmail(email);
    }

    public boolean existsByPhoneNumber(String phoneNumber){
        return patientRepository.existsByPhoneNumber(phoneNumber);
    }

    public Patient registerPatient(PatientDTO dto){
        Patient patient = new Patient();
        patient.setFullName(dto.getFullName());
        patient.setEmail(dto.getEmail());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setAddress(dto.getAddress());
        patient.setPassword(passwordEncoder.encode(dto.getPassword()));

        return patientRepository.save(patient);
    }

    public Patient updatePatient(Integer id, PatientDTO dto) throws Exception {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new Exception("Patient not found"));

        // Kiểm tra số điện thoại có trùng với patient khác không
        if (!patient.getPhoneNumber().equals(dto.getPhoneNumber())
                && patientRepository.existsByPhoneNumber(dto.getPhoneNumber())) {
            throw new Exception("Số điện thoại đã tồn tại");
        }

        patient.setFullName(dto.getFullName());
        patient.setPhoneNumber(dto.getPhoneNumber());
        patient.setAddress(dto.getAddress());
        patient.setEmail(dto.getEmail());

        return patientRepository.save(patient);
    }

    public void changePassword(Integer patientId, PasswordChangeRequestDTO request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bệnh nhân"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), patient.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        // Kiểm tra mật khẩu mới >= 6 ký tự
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải >= 6 ký tự");
        }

        // Kiểm tra mật khẩu mới khác mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), patient.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng mật khẩu cũ");
        }

        // Lưu mật khẩu mới
        patient.setPassword(passwordEncoder.encode(request.getNewPassword()));
        patientRepository.save(patient);
    }

    public void forgotPassword(String email) {
        Patient patient = patientRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        String token = tokenService.createToken(email);
        emailService.sendResetPasswordEmail(email, patient.getFullName(), "bệnh nhân", token);
    }

    public void resetPassword(String token, String newPassword) {
        TokenService.TokenInfo info = tokenService.validateToken(token);
        if (info == null) {
            throw new RuntimeException("Token không hợp lệ hoặc hết hạn");
        }

        Patient patient = patientRepository.findByEmail(info.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        patient.setPassword(passwordEncoder.encode(newPassword));
        patientRepository.save(patient);

        tokenService.removeToken(token);
    }

    public java.util.List<com.example.j2ee_backend.dto.PatientDTO> getAllPatients() {
        return patientRepository.findAll()
                .stream()
                .map(com.example.j2ee_backend.dto.PatientDTO::new)
                .collect(java.util.stream.Collectors.toList());
    }
}


