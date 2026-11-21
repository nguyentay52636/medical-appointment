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

    @Value("${vnpay.tmnCode:2QXUI4J4}")
    private String tmnCode;

    @Value("${vnpay.hashSecret:RA3KTPFC5H0WXM0WGSFDZCL3M1FDQQXF}")
    private String hashSecret;

    @Value("${vnpay.payUrl:https://sandbox.vnpayment.vn/paymentv2/vpcpay.html}")
    private String payUrl;

    @Value("${vnpay.returnUrl:http://localhost:5173/patient/payment_result}")
    private String returnUrl;

    public String getTmnCode() {
        return tmnCode;
    }

    public String getPayUrl() {
        return payUrl;
    }

    public String getReturnUrl() {
        return returnUrl;
    }

    public String createPaymentUrl(Appointment appointment, Integer amount) {
        try {
            // --- TreeMap tự sắp xếp key theo thứ tự Alphabet (ASCII byte order) ---
            Map<String, String> vnpParams = new TreeMap<>();

            String orderInfo = "Thanh toan phi kham ca " + appointment.getAppointmentCode();
            String txnRef = appointment.getAppointmentCode();

            Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
            SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
            String vnpCreateDate = formatter.format(cld.getTime());
            cld.add(Calendar.MINUTE, 15);
            String vnpExpireDate = formatter.format(cld.getTime());

            vnpParams.put("vnp_Version", "2.1.0");
            vnpParams.put("vnp_Command", "pay");
            vnpParams.put("vnp_TmnCode", tmnCode);
            vnpParams.put("vnp_Amount", String.valueOf((long) amount * 100)); // VNPAY tính theo đơn vị Xu (nhân 100)
            vnpParams.put("vnp_CurrCode", "VND");
            vnpParams.put("vnp_TxnRef", txnRef);
            vnpParams.put("vnp_OrderInfo", orderInfo);
            vnpParams.put("vnp_OrderType", "other");
            vnpParams.put("vnp_ReturnUrl", returnUrl);
            vnpParams.put("vnp_IpAddr", "127.0.0.1");
            vnpParams.put("vnp_CreateDate", vnpCreateDate);
            vnpParams.put("vnp_ExpireDate", vnpExpireDate);
            vnpParams.put("vnp_Locale", "vn");

            // --- Build hashData và query string theo chuẩn VNPAY 2.1.0 ---
            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();
            Iterator<Map.Entry<String, String>> itr = vnpParams.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                String fieldName = entry.getKey();
                String fieldValue = entry.getValue();
                if (fieldValue != null && !fieldValue.isEmpty()) {
                    // Build hash data
                    hashData.append(fieldName);
                    hashData.append('=');
                    hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    // Build query
                    query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII.toString()));
                    query.append('=');
                    query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII.toString()));

                    if (itr.hasNext()) {
                        query.append('&');
                        hashData.append('&');
                    }
                }
            }

            // --- Tạo chữ ký HMAC SHA512 ---
            String vnpSecureHash = hmacSHA512(hashSecret, hashData.toString());

            // Thêm chữ ký vào query
            query.append("&vnp_SecureHash=").append(vnpSecureHash);

            return payUrl + "?" + query.toString();

        } catch (Exception e) {
            throw new RuntimeException("Tạo URL thanh toán VNPay thất bại: " + e.getMessage(), e);
        }
    }

    /**
     * Xác thực chữ ký phản hồi từ VNPAY (cho Return URL hoặc IPN)
     */
    public boolean validateSignature(Map<String, String> fields, String vnpSecureHash) {
        if (vnpSecureHash == null || vnpSecureHash.trim().isEmpty()) {
            return false;
        }

        try {
            Map<String, String> cleanFields = new TreeMap<>();
            for (Map.Entry<String, String> entry : fields.entrySet()) {
                String key = entry.getKey();
                String val = entry.getValue();
                if (!"vnp_SecureHash".equals(key) && !"vnp_SecureHashType".equals(key)) {
                    if (val != null && !val.trim().isEmpty()) {
                        cleanFields.put(key, val);
                    }
                }
            }

            StringBuilder hashData = new StringBuilder();
            Iterator<Map.Entry<String, String>> itr = cleanFields.entrySet().iterator();
            while (itr.hasNext()) {
                Map.Entry<String, String> entry = itr.next();
                hashData.append(entry.getKey()).append("=").append(URLEncoder.encode(entry.getValue(), StandardCharsets.US_ASCII.toString()));
                if (itr.hasNext()) {
                    hashData.append("&");
                }
            }

            String sign = hmacSHA512(hashSecret, hashData.toString());
            return sign.equalsIgnoreCase(vnpSecureHash);
        } catch (Exception ex) {
            System.err.println("Lỗi validate chữ ký VNPAY: " + ex.getMessage());
            return false;
        }
    }

    public String hmacSHA512(String key, String data) throws Exception {
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
        System.out.println("Refund request: txnRef=" + txnRef + ", amount=" + amount);
        return true;
    }
}
