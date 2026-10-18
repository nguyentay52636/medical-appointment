package com.example.j2ee_backend.service;

import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.Doctor;
import net.sf.jasperreports.engine.*;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.text.SimpleDateFormat;
import java.util.HashMap;
import java.util.Map;

@Service
public class ReportService {

    public byte[] generateAppointmentReport(Appointment appointment, Doctor doctor) throws Exception {

        // Load file .jrxml
        InputStream reportStream = getClass().getResourceAsStream("/reports/appointment_detail.jrxml");
        if (reportStream == null) {
            throw new RuntimeException("Report file not found in classpath!");
        }

        // Compile Jasper
        JasperReport jasperReport = JasperCompileManager.compileReport(reportStream);

        // Truyền tham số vào report
        Map<String, Object> params = new HashMap<>();
        params.put("appointmentCode", appointment.getAppointmentCode());
        params.put("patientName", appointment.getPatient().getFullName());
        params.put("doctorName", appointment.getBookableSlot().getDoctor().getFullName());
        params.put("specialty", appointment.getBookableSlot().getDoctor().getSpecialty() != null ? appointment.getBookableSlot().getDoctor().getSpecialty().getSpecialtyName() : "Không có");
        String dateStr = new SimpleDateFormat("dd/MM/yyyy").format(appointment.getBookableSlot().getSlotDate());
        params.put("date", dateStr);
        String startTimeStr = appointment.getBookableSlot().getStartTime() != null
                ? appointment.getBookableSlot().getStartTime().toString().substring(0,5)
                : "";

        String endTimeStr = appointment.getBookableSlot().getEndTime() != null
                ? appointment.getBookableSlot().getEndTime().toString().substring(0,5)
                : "";

        params.put("time", startTimeStr);
        params.put("endTime", endTimeStr);
        String reason = appointment.getReasonForVisit();
        params.put("reason", (reason != null && !reason.isEmpty()) ? reason : "Không có");
        String note = appointment.getNote();
        params.put("note", (note != null && !note.isEmpty()) ? note : "Không có");
        params.put("price", String.format("%,.0f VND", (double) appointment.getPrice()));
        params.put("paymentMethod", appointment.getPaymentMethod().equals("offline") ? "Khi đến khám" : "Trực tuyến");
        params.put("paymentStatus", appointment.getPaymentStatus().equals("pending") ? "Chưa thanh toán" :
                appointment.getPaymentStatus().equals("paid") ? "Đã thanh toán" :
                        appointment.getPaymentStatus().equals("failed") ? "Thanh toán thất bại" : "Đã hoàn tiền");
        params.put("status",
                appointment.getStatus().equals("pending") ? "Chờ xác nhận" :
                        appointment.getStatus().equals("confirmed") ? "Đã xác nhận" :
                                appointment.getStatus().equals("completed") ? "Đã khám" :
                                        "Đã hủy"
        );
        params.put("patientLabel", "Bệnh nhân");
        params.put("doctorLabel", "Bác sĩ");
        params.put("patientSignLabel", "(Ký và ghi rõ họ tên)");
        params.put("doctorSignLabel", "(Ký và ghi rõ họ tên)");

        // Fill report không có datasource (dùng param)
        JasperPrint jp = JasperFillManager.fillReport(jasperReport, params, new JREmptyDataSource());

        // Xuất PDF dạng byte[]
        return JasperExportManager.exportReportToPdf(jp);
    }
}
