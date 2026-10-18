package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.DoctorDTO;
import com.example.j2ee_backend.dto.PasswordChangeRequestDTO;
import com.example.j2ee_backend.entity.Doctor;
import com.example.j2ee_backend.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DoctorService {

    private DoctorRepository doctorRepository;

    private PasswordEncoder passwordEncoder;

    private GoogleAuthService googleAuthService;

    private EmailService emailService;

    private GeocodeService geocodeService;

    private TokenService tokenService;

    @Autowired
    public DoctorService(DoctorRepository doctorRepository, PasswordEncoder passwordEncoder,GoogleAuthService googleAuthService, EmailService emailService, GeocodeService geocodeService, TokenService tokenService) {
        this.doctorRepository = doctorRepository;
        this.passwordEncoder = passwordEncoder;
        this.googleAuthService = googleAuthService;
        this.emailService = emailService;
        this.geocodeService = geocodeService;
        this.tokenService = tokenService;
    }

    public Doctor login(String email, String password) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(()-> new RuntimeException("Email không đúng. Vui lòng nhập lại!"));
        if(!passwordEncoder.matches(password, doctor.getPassword())) {
            throw new RuntimeException("Mật khẩu không đúng. Vui lòng nhập lại!");
        }
        return doctor;
    }

    public Doctor loginWithGoogle(String idToken) throws Exception {
        // Xác thực token và tìm bác sĩ trong DB (gọi service chuyên dụng)
        Doctor doctor = googleAuthService.verifyDoctorGoogleToken(idToken);

        // Trả về Bác sĩ đã xác thực
        return doctor;
    }

    public List<DoctorDTO> getAllDoctors(){
        return doctorRepository.findAll()
                .stream()
                .map(DoctorDTO::new)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<DoctorDTO> getRagDataDoctor() {
        return doctorRepository.findAll()
                .stream()
                .map(d -> DoctorDTO.builder()
                        .id(d.getId())
                        .fullName(d.getFullName())
                        .specialtyName(d.getSpecialty() != null ? d.getSpecialty().getSpecialtyName() : null)
                        .phoneNumber(d.getPhoneNumber())
                        .bio(d.getBio())
                        .address(d.getAddress())
                        .build() // <- build the DTO here
                )
                .collect(Collectors.toList());
    }
    public List<DoctorDTO> getDoctorsBySpecialtyId(Integer specialtyId) {
        return doctorRepository.findBySpecialty_Id(specialtyId)
                .stream()
                .map(DoctorDTO::new)
                .toList();
    }

    public DoctorDTO updateProfile(DoctorDTO doctorDTO){
        Doctor doctor = doctorRepository.findById(doctorDTO.getId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy thông tin bác sĩ!"));

        doctor.setPhoneNumber(doctorDTO.getPhoneNumber());
        doctor.setExperienceYears(doctorDTO.getExperienceYears());
        doctorRepository.save(doctor);

        //đọc trả lại dto
        DoctorDTO updateDTO = new DoctorDTO();
        updateDTO.setId(doctor.getId());
        updateDTO.setPhoneNumber(doctor.getPhoneNumber());
        updateDTO.setExperienceYears(doctor.getExperienceYears());
        updateDTO.setFullName(doctor.getFullName());
        updateDTO.setSpecialtyName(doctor.getSpecialty().getSpecialtyName());
        updateDTO.setEmail(doctor.getEmail());
        updateDTO.setBio(doctor.getBio());
        updateDTO.setImageUrl(doctor.getImageUrl());
        updateDTO.setAddress(doctor.getAddress());
        updateDTO.setPricePerAppointment(doctor.getPricePerAppointment());

        return updateDTO;
    }

    public void changePassword(Integer doctorId, PasswordChangeRequestDTO request) {
        Doctor doctor = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy bác sĩ"));

        // Kiểm tra mật khẩu cũ
        if (!passwordEncoder.matches(request.getOldPassword(), doctor.getPassword())) {
            throw new RuntimeException("Mật khẩu cũ không đúng");
        }

        // Kiểm tra mật khẩu mới >= 6 ký tự
        if (request.getNewPassword().length() < 6) {
            throw new RuntimeException("Mật khẩu mới phải >= 6 ký tự");
        }

        // Kiểm tra mật khẩu mới khác mật khẩu cũ
        if (passwordEncoder.matches(request.getNewPassword(), doctor.getPassword())) {
            throw new RuntimeException("Mật khẩu mới không được trùng mật khẩu cũ");
        }

        // Lưu mật khẩu mới
        doctor.setPassword(passwordEncoder.encode(request.getNewPassword()));
        doctorRepository.save(doctor);
    }

    public Doctor findById(Integer id) {
        return doctorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Doctor not found: " + id));
    }

    public void forgotPassword(String email) {
        Doctor doctor = doctorRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        String token = tokenService.createToken(email);
        emailService.sendResetPasswordEmail(email, doctor.getFullName(), "bác sĩ", token);
    }

    public void resetPassword(String token, String newPassword) {
        TokenService.TokenInfo info = tokenService.validateToken(token);
        if (info == null) {
            throw new RuntimeException("Token không hợp lệ hoặc hết hạn");
        }

        Doctor doctor = doctorRepository.findByEmail(info.getEmail())
                .orElseThrow(() -> new RuntimeException("Email không tồn tại"));

        doctor.setPassword(passwordEncoder.encode(newPassword));
        doctorRepository.save(doctor);

        tokenService.removeToken(token);
    }
}
