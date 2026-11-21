package com.example.j2ee_backend.controller;

import com.example.j2ee_backend.dto.AppointmentDTO;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.service.AppointmentService;
import com.example.j2ee_backend.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/appointment")
@CrossOrigin(origins = "http://localhost:5173", allowCredentials = "true")
public class PaymentController {

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private PaymentService paymentService;

    /**
     * Xử lý khi bệnh nhân được redirect về từ VNPAY (Return URL)
     */
    @GetMapping("/payment/result")
    public ResponseEntity<?> handleVnPayReturn(
            @RequestParam Map<String, String> allParams,
            @RequestParam("vnp_TxnRef") String vnpTxnRef,
            @RequestParam(value = "vnp_ResponseCode", required = false) String vnpResponseCode,
            @RequestParam(value = "vnp_SecureHash", required = false) String vnpSecureHash
    ) {
        try {
            // Xác thực chữ ký nếu có tham số SecureHash
            if (vnpSecureHash != null && !vnpSecureHash.trim().isEmpty()) {
                boolean isValid = paymentService.validateSignature(allParams, vnpSecureHash);
                if (!isValid) {
                    System.err.println("Chữ ký VNPAY Return URL không hợp lệ cho đơn: " + vnpTxnRef);
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                            .body(Map.of("error", "Chữ ký giao dịch không hợp lệ (Invalid Signature)"));
                }
            }

            AppointmentDTO appointment = appointmentService.getAppointmentByTxnRef(vnpTxnRef);
            if (appointment == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Không tìm thấy lịch khám"));
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
                    .body(Map.of("error", "Lỗi xử lý thanh toán: " + e.getMessage()));
        }
    }

    /**
     * Endpoint IPN (Instant Payment Notification) - VNPAY gọi server-to-server
     */
    @GetMapping("/payment/vnpay-ipn")
    public ResponseEntity<Map<String, String>> handleVnPayIpn(@RequestParam Map<String, String> allParams) {
        Map<String, String> response = new HashMap<>();
        String vnpSecureHash = allParams.get("vnp_SecureHash");

        // 1. Kiểm tra chữ ký
        boolean isValid = paymentService.validateSignature(allParams, vnpSecureHash);
        if (!isValid) {
            response.put("RspCode", "97");
            response.put("Message", "Invalid Checksum");
            return ResponseEntity.ok(response);
        }

        String vnpTxnRef = allParams.get("vnp_TxnRef");
        String vnpResponseCode = allParams.get("vnp_ResponseCode");

        try {
            AppointmentDTO appointment = appointmentService.getAppointmentByTxnRef(vnpTxnRef);
            if (appointment == null) {
                response.put("RspCode", "01");
                response.put("Message", "Order not found");
                return ResponseEntity.ok(response);
            }

            // 2. Kiểm tra nếu đơn hàng đã được cập nhật trước đó
            if ("paid".equalsIgnoreCase(appointment.getPaymentStatus())) {
                response.put("RspCode", "02");
                response.put("Message", "Order already confirmed");
                return ResponseEntity.ok(response);
            }

            // 3. Cập nhật trạng thái
            if ("00".equals(vnpResponseCode)) {
                appointmentService.updatePaymentStatus(appointment.getId(), "paid");
            } else {
                appointmentService.updatePaymentStatus(appointment.getId(), "failed");
            }

            response.put("RspCode", "00");
            response.put("Message", "Confirm Success");
            return ResponseEntity.ok(response);

        } catch (Exception ex) {
            response.put("RspCode", "99");
            response.put("Message", "Unknow error: " + ex.getMessage());
            return ResponseEntity.ok(response);
        }
    }

    /**
     * Endpoint Polling: Kiểm tra trạng thái thanh toán theo thời gian thực cho frontend
     */
    @GetMapping("/payment/status/{id}")
    public ResponseEntity<?> getPaymentStatus(@PathVariable("id") Integer id) {
        Appointment appt = appointmentRepository.findById(id).orElse(null);
        if (appt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Lịch khám không tồn tại"));
        }

        Map<String, Object> res = new HashMap<>();
        res.put("id", appt.getId());
        res.put("appointmentCode", appt.getAppointmentCode());
        res.put("paymentStatus", appt.getPaymentStatus() != null ? appt.getPaymentStatus() : "pending");
        res.put("status", appt.getStatus() != null ? appt.getStatus() : "pending");
        res.put("price", appt.getPrice() != null ? appt.getPrice() : 0);
        res.put("paymentMethod", appt.getPaymentMethod() != null ? appt.getPaymentMethod() : "offline");
        res.put("isPaid", "paid".equalsIgnoreCase(appt.getPaymentStatus()));

        return ResponseEntity.ok(res);
    }

    /**
     * Endpoint thanh toán trực tiếp ngay trên trình duyệt (Direct Payment)
     * Xác nhận thanh toán thành công, đặt slot thành booked và xác nhận lịch hẹn luôn
     */
    @PostMapping("/payment/pay-direct/{id}")
    public ResponseEntity<?> payDirect(@PathVariable("id") Integer id) {
        try {
            AppointmentDTO updated = appointmentService.payDirect(id);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Thanh toán trực tiếp thành công!",
                    "appointmentCode", updated.getAppointmentCode(),
                    "appointment", updated
            ));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi xử lý thanh toán trực tiếp: " + e.getMessage()));
        }
    }

    /**
     * Endpoint tạo mới / làm mới Payment URL VNPAY cho ca khám
     */
    @PostMapping("/payment/create-url/{id}")
    public ResponseEntity<?> recreatePaymentUrl(@PathVariable("id") Integer id) {
        Appointment appt = appointmentRepository.findById(id).orElse(null);
        if (appt == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Lịch khám không tồn tại"));
        }

        try {
            int amount = appt.getPrice() != null && appt.getPrice() > 0 ? appt.getPrice() : 200000;
            String paymentUrl = paymentService.createPaymentUrl(appt, amount);

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "appointmentId", appt.getId(),
                    "appointmentCode", appt.getAppointmentCode(),
                    "paymentUrl", paymentUrl,
                    "amount", amount
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("error", "Lỗi tạo URL thanh toán: " + e.getMessage()));
        }
    }
}


