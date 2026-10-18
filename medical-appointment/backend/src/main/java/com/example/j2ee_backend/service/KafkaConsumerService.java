package com.example.j2ee_backend.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class KafkaConsumerService {

    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    public KafkaConsumerService(EmailService emailService) {
        this.emailService = emailService;
        this.objectMapper = new ObjectMapper();
    }

    @KafkaListener(topics = "appointments", groupId = "appointment-group")
    public void listen(String message) {
        try {
            // Chuyển JSON về Map
            Map<String, String> data = objectMapper.readValue(message, new TypeReference<Map<String, String>>() {});

            String patientName = data.get("patientName");
            String doctorName = data.get("doctorName");
            String patientEmail = data.get("patientEmail");
            String doctorEmail = data.get("doctorEmail");
            String appointmentCode = data.get("appointmentCode");
            String slotDate = data.get("slotDate");
            String slotStartTime = data.get("slotStartTime");
            String slotEndTime = data.get("slotEndTime");

            emailService.sendAppointmentNotification(
                    patientName, patientEmail, doctorName, doctorEmail,
                    appointmentCode, slotDate, slotStartTime, slotEndTime
            );

            System.out.println("Processed Kafka message for appointment: " + appointmentCode);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
