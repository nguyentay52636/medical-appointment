package com.example.j2ee_backend.config;


import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(auth -> auth
                        // Cho phép request 'thăm dò' (OPTIONS)
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Các API công khai
                        .requestMatchers("/api/doctor/login").permitAll()
                        .requestMatchers("/api/doctor/all").permitAll()
                        .requestMatchers("/api/doctor/specialty/**").permitAll()
                        .requestMatchers("/api/patient/login").permitAll()
                        .requestMatchers("/api/patient/register").permitAll()
                        .requestMatchers("/api/specialty/**").permitAll()
                        .requestMatchers("/swagger-ui/index.html").permitAll()

                        // Mọi request khác (tạm thời, sau này nên đổi thành .authenticated())
                        .anyRequest().permitAll()
                )
                // BẢO SPRING SECURITY SỬ DỤNG BEAN CẤU HÌNH BÊN DƯỚI
                .cors(withDefaults()); //

        return http.build();
    }

    // THÊM BEAN NÀY ĐỂ ĐỊNH NGHĨA CẤU HÌNH CORS
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        // Cho phép origin của React (frontend)
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));

        // Cho phép các method
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));

        // Cho phép các header
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Cache-Control"));

        // Cho phép gửi cookie (nếu cần cho session)
        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // Áp dụng cho tất cả API
        return source;
    }
}