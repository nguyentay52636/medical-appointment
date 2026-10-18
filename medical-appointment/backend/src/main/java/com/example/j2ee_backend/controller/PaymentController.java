package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.AppointmentDTO;
import com.example.j2ee_backend.service.AppointmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/appointment")
public class PaymentController {

    @Autowired
    private AppointmentService appointmentService;

    @GetMapping("/payment/result")
    public ResponseEntity<?> handleVnPayReturn(
            @RequestParam("vnp_TxnRef") String vnpTxnRef,
            @RequestParam(value = "vnp_ResponseCode", required = false) String vnpResponseCode
    ) {
        try {
            AppointmentDTO appointment = appointmentService.getAppointmentByTxnRef(vnpTxnRef);
            if (appointment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Không tìm thấy lịch khám");
            }

            // Cập nhật trạng thái thanh toán
            if ("00".equals(vnpResponseCode)) {
                appointmentService.updatePaymentStatus(appointment.getId(), "paid");
            } else {
                appointmentService.updatePaymentStatus(appointment.getId(), "failed");
            }

            // Lấy lại appointment sau khi update
            AppointmentDTO updated = appointmentService.getAppointmentByTxnRef(vnpTxnRef);
            return ResponseEntity.ok(updated);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Lỗi xử lý thanh toán: " + e.getMessage());
        }
    }
}


