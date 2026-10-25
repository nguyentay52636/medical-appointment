package com.example.j2ee_backend.service;

import com.example.j2ee_backend.dto.*;
import com.example.j2ee_backend.entity.Appointment;
import com.example.j2ee_backend.entity.BookableSlot;
import com.example.j2ee_backend.entity.Notification;
import com.example.j2ee_backend.entity.Patient;
import com.example.j2ee_backend.repository.AppointmentRepository;
import com.example.j2ee_backend.repository.BookableSlotRepository;
import com.example.j2ee_backend.repository.PatientRepository;
import com.example.j2ee_backend.repository.NotificationRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.sql.Date;
import java.sql.Time;
import java.text.SimpleDateFormat;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class AppointmentService {

    @Autowired
    private AppointmentRepository appointmentRepository;

    @Autowired
    private BookableSlotRepository slotRepo;

    @Autowired
    private PatientRepository patientRepo;

    @Autowired
    private NotificationRepository notificationRepo;

    @Autowired
    private PaymentService paymentService;

    // Lấy danh sách lịch theo bác sĩ
    @Autowired
    private EmailService emailService;

    @Autowired
    private KafkaProducerService kafkaProducer;

    public List<AppointmentDTO> getAppointmentsByDoctorId(int id) {
        return appointmentRepository.findByDoctorId(id)
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    public List<AppointmentDTO> getAllAppointments() {
        return appointmentRepository.findAll()
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public void adminUpdateAppointmentStatus(Integer appointmentId, String newStatus) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn với ID: " + appointmentId));

        appointment.setStatus(newStatus.toLowerCase());
        appointment.setUpdateAt(Timestamp.valueOf(LocalDateTime.now()));

        if ("completed".equalsIgnoreCase(newStatus)) {
            appointment.setPaymentStatus("paid");
        } else if ("rejected".equalsIgnoreCase(newStatus) || "cancelled".equalsIgnoreCase(newStatus)) {
            if (appointment.getBookableSlot() != null) {
                appointment.getBookableSlot().setStatus("available");
                slotRepo.save(appointment.getBookableSlot());
            }
        }

        appointmentRepository.save(appointment);
    }

    // Lấy chi tiết lịch
    public AppointmentDTO getAppointmentDetail(Integer doctorId, Integer appointmentId) {
        Optional<Appointment> optional = appointmentRepository.findByIdAndDoctor(appointmentId, doctorId);
        return optional.map(AppointmentDTO::new).orElse(null);
    }

    // Lấy danh sách lịch theo bệnh nhân
    public List<AppointmentDTO> getAppointmentsByPatientId(int id) {
        return appointmentRepository.findByPatientId(id)
                .stream()
                .map(AppointmentDTO::new)
                .collect(Collectors.toList());
    }

    @Transactional
    public Appointment rescheduleAppointment(Integer appointmentId, LocalDate newDate, LocalTime newTime) throws Exception {
        Appointment appt = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new Exception("Không tìm thấy lịch hẹn"));

        BookableSlot oldSlot = appt.getBookableSlot();

        // Kiểm tra slot mới
        Optional<BookableSlot> optionalNewSlot = slotRepo
                .findByDoctorAndSlotDateAndStartTime(oldSlot.getDoctor(), newDate, newTime)
                .stream()
                .filter(slot -> slot.getStatus().equals("available"))
                .findFirst();

        BookableSlot newSlot;
        if (optionalNewSlot.isPresent()) {
            newSlot = optionalNewSlot.get();
            newSlot.setStatus("booked");
        } else {
            newSlot = new BookableSlot();
            newSlot.setDoctor(oldSlot.getDoctor());
            newSlot.setSlotDate(Date.valueOf(newDate));
            newSlot.setStartTime(Time.valueOf(newTime));
            newSlot.setEndTime(Time.valueOf(newTime.plusMinutes(oldSlot.getDoctorAvailability().getSlotDurationMinutes())));
            newSlot.setStatus("booked");
        }

        appt.setUpdateAt(Timestamp.valueOf(LocalDateTime.now()));
        appt.setBookableSlot(newSlot);

        slotRepo.save(newSlot);

        // Đổi slot cũ thành available
        oldSlot.setStatus("available");
        slotRepo.save(oldSlot);

        Appointment saved = appointmentRepository.save(appt);

        // --- Tạo Notification cho bác sĩ ---
        if (saved.getPatient() != null && saved.getBookableSlot() != null) {
            SimpleDateFormat dateFormatter = new SimpleDateFormat("dd/MM");
            String message = "Bệnh nhân " + saved.getPatient().getFullName()
                    + " đã dời lịch khám từ ngày " + dateFormatter.format(oldSlot.getSlotDate())
                    + " sang ngày " + dateFormatter.format(saved.getBookableSlot().getSlotDate())
                    + " vào lúc " + saved.getBookableSlot().getStartTime() + " đến " + saved.getBookableSlot().getEndTime();

            Notification notification = new Notification();
            notification.setDoctor(saved.getBookableSlot().getDoctor());
            notification.setPatient(saved.getPatient());
            notification.setTitle("Lịch hẹn đã được dời");
            notification.setMessage(message);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            notificationRepo.save(notification);
        }

        return saved;
    }

    // Tạo lịch hẹn
    @Transactional
    public Map<String, String> createAppointment(AppointmentDTO dto) {
        // Lấy slot
        BookableSlot slot = slotRepo.findById(dto.getBookableSlotId())
                .orElseThrow(() -> new RuntimeException("Slot không tồn tại"));

        if (!"available".equalsIgnoreCase(slot.getStatus())) {
            throw new RuntimeException("Slot đã được đặt");
        }

        // Lấy bệnh nhân
        Patient patient = patientRepo.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient không tồn tại"));

        // Tạo mã appointment
        String lastCode = appointmentRepository.findTopByOrderByIdDesc()
                .map(Appointment::getAppointmentCode)
                .orElse("APT000");
        int number = Integer.parseInt(lastCode.substring(3)) + 1;
        String newCode = String.format("APT%03d", number);
        Integer price = slot.getDoctor().getPricePerAppointment();

        // Tạo appointment
        Appointment app = new Appointment();
        app.setPatient(patient);
        app.setBookableSlot(slot);
        app.setReasonForVisit(dto.getReason());
        app.setNote(dto.getNote());
        app.setAppointmentCode(newCode);
        app.setPrice(price);
        app.setStatus("pending");
        app.setPaymentMethod(dto.getPaymentMethod());

        if ("online".equalsIgnoreCase(dto.getPaymentMethod())) {
            app.setPaymentStatus("pending");
            app.setVnpTxnRef(newCode);
        } else {
            app.setPaymentStatus("pending"); // offline
            slot.setStatus("booked");
            slotRepo.save(slot);
        }

        // Lưu appointment
        Appointment saved = appointmentRepository.save(app);

        if (saved.getPatient() != null && saved.getBookableSlot() != null) {
            Date date = slot.getSlotDate();
            SimpleDateFormat dateFormatter = new SimpleDateFormat("dd/MM"); // định dạng ngày
            String message = "Bệnh nhân " + patient.getFullName()
                    + " đã đặt lịch khám vào ngày " + dateFormatter.format(date)
                    + " lúc " + slot.getStartTime() + " đến " + slot.getEndTime();

            // --- Tạo notification cho bác sĩ ---
            Notification notification = new Notification();
            notification.setDoctor(slot.getDoctor());
            notification.setPatient(patient);
            notification.setTitle("Lịch hẹn mới");
            notification.setMessage(message);
            notification.setRead(false); // chưa đọc
            notification.setCreatedAt(LocalDateTime.now());

            notificationRepo.save(notification);
        }

        Map<String, String> result = new HashMap<>();
        result.put("appointmentCode", saved.getAppointmentCode());

        if ("online".equalsIgnoreCase(dto.getPaymentMethod())) {
            try {
                String paymentUrl = paymentService.createPaymentUrl(saved, saved.getPrice());
                result.put("paymentUrl", paymentUrl);
                // slot chưa booked, chờ thanh toán thành công
            } catch (Exception ex) {
                // tạo payment URL thất bại
                saved.setPaymentStatus("failed");
                appointmentRepository.save(saved);
                throw new RuntimeException("Không thể tạo thanh toán online");
            }
        }

        // Kafka
        Map<String, String> kafkaMsg = new HashMap<>();
        kafkaMsg.put("patientName", patient.getFullName());
        kafkaMsg.put("patientEmail", patient.getEmail());
        kafkaMsg.put("doctorName", slot.getDoctor().getFullName());
        kafkaMsg.put("doctorEmail", slot.getDoctor().getEmail());
        kafkaMsg.put("appointmentCode", saved.getAppointmentCode());
        kafkaMsg.put("slotDate", slot.getSlotDate().toString());
        kafkaMsg.put("slotStartTime", slot.getStartTime().toString());
        kafkaMsg.put("slotEndTime", slot.getEndTime().toString());

        kafkaProducer.sendMessage("appointments", kafkaMsg);

        return result;
    }

    public AppointmentDTO getAppointmentByTxnRef(String txnRef) {
        return appointmentRepository.findByVnpTxnRef(txnRef)
                .map(AppointmentDTO::new)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch khám với mã VNPay: " + txnRef));
    }

    // Cập nhật trạng thái thanh toán của lịch khám
    @Transactional
    public void updatePaymentStatus(Integer appointmentId, String status) {
        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment không tồn tại"));

        // Kiểm tra trạng thái hợp lệ
        if (!status.equalsIgnoreCase("pending") &&
                !status.equalsIgnoreCase("paid") &&
                !status.equalsIgnoreCase("failed") &&
                !status.equalsIgnoreCase("refunded")) {
            throw new IllegalArgumentException("Trạng thái thanh toán không hợp lệ");
        }

        // Nếu lịch hẹn đã bị hủy hoặc bỏ lỡ và thanh toán online -> tự động hoàn tiền
        if (("cancelled".equalsIgnoreCase(appointment.getStatus()) ||
                "missed".equalsIgnoreCase(appointment.getStatus())) &&
                "online".equalsIgnoreCase(appointment.getPaymentMethod())) {
            appointment.setPaymentStatus("refunded");
        } else {
            appointment.setPaymentStatus(status.toLowerCase());

            // Nếu thanh toán thành công (offline/online) và lịch hẹn hợp lệ -> đánh dấu slot booked
            if ("paid".equalsIgnoreCase(status)) {
                BookableSlot slot = appointment.getBookableSlot();
                if (slot != null && !"booked".equalsIgnoreCase(slot.getStatus())) {
                    slot.setStatus("booked");
                    slotRepo.save(slot);
                }
            }
        }

        appointmentRepository.save(appointment);
    }

    @Transactional
    public void updateExpiredAppointment(Integer appointmentId) {

        Appointment appointment = appointmentRepository.findById(appointmentId)
                .orElseThrow(() -> new RuntimeException("Appointment không tồn tại"));

        BookableSlot slot = appointment.getBookableSlot();
        if (slot == null) return;

        LocalDate slotDate = slot.getSlotDate().toLocalDate();
        LocalTime slotStartTime = slot.getStartTime().toLocalTime();
        LocalTime slotEndTime = slot.getEndTime().toLocalTime();
        LocalDate today = LocalDate.now();
        LocalTime nowTime = LocalTime.now();

        boolean canUpdate =
                "pending".equalsIgnoreCase(appointment.getStatus()) ||
                        "confirmed".equalsIgnoreCase(appointment.getStatus());

        boolean isPaidOnline =
                "online".equalsIgnoreCase(appointment.getPaymentMethod()) &&
                        "paid".equalsIgnoreCase(appointment.getPaymentStatus());

        String oldStatus = appointment.getStatus(); // để check xem có đổi trạng thái không

        // ----------- Xử lý quá hạn -----------

        if (canUpdate) {

            if (slotDate.isBefore(today)) {
                // Qua ngày → hủy luôn
                appointment.setStatus("cancelled");
                if (isPaidOnline) appointment.setPaymentStatus("refunded");
                else appointment.setPaymentStatus("failed");
            }
            else if (slotDate.isEqual(today)) {
                if (!slotEndTime.isAfter(nowTime)) {
                    // Giờ kết thúc đã qua → hủy
                    appointment.setStatus("cancelled");
                    if (isPaidOnline) appointment.setPaymentStatus("refunded");
                    else appointment.setPaymentStatus("failed");
                }
                else if (slotStartTime.isBefore(nowTime)) {
                    // Quá giờ bắt đầu nhưng chưa kết thúc → bỏ lỡ
                    appointment.setStatus("missed");
                    if (isPaidOnline) appointment.setPaymentStatus("refunded");
                    else appointment.setPaymentStatus("pending");
                }
            }
        }

        Appointment saved = appointmentRepository.save(appointment);

        // ----------- Gửi Email khi đổi trạng thái -----------

        if (!oldStatus.equalsIgnoreCase(saved.getStatus())) {
            emailService.sendExpiredOrMissedAppointmentEmail(
                    saved.getPatient().getFullName(),
                    saved.getPatient().getEmail(),
                    saved.getAppointmentCode(),
                    slot.getSlotDate().toString(),
                    slot.getStartTime().toString(),
                    slot.getEndTime().toString(),
                    saved.getStatus(),
                    isPaidOnline // nếu thanh toán online → email sẽ thêm câu hoàn tiền
            );
        }

        // ----------- Tạo Notification -----------

        if (saved.getPatient() != null && slot != null) {
            SimpleDateFormat dateFormatter = new SimpleDateFormat("dd/MM");
            String message = "Lịch hẹn của bệnh nhân " + saved.getPatient().getFullName()
                    + " ngày " + dateFormatter.format(slot.getSlotDate())
                    + " lúc " + slot.getStartTime() + " đến " + slot.getEndTime();

            if ("cancelled".equalsIgnoreCase(saved.getStatus())) {
                message += " đã bị hủy do quá ngày khám mà chưa đến khám.";
            } else if ("missed".equalsIgnoreCase(saved.getStatus())) {
                message += " đã bỏ lỡ do không đến đúng giờ.";
            }

            Notification notification = new Notification();
            notification.setDoctor(slot.getDoctor());
            notification.setPatient(saved.getPatient());
            notification.setTitle("Cập nhật lịch hẹn");
            notification.setMessage(message);
            notification.setRead(false);
            notification.setCreatedAt(LocalDateTime.now());

            notificationRepo.save(notification);
        }
    }

    @Transactional
    public void rejectAppointment(Integer appointmentId, Integer doctorId) {
        // 1. Tìm lịch hẹn
        Appointment appointment = appointmentRepository.findByIdAndDoctor(appointmentId, doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn phù hợp với bác sĩ này."));

        // 2. Hoàn tiền nếu thanh toán online
        if ("online".equalsIgnoreCase(appointment.getPaymentMethod()) &&
                "paid".equalsIgnoreCase(appointment.getPaymentStatus())) {
            boolean refunded = paymentService.refundPayment(
                    appointment.getVnpTxnRef(),
                    appointment.getPrice()
            );
            if (refunded) {
                appointment.setPaymentStatus("refunded");
            }
        }

        // 3. Trích xuất dữ liệu cho email
        String patientName = appointment.getPatient().getFullName();
        String patientEmail = appointment.getPatient().getEmail();
        String appCode = appointment.getAppointmentCode();
        String slotTime = appointment.getBookableSlot().getStartTime().toString();
        String slotDate = appointment.getBookableSlot().getSlotDate().toString();
        String doctorEmail = appointment.getBookableSlot().getDoctor().getEmail();

        // 4. Cập nhật trạng thái lịch hẹn và slot
        appointment.setStatus("cancelled");
        appointment.getBookableSlot().setStatus("available");

        // 5. Lưu vào DB
        appointmentRepository.save(appointment);
        slotRepo.save(appointment.getBookableSlot());

        // 6. Gửi mail
        boolean isPaidOnlineAndRefunded = "online".equalsIgnoreCase(appointment.getPaymentMethod()) &&
                "refunded".equalsIgnoreCase(appointment.getPaymentStatus());

        emailService.sendCancellationEmail(
                patientName,
                patientEmail,
                appCode,
                slotTime,
                slotDate,
                doctorEmail,
                isPaidOnlineAndRefunded
        );
    }

    @Transactional
    public void confirmAppointment(Integer appointmentId, Integer doctorId) {
        Appointment appointment = appointmentRepository.findByIdAndDoctor(appointmentId, doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn phù hợp với bác sĩ này."));

        // Cập nhật trạng thái
        appointment.setStatus("confirmed");
        appointment.setUpdateAt(Timestamp.valueOf(LocalDateTime.now()));
        // Lưu lại thay đổi
        appointmentRepository.save(appointment);
        slotRepo.save(appointment.getBookableSlot());

        BookableSlot slot = appointment.getBookableSlot();
        slot.setStatus("booked");
        slotRepo.save(slot);

    }

    @Transactional
    public void startAppointment(Integer appointmentId, Integer doctorId) {
        Appointment appointment = appointmentRepository.findByIdAndDoctor(appointmentId, doctorId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy lịch hẹn phù hợp với bác sĩ này."));

        BookableSlot slot = appointment.getBookableSlot();

        // Cập nhật slot trước
        slot.setStatus("booked");
        slotRepo.save(slot);

        // Cập nhật trạng thái lịch và thanh toán
        appointment.setStatus("completed");
        appointment.setPaymentStatus("paid");
        appointment.setUpdateAt(Timestamp.valueOf(LocalDateTime.now()));

        appointmentRepository.save(appointment);
    }

    public Appointment findById(Integer id) {
        return appointmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Appointment not found: " + id));
    }
    //--------------------------------------------------------------------------------
    // Ánh xạ giá trị ENUM DB sang tên hiển thị
    private static final Map<String, String> STATUS_MAPPING = Map.of(
            "completed", "Đã Khám",
            "confirmed", "Đã Xác Nhận",
            "cancelled", "Đã Hủy",
            "missed", "Vắng Mặt"
    );

     // Lấy thống kê trạng thái lịch hẹn theo tháng và năm của ngày khám (slotDate).
     public AppointmentStatisticResponse getAppointmentStatusStatistics(int month, int year, Integer doctorId) {

        //Lấy dữ liệu từ Repository
        List<AppointmentRepository.StatusCountProjection> statusCounts =
                appointmentRepository.countAppointmentsByStatusAndMonthYear(month, year,doctorId);

        //Tính tổng số lịch hẹn (4 trạng thái hiển thị)
        long totalAppointments = statusCounts.stream()
                // Lọc ra chỉ 4 trạng thái có trong STATUS_MAPPING
                .filter(projection -> STATUS_MAPPING.containsKey(projection.getStatus()))
                .mapToLong(AppointmentRepository.StatusCountProjection::getCount)
                .sum();

        if (totalAppointments == 0) {
            return new AppointmentStatisticResponse(0, Collections.emptyList());
        }

        //Tính toán (tính tỷ lệ phần trăm)
        List<StatisticItem> statisticItems = statusCounts.stream()
                .filter(projection -> STATUS_MAPPING.containsKey(projection.getStatus()))
                .map(projection -> {
                    String displayName = STATUS_MAPPING.get(projection.getStatus());
                    long count = projection.getCount();
                    double percentage = (double) count / totalAppointments * 100;
                    // Làm tròn tỷ lệ phần trăm đến 1 chữ số thập phân
                    percentage = Math.round(percentage * 10.0) / 10.0;
                    return new StatisticItem(displayName, count, percentage);
                }).collect(Collectors.toList());

        return new AppointmentStatisticResponse(totalAppointments, statisticItems);
    }
    //--------------------------------------------------------------------------------
    // Biểu đồ cột kết hợp
    private static final String[] MONTH_NAMES = {
            "", "Thg 1", "Thg 2", "Thg 3", "Thg 4", "Thg 5", "Thg 6",
            "Thg 7", "Thg 8", "Thg 9", "Thg 10", "Thg 11", "Thg 12"
    };

     // Lấy thống kê Doanh thu và Lượt khám cho tất cả 12 tháng trong năm.
    public List<MonthlyRevenuePatientDTO> getYearlyRevenuePatientStatistics(int year,Integer doctorId) {

        //Lấy dữ liệu thô từ DB (chỉ các tháng có dữ liệu)
        List<AppointmentRepository.MonthlyStatsProjection> rawData =
                appointmentRepository.getMonthlyRevenueAndAppointmentsByYear(year,doctorId);

        //Chuyển đổi List rawData thành Map để dễ dàng tra cứu theo tháng
        Map<Integer, AppointmentRepository.MonthlyStatsProjection> dataMap = rawData.stream()
                .collect(Collectors.toMap(
                        AppointmentRepository.MonthlyStatsProjection::getMonth,
                        proj -> proj
                ));

        List<MonthlyRevenuePatientDTO> result = new ArrayList<>();

        //Lặp qua 12 tháng để đảm bảo có đủ 12 điểm dữ liệu
        for (int month = 1; month <= 12; month++) {
            AppointmentRepository.MonthlyStatsProjection proj = dataMap.get(month);

            Long revenue = 0L;
            Long appointments = 0L;

            if (proj != null) {
                // Lấy dữ liệu nếu tháng đó có dữ liệu trong DB
                revenue = proj.getRevenue() != null ? proj.getRevenue() : 0L;
                appointments = proj.getTotalAppointments() != null ? proj.getTotalAppointments() : 0L;
            }
            result.add(new MonthlyRevenuePatientDTO(
                    month,
                    MONTH_NAMES[month],
                    revenue,
                    appointments
            ));
        }
        return result;
    }

    //-------------------------------------------------------------------------------
    //Bảng dữ liệu chi tiểt
    private final DateTimeFormatter DATETIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
     // Lấy danh sách lịch hẹn chi tiết và tính tổng doanh thu trong khoảng thời gian.
    public DetailedReportResponse getDetailedAppointmentReport(LocalDate startDate, LocalDate endDate,Integer doctorId) {

        //Tính tổng Doanh thu
        Long totalRevenue = appointmentRepository.calculateTotalRevenueByDateRange(startDate, endDate, doctorId);

        //Lấy danh sách lịch hẹn chi tiết (Lấy Entity)
        List<Appointment> appointments = appointmentRepository.findDetailedAppointmentsByDateRange(startDate, endDate, doctorId);

        //Chuyển đổi Entity sang DTO
        List<AppointmentDetailDTO> dtos = appointments.stream()
                .map(a -> {
                    // 1. Kết hợp ngày (LocalDate) và giờ (LocalTime) thành LocalDateTime
                    LocalDateTime bookingDateTime = a.getBookableSlot().getSlotDate().toLocalDate()
                            .atTime(a.getBookableSlot().getStartTime().toLocalTime());

                    // 2. Format thành chuỗi dd/MM/yyyy HH:mm
                    String dateTimeString = bookingDateTime.format(DATETIME_FORMATTER);

                    return new AppointmentDetailDTO(
                            a.getId(),
                            a.getAppointmentCode(),
                            a.getPatient().getFullName(),
                            dateTimeString,
                            a.getPrice() != null ? a.getPrice() : 0,
                            a.getStatus()
                    );
                })
                .collect(Collectors.toList());
        //Trả về Response
        return new DetailedReportResponse(
                totalRevenue != null ? totalRevenue : 0L,
                dtos
        );
    }
}

