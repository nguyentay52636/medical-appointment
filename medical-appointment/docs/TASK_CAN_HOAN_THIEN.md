# 📋 KẾ HOẠCH & DANH MỤC TASK HOÀN THIỆN HỆ THỐNG MEDICARE

> **Dự án**: Hệ thống Đặt lịch khám bệnh & Quản lý phòng khám trực tuyến (MediCare / Klinik)  
> **Kiến trúc**: React 19 SPA + Spring Boot 3.3.0 + MySQL 8 + Apache Kafka + Spring AI RAG  
> **Trạng thái**: Kế hoạch nâng cấp hoàn thiện toàn diện  
> **Ngày lập kế hoạch**: 02/11/2026  

---

## 📌 MỤC LỤC
1. [Phân Tích Thực Trạng: Hồ Sơ Bệnh Án / Kết Quả Khám Cho Từng Lần Khám](#1-phân-tích-thực-trạng-hồ-sơ-bệnh-án--kết-quả-khám-cho-từng-lần-khám)
2. [Ma Trận Ưu Tiên Các Hạng Mục Cần Hoàn Thiện](#2-ma-trận-ưu-tiên-các-hạng-mục-cần-hoàn-thiện)
3. [Chi Tiết Các Giai Đoạn Triển Khai (Sprint Tasks)](#3-chi-tiết-các-giai-đoạn-triển-khai-sprint-tasks)
   - [Task 1: Xây Dựng Hồ Sơ Khám Bệnh, Chẩn Đoán & Toa Thuốc Điện Tử (EMR)](#task-1-xây-dựng-hồ-sơ-khám-bệnh-chẩn-đoán--toa-thuốc-điện-tử-emr)
   - [Task 2: Đưa Trợ Lý AI Ra Giao Diện Chính & Floating Chatbot Widget](#task-2-đưa-trợ-lý-ai-ra-giao-diện-chính--floating-chatbot-widget)
   - [Task 3: Phân Hệ Quản Lý Chuyên Khoa Toàn Diện Cho Admin](#task-3-phân-hệ-quản-lý-chuyên-khoa-toàn-diện-cho-admin)
   - [Task 4: Trang Chi Tiết Hồ Sơ Bác Sĩ Chuyên Sâu Cho Bệnh Nhân](#task-4-trang-chi-tiết-hồ-sơ-bác-sĩ-chuyên-sâu-cho-bệnh-nhân)
   - [Task 5: Hệ Thống Đánh Giá & Phản Hồi Sau Khám (Rating & Reviews)](#task-5-hệ-thống-đánh-giá--phản-hồi-sau-khám-rating--reviews)
   - [Task 6: Quản Lý Ngày Nghỉ Phép / Khóa Lịch Đột Xuất Của Bác Sĩ](#task-6-quản-lý-ngày-nghỉ-phép--khóa-lịch-đột-xuất-của-bác-sĩ)
4. [Bảng Theo Dõi Tiến Độ (Checklist)](#4-bảng-theo-dõi-tiến-độ-checklist)

---

## 1. PHÂN TÍCH THỰC TRẠNG: HỒ SƠ BỆNH ÁN / KẾT QUẢ KHÁM CHO TỪNG LẦN KHÁM

### 🔍 Câu hỏi đặt ra: *"Dự án đã có hồ sơ mỗi lần khám bệnh cho mỗi cá nhân chưa?"*

### ⚠️ KẾT LUẬN: **CHƯA CÓ (HỆ THỐNG MỚI CHỈ Ở MỨC "LỊCH HẸN KHÁM", CHƯA CÓ "HỒ SƠ BỆNH ÁN / KẾT QUẢ KHÁM")**

### Chi tiết phân tích kỹ thuật:

#### 1. Cơ sở dữ liệu (Database Schema):
- Hiện tại bảng `appointment` chỉ lưu trữ:
  - `reason_for_visit`: Lý do khám (**do bệnh nhân tự gõ** lúc đặt lịch, ví dụ: *"Đau đầu, sốt nhẹ"*).
  - `note`: Ghi chú sơ bộ (**do bệnh nhân tự gửi** cho bác sĩ lúc đặt hẹn).
  - `status`: Trạng thái ca khám (`pending`, `confirmed`, `completed`, `cancelled`).
  - `price`, `payment_method`, `payment_status`: Thông tin viện phí.
- **HOÀN TOÀN THIẾU** các trường/bảng lưu trữ kết luận chuyên môn của Bác sĩ sau khi khám thực tế:
  - ❌ **Chẩn đoán y khoa (Diagnosis)**: Bác sĩ xác định bệnh nhân mắc bệnh gì?
  - ❌ **Lời dặn / Phác đồ điều trị (Doctor's Advice / Instructions)**: Chế độ nghỉ ngơi, kiêng cữ.
  - ❌ **Toa thuốc điện tử (Prescription / Medication)**: Tên thuốc, số lượng viên/gói, liều dùng (sáng/trưa/chiều/tối, trước hay sau ăn).
  - ❌ **Hẹn ngày tái khám (Follow-up Date)**: Bệnh nhân cần quay lại kiểm tra vào ngày nào?
  - ❌ **Chỉ số sinh hiệu cơ bản (Vital Signs)**: Huyết áp, mạch, nhiệt độ, cân nặng.

#### 2. Cổng Bác sĩ (Doctor Portal):
- Tại trang chi tiết ca khám [`AppointmentDetailPage.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/doctor/AppointmentDetailPage.jsx):
  - Bác sĩ chỉ có 3 nút bấm cơ bản: *Xác nhận lịch*, *Bắt đầu khám*, *Hủy lịch*.
  - Bác sĩ **không có bất kỳ ô nhập liệu nào** để ghi lại chẩn đoán, không có form kê đơn thuốc và không có nút *Hoàn tất ca khám & Xuất hồ sơ bệnh án*.

#### 3. Cổng Bệnh nhân (Patient Portal):
- Tại trang lịch sử khám [`BookingHistoryPage.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/patient/BookingHistoryPage.jsx):
  - Khi ca khám chuyển sang trạng thái "Đã khám" (`completed`), bệnh nhân chỉ thấy dòng chữ "Đã khám".
  - Bệnh nhân **hoàn toàn không có nút xem "Kết quả khám bệnh" hay "Toa thuốc đã kê"** của lần khám đó.
  - Nút in PDF hiện tại chỉ là **"PHIẾU LỊCH KHÁM"** (phiếu xác nhận giờ hẹn để tới phòng khám), chứ không phải **"PHIẾU KẾT QUẢ KHÁM BỆNH / TOA THUỐC"**.

> **Ý nghĩa nghiệp vụ**: Việc xây dựng phân hệ **Hồ sơ Khám bệnh & Toa thuốc điện tử** là mảnh ghép quan trọng nhất để đưa MediCare từ một ứng dụng "Đặt chỗ" (Booking) thành một **Nền tảng Y tế Số Toàn diện (Comprehensive Digital Healthcare Platform)**.

---

## 2. MA TRẬN ƯU TIÊN CÁC HẠNG MỤC CẦN HOÀN THIỆN

```
   MỨC ĐỘ ẢNH HƯỞNG
         ▲
         │
  CAO    │   [Task 1: Bệnh Án & Toa Thuốc]       [Task 2: AI trên Navbar & Bubble]
         │
 TRUNG   │   [Task 3: Quản Lý Chuyên Khoa Admin]  [Task 4: Chi Tiết Hồ Sơ Bác Sĩ]
 BÌNH    │
         │
  THẤP   │   [Task 5: Đánh Giá & Rating]          [Task 6: Quản Lý Nghỉ Phép Bác Sĩ]
         │
         └────────────────────────────────────────────────────────────────────────►
             DỄ / NHANH                                                PHỨC TẠP
                                    ĐỘ PHỨC TẠP TRIỂN KHAI
```

| STT | Tên Task | Phân hệ tác động | Mức độ ưu tiên | Độ khó | Thời gian dự kiến |
|:---:|:---|:---|:---:|:---:|:---:|
| **1** | **Hồ sơ Bệnh án, Chẩn đoán & Kê toa thuốc (EMR)** | Bác sĩ, Bệnh nhân, Backend, DB | 🔴 **P1 - Rất cao** | Trung bình | 1 - 2 ngày |
| **2** | **Đưa Trí tuệ Nhân tạo AI ra Navbar & Chat Widget nổi** | Bệnh nhân, Frontend | 🔴 **P1 - Rất cao** | Dễ | 0.5 ngày |
| **3** | **Quản lý Danh mục Chuyên khoa cho Admin** | Quản trị Admin, Backend | 🟡 **P2 - Cao** | Dễ | 0.5 ngày |
| **4** | **Trang Chi tiết Hồ sơ Bác sĩ chuyên sâu** | Bệnh nhân | 🟡 **P2 - Cao** | Dễ | 0.5 ngày |
| **5** | **Đánh giá & Chấm sao Bác sĩ sau khi khám (Reviews)** | Bệnh nhân, Bác sĩ, DB | 🟢 **P3 - Trung bình**| Trung bình | 1 ngày |
| **6** | **Quản lý Nghỉ phép / Khóa ngày bận của Bác sĩ** | Bác sĩ, Đặt lịch | 🟢 **P3 - Trung bình**| Dễ | 0.5 ngày |

---

## 3. CHI TIẾT CÁC GIAI ĐOẠN TRIỂN KHAI (SPRINT TASKS)

### TASK 1: Xây Dựng Hồ Sơ Khám Bệnh, Chẩn Đoán & Toa Thuốc Điện Tử (EMR)
*Mục tiêu: Hoàn thiện vòng đời ca khám từ lúc bệnh nhân đến phòng khám -> bác sĩ khám & kê toa -> bệnh nhân xem lại hồ sơ cũ.*

#### 1. Cơ sở dữ liệu (Database):
Tạo bảng mới `medical_record` hoặc liên kết trực tiếp với `appointment`:
```sql
CREATE TABLE IF NOT EXISTS `medical_record` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `appointment_id` INT NOT NULL UNIQUE,
  `diagnosis` TEXT NOT NULL COMMENT 'Chẩn đoán bệnh y khoa',
  `symptoms_observed` TEXT COMMENT 'Triệu chứng lâm sàng ghi nhận',
  `doctor_advice` TEXT COMMENT 'Lời dặn dò, chế độ ăn uống sinh hoạt',
  `prescriptions_json` LONGTEXT COMMENT 'Danh sách thuốc JSON [{name, dosage, quantity, instruction}]',
  `follow_up_date` DATE DEFAULT NULL COMMENT 'Ngày hẹn tái khám (nếu có)',
  `blood_pressure` VARCHAR(20) DEFAULT NULL COMMENT 'Huyết áp (mmHg)',
  `heart_rate` INT DEFAULT NULL COMMENT 'Nhịp tim (bpm)',
  `temperature` DECIMAL(4,1) DEFAULT NULL COMMENT 'Thân nhiệt (°C)',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT `fk_record_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 2. Backend Spring Boot:
- Tạo Entity `MedicalRecord.java`, Repository `MedicalRecordRepository.java`.
- Endpoints RESTful API:
  - `POST /api/medical-record/save`: Bác sĩ hoàn thành ca khám, lưu chẩn đoán + đơn thuốc, tự động cập nhật `appointment.status = 'completed'`.
  - `GET /api/medical-record/appointment/{appointmentId}`: Lấy chi tiết hồ sơ bệnh án của 1 lịch hẹn.
  - `GET /api/medical-record/patient/{patientId}`: Lấy toàn bộ lịch sử bệnh án từ trước đến nay của bệnh nhân để bác sĩ theo dõi tiền sử bệnh.
  - `GET /api/report/prescription/{appointmentId}`: Kết xuất file PDF "Phiếu Khám Bệnh & Đơn Thuốc" chính thức.

#### 3. Frontend Bác sĩ (`AppointmentDetailPage.jsx`):
- Khi ca khám đang ở trạng thái `confirmed` hoặc `in_progress`:
  - Hiển thị Form **"Khám Bệnh & Kết Luận Y Khoa"**:
    - Nhập chẩn đoán bệnh chính.
    - Nhập chỉ số sinh hiệu (Huyết áp, Thân nhiệt).
    - Bảng kê toa thuốc: Thêm dòng thuốc linh hoạt (Tên thuốc, Số lượng, Đơn vị, Sáng/Trưa/Tối).
    - Lời dặn dò & Chọn ngày tái khám.
  - Nút bấm: **"Lưu Hồ Sơ & Hoàn Tất Ca Khám"**.

#### 4. Frontend Bệnh nhân (`BookingHistoryPage.jsx`):
- Với các ca khám có trạng thái `completed`:
  - Hiển thị nút bấm xanh nổi bật: **"Xem Bệnh Án & Toa Thuốc"**.
  - Modal hiển thị chi tiết: Tên bác sĩ, Chẩn đoán, Toa thuốc dạng bảng rõ ràng, Lời dặn dò, Ngày tái khám.
  - Nút **"Tải / In Toa Thuốc (PDF)"**.

---

### TASK 2: Đưa Trợ Lý AI Ra Giao Diện Chính & Floating Chatbot Widget
*Mục tiêu: Làm nổi bật tính năng Trợ lý Y tế AI (Spring AI RAG / VietMap), giúp bệnh nhân tiếp cận dễ dàng 24/7.*

#### 1. Bổ sung mục điều hướng trên `NavBar.jsx`:
- Thêm menu **"Trợ lý AI"** dẫn trực tiếp tới `/patient/ai-suggest` kèm biểu tượng Robot `fas fa-robot` và nhãn `HOT` hoặc `AI Powered`.

#### 2. Xây dựng Floating Chatbot Widget (`AIChatBubble.jsx`):
- Widget nút tròn nổi ở góc dưới bên phải màn hình (`fixed bottom-6 right-6 z-50`).
- Khi bấm: Mở popup chat dạng cửa sổ tin nhắn tinh tế, cho phép bệnh nhân trò chuyện ngay với AI mà không cần rời trang hiện tại.
- Tích hợp bộ nhớ phiên hội thoại `sessionId` duy trì câu chuyện liên tục.

---

### TASK 3: Phân Hệ Quản Lý Chuyên Khoa Toàn Diện Cho Admin
*Mục tiêu: Đưa danh mục Chuyên khoa vào quyền quản trị của Admin thay vì chỉnh sửa thủ công trong MySQL.*

#### 1. Backend API (`SpecialtyController.java`):
- `POST /api/specialty/create`: Thêm mới chuyên khoa (tên, mô tả, hình ảnh/icon).
- `PUT /api/specialty/{id}`: Sửa tên, cập nhật thông tin giới thiệu chuyên khoa.
- `DELETE /api/specialty/{id}`: Xóa chuyên khoa (có kiểm tra ràng buộc không có bác sĩ nào đang phụ trách).

#### 2. Frontend Admin (`AdminSpecialties.jsx`):
- Thêm mục **"Quản lý Chuyên khoa"** trên Sidebar [`AdminLayout.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/layout/AdminLayout.jsx).
- Bảng danh sách các khoa: Tên khoa, Số bác sĩ đang công tác, Mô tả, Thao tác Thêm/Sửa/Xóa.

---

### TASK 4: Trang Chi Tiết Hồ Sơ Bác Sĩ Chuyên Sâu Cho Bệnh Nhân
*Mục tiêu: Cung cấp đầy đủ thông tin chuyên môn giúp bệnh nhân an tâm tin tưởng trước khi quyết định đặt lịch.*

#### 1. Tuyến đường Route mới:
- `/patient/doctor/:id` (hoặc `/patient/doctor-detail`).

#### 2. Giao diện trang:
- Avatar lớn, học hàm học vị, số năm kinh nghiệm, chứng chỉ chuyên môn.
- Đoạn giới thiệu tiểu sử (Bio) chi tiết và triết lý chữa bệnh.
- Bảng giá dịch vụ khám niêm yết rõ ràng.
- Bản đồ số VietMap phóng to thể hiện vị trí chính xác của phòng khám và tính khoảng cách từ vị trí người dùng.
- Khung giờ trực trong tuần của bác sĩ đi kèm nút **"Đặt lịch ngay với Bác sĩ này"**.

---

### TASK 5: Hệ Thống Đánh Giá & Phản Hồi Sau Khám (Rating & Reviews)
*Mục tiêu: Thu thập phản hồi thực tế từ người bệnh để xây dựng uy tín cho bác sĩ và phòng khám.*

#### 1. Cơ sở dữ liệu:
- Bảng `doctor_review` lưu: `appointment_id`, `doctor_id`, `patient_id`, `rating` (1 - 5 sao), `comment`, `created_at`.

#### 2. Giao diện:
- Trong lịch sử khám bệnh, bệnh nhân bấm **"Đánh giá ca khám"** sau khi hoàn thành.
- Điểm đánh giá trung bình (ví dụ: `4.9 ★ (120 đánh giá)`) hiển thị trên thẻ bác sĩ tại danh sách và trang chi tiết.

---

### TASK 6: Quản Lý Ngày Nghỉ Phép / Khóa Lịch Đột Xuất Của Bác Sĩ
*Mục tiêu: Khắc phục trường hợp bác sĩ có việc bận đột xuất vào một ngày cụ thể trong tuần.*

#### 1. Giao diện Cổng Bác sĩ (`DoctorLeavesModal.jsx`):
- Tại trang Lịch biểu [`SchedulePage.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/doctor/SchedulePage.jsx), bổ sung tab **"Đăng ký Nghỉ phép / Bận việc"**.
- Bác sĩ chọn ngày nghỉ cụ thể (ví dụ: ngày 20/11) và lý do (Nghỉ phép / Đi hội thảo).
- Hệ thống tự động khóa tất cả các khung giờ `BookableSlot` của ngày hôm đó để bệnh nhân không thể chọn ngày đó khi đặt lịch.

---

### TASK 7: Hệ Thống AI Tư Vấn Sàng Lọc & Phân Luồng Chuyên Khoa Độc Lập (AI Clinical Triage & Specialty CRM Knowledge Base)
*Mục tiêu: Cung cấp trợ lý AI y khoa thông minh giúp bệnh nhân phân tích triệu chứng lâm sàng, khuyến nghị chính xác chuyên khoa cần khám, đưa ra 3 hướng xử lý an toàn tại nhà và câu hỏi sàng lọc mở rộng; quản lý toàn bộ từ khóa bệnh lý thông qua tệp JSON CRM tri thức độc lập.*

#### 1. Tệp Tri Thức JSON Độc Lập (CRM Knowledge Base):
- Vị trí: `backend/src/main/resources/data/medical_specialty_crm_rules.json` & `frontend/src/data/medicalSpecialtyDictionary.json`.
- Cấu trúc chuẩn hóa:
  - `specialties`: Danh mục chuyên khoa (Nội khoa, Tim mạch, Tai Mũi Họng, Da liễu, Nhi khoa...).
  - `departmentCode`: Mã chuyên khoa chuẩn bệnh viện (`INTERNAL_MED`, `CARDIOLOGY`, `ENT`, `DERMATOLOGY`, `PEDIATRICS`...).
  - `keywords`: Tập hợp từ khóa triệu chứng đa dạng (VD: mất ngủ, đau đầu, mệt mỏi, đau tức ngực, đau họng, phát ban, sốt ở trẻ...).
  - `commonConditions`: Danh mục bệnh lý liên quan thường gặp.
  - `analysisTemplate`: Khung phân tích nguyên nhân tiềm ẩn.
  - `standardHandlingDirections`: 3 hướng xử lý / chăm sóc chuẩn hóa.
  - `screeningQuestions`: Câu hỏi sàng lọc chuyên sâu.
  - `emergencyWarningKeywords`: Từ khóa dấu hiệu cấp cứu cần cảnh báo tức thì.

#### 2. Động Cơ Lai (Hybrid Engine: CRM Rule-Based + Spring AI LLM):
- Phân tích từ khóa và tính điểm phù hợp (`matchScore` 65% - 98%).
- Tích hợp gọi Spring AI LLM để cá nhân hóa phân tích và tự động chuyển về Rule Engine khi ngoại tuyến hoặc vượt quota.
- Tự động truy xuất danh sách bác sĩ chuyên khoa tương ứng đang hoạt động trong phòng khám.

#### 3. Giao Diện Người Dùng (Frontend):
- Đường dẫn: `/patient/ai-consult` & popup tại `SupportPage.jsx` & liên kết tại `NavBar.jsx` và `HomePage.jsx`.
- Hiển thị phản hồi AI dạng thẻ trực quan 4 phần:
  1. 🩺 **AI Phân tích vấn đề**: Nhận định nguyên nhân tiềm ẩn.
  2. 🏥 **Đề xuất Chuyên khoa**: Huy hiệu chuyên khoa, điểm khớp triệu chứng, lý do đề xuất & nút "Đặt lịch khám khoa này".
  3. 💡 **3 Hướng xử lý tại nhà**: Các bước chăm sóc lối sống, theo dõi và khi nào cần đi viện.
  4. ❓ **AI hỏi thêm để tư vấn chính xác**: Các câu hỏi tương tác bấm chọn nhanh.
  5. 👨‍⚕️ **Bác sĩ tiêu biểu**: Thẻ bác sĩ thuộc chuyên khoa với nút "Đặt lịch ngay".
- Tích hợp Modal **"Từ Điển CRM Tri Thức Y Khoa"** cho phép tra cứu toàn bộ từ khóa và quy tắc phân luồng trực tiếp.

---

## 4. BẢNG THEO DÕI TIẾN ĐỘ (CHECKLIST)

| Hạng mục công việc | Mô tả chi tiết | Phân hệ | Trạng thái |
|:---|:---|:---:|:---:|
| **[TASK 1.1]** | Tạo bảng `medical_record` trong MySQL | DB | ✅ Đã hoàn thành (02/11/2026) |
| **[TASK 1.2]** | Tạo Entity, Repository, Service, Controller cho Hồ sơ bệnh án | Backend | ✅ Đã hoàn thành (02/11/2026) |
| **[TASK 1.3]** | Form Bác sĩ khám 4 bước, tính BMI & kê đơn thuốc tại `AppointmentDetailPage.jsx` | Frontend (Doctor) | ✅ Đã hoàn thành (02/11/2026) |
| **[TASK 1.4]** | Modal Bệnh nhân xem bệnh án & in toa thuốc tại `BookingHistoryPage.jsx` | Frontend (Patient) | ✅ Đã hoàn thành (02/11/2026) |
| **[TASK 1.5]** | Thiết kế mẫu PDF / In A4 Bệnh Án Điện Tử & Toa Thuốc chuẩn | Frontend / Print | ✅ Đã hoàn thành (02/11/2026) |
| **[TASK 7.1]** | Xây dựng tệp JSON CRM từ khóa bệnh lý & chuyên khoa độc lập | Knowledge Base | ✅ Đã hoàn thành (03/11/2026) |
| **[TASK 7.2]** | Backend Spring Boot `MedicalTriageService` & API `/api/ai/triage-consult` | Backend | ✅ Đã hoàn thành (03/11/2026) |
| **[TASK 7.3]** | Nâng cấp giao diện Trợ lý AI Tư vấn Sàng lọc & Phân Luồng Chuyên Khoa (`AssistantAI.jsx`) | Frontend | ✅ Đã hoàn thành (03/11/2026) |
| **[TASK 7.4]** | Thêm mục "🤖 Tư Vấn AI" trên Header/NavBar và Banner CTA Trang chủ | Frontend | ✅ Đã hoàn thành (03/11/2026) |
| **[TASK 2.1]** | Widget bong bóng Chatbot AI nổi ở góc dưới các trang | Frontend | ⬜ Đang triển khai |
| **[TASK 3.1]** | Backend API CRUD Chuyên khoa (`SpecialtyController`) | Backend | ⬜ Chờ triển khai |
| **[TASK 3.2]** | Trang Quản lý Chuyên khoa cho Admin (`AdminSpecialties.jsx`) | Frontend (Admin) | ⬜ Chờ triển khai |
| **[TASK 4.1]** | Trang Chi tiết Hồ sơ Bác sĩ chuyên sâu (`/patient/doctor/:id`) | Frontend (Patient) | ⬜ Chờ triển khai |
| **[TASK 5.1]** | Hệ thống Đánh giá & Chấm sao Bác sĩ sau khi khám hoàn tất | Toàn hệ thống | ⬜ Chờ triển khai |
| **[TASK 6.1]** | Tính năng đăng ký ngày nghỉ phép đột xuất của Bác sĩ | Cổng Bác sĩ | ⬜ Chờ triển khai |

---

*(Tài liệu này được cập nhật tự động để theo dõi và chuẩn hóa toàn bộ các hạng mục hoàn thiện cho dự án MediCare)*
