package com.example.j2ee_backend.service;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail; // Email hệ thống

    //Gửi mail hủy lịch hẹn (từ các bước trước)
    @Async
    public void sendCancellationEmail(
            String patientName,
            String patientEmail,
            String appCode,
            String slotTime,
            String slotDate,
            String doctorEmail,
            boolean isPaidOnlineAndRefunded
    ) {

        if (patientEmail == null || patientEmail.isEmpty()) {
            System.err.println("Email bệnh nhân không hợp lệ, không gửi được email hủy lịch.");
            return;
        }

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(patientEmail);

            if (doctorEmail != null && !doctorEmail.isEmpty()) {
                message.setReplyTo(doctorEmail);
            }

            message.setSubject("Thông báo Hủy Lịch Hẹn #" + appCode);

            String refundText = isPaidOnlineAndRefunded
                    ? "Số tiền thanh toán online của bạn đã được hoàn trả vào tài khoản thanh toán ban đầu.\n"
                    : "";

            String text = String.format(
                    "Xin chào %s,\n\n" +
                            "Lịch hẹn của bạn với mã %s vào lúc %s, ngày %s đã bị hủy.\n" +
                            "Bởi vì bác sĩ có lịch cấp cứu đột xuất.\n\n" +
                            "%s" +
                            "Bạn có thể xem trạng thái chi tiết lịch khám trong mục Lịch sử đặt lịch.\n\n" +
                            "Cảm ơn bạn,\n" +
                            "Phòng khám Klinik",
                    patientName, appCode, slotTime, slotDate, refundText
            );

            message.setText(text);
            mailSender.send(message);
            System.out.println("Đã gửi email hủy lịch thành công tới " + patientEmail);

        } catch (MailException e) {
            System.err.println("Lỗi khi gửi email hủy lịch: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("Lỗi không xác định khi gửi email hủy lịch: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Gửi thông báo qua email
    @Async
    public void sendAppointmentNotification(
            String patientName,
            String patientEmail,
            String doctorName,
            String doctorEmail,
            String appointmentCode,
            String slotDate,
            String slotStartTime,
            String slotEndTime
    ) {
        try {
            // Email cho bệnh nhân
            String subjectPatient = "Thông báo lịch khám: " + appointmentCode;
            String contentPatient = "<p>Xin chào <b>" + patientName + "</b>,</p>"
                    + "<p>Bạn đã đặt lịch khám thành công.</p>"
                    + "<p><b>Mã lịch hẹn:</b> " + appointmentCode + "<br>"
                    + "<b>Ngày khám:</b> " + slotDate + "<br>"
                    + "<b>Thời gian:</b> " + slotStartTime + " - " + slotEndTime + "</p>"
                    + "<p>Vui lòng đến đúng giờ để được phục vụ tốt nhất.</p>";
            sendEmail(patientEmail, subjectPatient, contentPatient);

            // Email cho bác sĩ
            String subjectDoctor = "Bạn có lịch khám mới: " + appointmentCode;
            String contentDoctor = "<p>Xin chào <b>" + doctorName + "</b>,</p>"
                    + "<p>Bạn có một lịch khám mới.</p>"
                    + "<p><b>Bệnh nhân:</b> " + patientName + "<br>"
                    + "<b>Mã lịch hẹn:</b> " + appointmentCode + "<br>"
                    + "<b>Ngày khám:</b> " + slotDate + "<br>"
                    + "<b>Thời gian:</b> " + slotStartTime + " - " + slotEndTime + "</p>"
                    + "<p>Vui lòng chuẩn bị sẵn sàng cho lịch khám.</p>";
            sendEmail(doctorEmail, subjectDoctor, contentDoctor);

        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private void sendEmail(String to, String subject, String htmlContent) throws MessagingException {
        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, "UTF-8");
        helper.setTo(to);
        helper.setSubject(subject);
        helper.setText(htmlContent, true); // true = HTML
        mailSender.send(message);
        System.out.println("Sent email to " + to);
    }

    // Gửi email khi lịch hẹn bị hủy hoặc bị bỏ lỡ do quá hạn
    @Async
    public void sendExpiredOrMissedAppointmentEmail(
            String patientName,
            String patientEmail,
            String appointmentCode,
            String slotDate,
            String slotStartTime,
            String slotEndTime,
            String status, // "missed" hoặc "cancelled"
            boolean isPaidOnlineAndRefunded
    ) {

        if (patientEmail == null || patientEmail.isEmpty()) {
            System.err.println("Email bệnh nhân không hợp lệ, không thể gửi email quá hạn.");
            return;
        }

        try {
            String subject = "";
            String reasonText = "";

            // Xác định tiêu đề và lý do
            if ("missed".equalsIgnoreCase(status)) {
                subject = "Thông báo Lịch Hẹn Bị Bỏ Lỡ #" + appointmentCode;
                reasonText = "Lịch hẹn của bạn đã bị <b>bỏ lỡ</b> do đã qua giờ bắt đầu khám nhưng bạn chưa đến khám. Bạn vui lòng sắp xếp đến khám theo thời gian đã đặt. Qua thời gian đã đặt mà chưa đến, lịch hẹn sẽ tự động hủy.<br>";
            } else {
                subject = "Thông báo Lịch Hẹn Bị Hủy #" + appointmentCode;
                reasonText = "Lịch hẹn của bạn đã bị <b>hủy</b> do đã qua thời gian khám.<br>";
            }

            // Nếu thanh toán online → thêm thông báo hoàn tiền
            String refundText = isPaidOnlineAndRefunded
                    ? "<p><b>Số tiền thanh toán online đã được hoàn trả</b> vào tài khoản thanh toán ban đầu.</p>"
                    : "";

            String content = "<p>Xin chào <b>" + patientName + "</b>,</p>"
                    + "<p>" + reasonText + "</p>"
                    + "<p><b>Mã lịch hẹn:</b> " + appointmentCode + "<br>"
                    + "<b>Ngày khám:</b> " + slotDate + "<br>"
                    + "<b>Giờ khám:</b> " + slotStartTime + " đến " + slotEndTime + "</p>"
                    + refundText
                    + "<p>Bạn có thể kiểm tra lại trong mục <b>Lịch sử đặt lịch</b>.</p>"
                    + "<p>Trân trọng,<br>Phòng khám Klinik</p>";

            sendEmail(patientEmail, subject, content);
            System.out.println("Đã gửi email quá hạn/bỏ lỡ tới " + patientEmail);

        } catch (Exception e) {
            System.err.println("Lỗi khi gửi email quá hạn/bỏ lỡ: " + e.getMessage());
            e.printStackTrace();
        }
    }

    // Quên mật khẩu
    @Async
    public void sendResetPasswordEmail(String email, String name, String role, String token) {
        try {
            // Link dẫn tới trang reset password frontend
            String resetFormLink = role.equals("bác sĩ")
                    ? "http://localhost:5173/doctor/reset_password"
                    : "http://localhost:5173/patient/reset_password";

            String subject = "Đặt lại mật khẩu cho tài khoản " + role;
            String content = "<p>Xin chào <b>" + name + "</b>,</p>"
                    + "<p>Bạn đã yêu cầu đặt lại mật khẩu.</p>"
                    + "<p>Token để đặt lại mật khẩu của bạn là:</p>"
                    + "<h2 style='color: blue;'>" + token + "</h2>"
                    + "<p>Hãy nhập token này vào form đặt lại mật khẩu tại link bên dưới:</p>"
                    + "<p><a href=\"" + resetFormLink + "\">Đặt lại mật khẩu</a></p>"
                    + "<p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>"
                    + "<p>Trân trọng,<br>Phòng khám Klinik</p>";

            sendEmail(email, subject, content);
            System.out.println("Đã gửi email reset mật khẩu tới " + email);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}