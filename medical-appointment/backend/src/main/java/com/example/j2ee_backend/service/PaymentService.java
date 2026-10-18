package com.example.j2ee_backend.service;

import com.example.j2ee_backend.entity.Appointment;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class PaymentService {

    @Value("${vnpay.tmnCode}")
    private String tmnCode;

    @Value("${vnpay.hashSecret}")
    private String hashSecret;

    @Value("${vnpay.payUrl}")
    private String payUrl;

    @Value("${vnpay.returnUrl}")
    private String returnUrl;

    public String createPaymentUrl(Appointment appointment, Integer amount) {
        try {
            // --- TreeMap tự sắp xếp key theo ASCII ---
            Map<String, String> vnpParams = new TreeMap<>();

            String orderInfo = "Thanh toan lich kham " + appointment.getAppointmentCode();
            String txnRef = appointment.getAppointmentCode();
            String createDate = new SimpleDateFormat("yyyyMMddHHmmss").format(new Date());

            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf(amount * 100)); // nhân 100
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "billpayment");
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_CreateDate", createDate);
            vnpParams.put("vnp_Locale", "vn");

            // --- Build hashData để tạo chữ ký ---
            StringBuilder hashData = new StringBuilder();
            Iterator<Map.Entry<String, String>> itr = vnpParams.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                // Encode giống NodeJS: encodeURIComponent + replace space thành +
                String valueEncoded = URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8.toString())
                        .replaceAll("\\+", "%20")
                        .replaceAll("%20", "+");
                hashData.append(entry.getKey()).append("=").append(valueEncoded);
                if (itr.hasNext()) hashData.append("&");
            }

            // --- Tạo chữ ký HMAC SHA512 ---
            String vnpSecureHash = hmacSHA512(hashSecret, hashData.toString());

            // --- Build query string redirect (encode chuẩn) ---
            StringBuilder query = new StringBuilder();
            itr = vnpParams.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                query.append(URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8))
                        .append("=")
                        .append(URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8));
                if (itr.hasNext()) query.append("&");
            }

            // Thêm chữ ký vào query
            query.append("&vnp_SecureHash=").append(vnpSecureHash);

            // Debug: in ra hashData và chữ ký
            System.out.println("hashData: " + hashData);
            System.out.println("vnpSecureHash: " + vnpSecureHash);

            return payUrl + "?" + query.toString();

        } catch (Exception e) {
            throw new RuntimeException("Tạo URL thanh toán VNPay thất bại", e);
        }
    }

    private String hmacSHA512(String key, String data) throws Exception {
        Mac hmac = Mac.getInstance("HmacSHA512");
        SecretKeySpec secretKey = new SecretKeySpec(key.getBytes(StandardCharsets.UTF_8), "HmacSHA512");
        hmac.init(secretKey);
        byte[] bytes = hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));
        StringBuilder hash = new StringBuilder();
        for (byte b : bytes) {
            hash.append(String.format("%02x", b));
        }
        return hash.toString();
    }

    // Giả lập hoàn tiền
    public boolean refundPayment(String txnRef, int amount) {
        // TODO: Gọi API refund VNPay thật sau này
        System.out.println("Refund request: txnRef=" + txnRef + ", amount=" + amount);
        return true; // giả lập hoàn tiền thành công
    }
}
