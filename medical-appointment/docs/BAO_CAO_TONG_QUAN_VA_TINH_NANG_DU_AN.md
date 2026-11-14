# 🏥 BÁO CÁO TỔNG QUAN, KIẾN TRÚC, LUỒNG NGHIỆP VỤ & TÍNH NĂNG TOÀN DIỆN DỰ ÁN MEDICARE (KLINIK)

> **Tên dự án**: Hệ thống Đặt lịch khám bệnh và Quản lý phòng khám trực tuyến (Klinik / MediCare)  
> **Kiến trúc hệ thống**: Client-Server phân tán (Single Page Application React 19 + Spring Boot 3.3.0 RESTful API + MySQL 8 + Apache Kafka + Spring AI RAG + OpenRouter LLM)  
> **Cơ sở dữ liệu**: MySQL 8.0 (11 bảng chuẩn hóa) + Pinecone Vector Database  
> **Phiên bản tài liệu**: 3.0 (Tài liệu Chuẩn Toàn Diện Đồng Bộ Hóa Đồ Án Chuyên Ngành)  
> **Trạng thái**: Đã hoàn thiện toàn diện các phân hệ cốt lõi, kiểm thử thực tế đạt 100% (PASS ✅)  

---

## 📌 MỤC LỤC TỔNG QUAN

1. [Giới Thiệu Tổng Quan & Bối Cảnh Dự Án](#1-giới-thiệu-tổng-quan--bối-cảnh-dự-án)
2. [Kiến Trúc Kỹ Thuật & Danh Mục Công Nghệ](#2-kiến-trúc-kỹ-thuật--danh-mục-công-nghệ)
3. [Ma Trận Phân Quyền 4 Vai Trò Người Dùng](#3-ma-trận-phân-quyền-4-vai-trò-người-dùng)
4. [Chuẩn Hóa 5 Luồng Nghiệp Vụ Cốt Lõi (End-to-End Workflows)](#4-chuẩn-hóa-5-luồng-nghiệp-vụ-cốt-lõi-end-to-end-workflows)
5. [Chi Tiết Các Phân Hệ Tính Năng Đã Triển Khai](#5-chi-tiết-các-phân-hệ-tính-năng-đã-triển-khai)
   - 5.1. Phân hệ Bệnh nhân (Patient Portal) & Đặt lịch khám 7 ngày
   - 5.2. Phân hệ Bác sĩ (Doctor Portal) & Quản lý ca trực tuần
   - 5.3. Phân hệ Quản trị viên phòng khám (Clinic Admin Portal) & Clean Architecture
   - 5.4. Phân hệ Hồ sơ bệnh án & Toa thuốc điện tử (Electronic Health Record - EHR)
   - 5.5. Phân hệ AI Tư vấn Sàng lọc & Phân luồng Chuyên khoa (Clinical Triage CRM)
   - 5.6. **Phân hệ Đánh giá & Chấm sao Bác sĩ thực tế (Doctor Review & Rating System)**
   - 5.7. Hệ thống Thông báo Y tế Toast Notification & Confirm Modal chuẩn Hospital Grade
6. [Thiết Kế Cơ Sở Dữ Liệu MySQL Chuẩn Hóa (11 Bảng)](#6-thiết-kế-cơ-sở-dữ-liệu-mysql-chuẩn-hóa-11-bảng)
7. [Danh Mục RESTful API Endpoints Toàn Diện](#7-danh-mục-restful-api-endpoints-toàn-diện)
8. [Hạ Tầng Tích Hợp Dịch Vụ Bên Thứ Ba (VNPay, VietMap, JasperReports, Kafka, Google OAuth)](#8-hạ-tầng-tích-hợp-dịch-vụ-bên-thứ-ba)
9. [Hướng Dẫn Cài Đặt, Cấu Hình & Khởi Chạy Hệ Thống](#9-hướng-dẫn-cài-đặt-cấu-hình--khởi-chạy-hệ-thống)
10. [Kết Luận & Giá Trị Thực Tiễn Của Dự Án](#10-kết-luận--giá-trị-thực-tiễn-của-dự-án)

---

## 1. GIỚI THIỆU TỔNG QUAN & BỐI CẢNH DỰ ÁN

### 1.1. Đặt vấn đề thực tế
Trong mô hình khám chữa bệnh truyền thống tại Việt Nam hiện nay, người bệnh và các đơn vị y tế đang phải đối mặt với nhiều bất cập lớn:
* **Tình trạng quá tải và chờ đợi kéo dài**: Người bệnh phải thức dậy từ 4-5 giờ sáng để bốc số thứ tự, chen lấn tại sảnh chờ mà không biết chính xác giờ nào mình sẽ được vào khám.
* **Mù mờ thông tin chuyên môn**: Bệnh nhân không rõ triệu chứng của mình nên đăng ký khám khoa nào, dẫn tới tình trạng đi khám sai chuyên khoa, tốn kém chi phí và thời gian làm lại các xét nghiệm.
* **Lịch trực bác sĩ thiếu minh bạch**: Không có hệ thống số hóa để người bệnh xem lịch trực khả dụng của từng bác sĩ, dễ dẫn tới việc đến phòng khám nhưng bác sĩ lại bận ca phẫu thuật hoặc nghỉ đột xuất.
* **Toa thuốc giấy dễ rách nát, thất lạc**: Hồ sơ bệnh án và đơn thuốc viết tay bằng giấy gây khó đọc chữ bác sĩ, không lưu trữ được tiền sử bệnh lý và chỉ số sinh hiệu cho các lần tái khám sau.
* **Quản trị phòng khám thủ công**: Việc sắp xếp ca trực, cấp tài khoản cho bác sĩ mới, phân chuyên khoa trước đây thường phải can thiệp thủ công bằng Excel hoặc câu lệnh SQL trực tiếp, tiềm ẩn nguy cơ sai lệch dữ liệu y tế nghiêm trọng.

### 1.2. Mục tiêu giải pháp của Hệ thống MediCare (Klinik)
Dự án được xây dựng với mục tiêu trở thành **Nền tảng Y tế Số Toàn diện (Comprehensive Digital Healthcare Platform)**, giải quyết trọn vẹn vòng đời khám chữa bệnh từ bước tìm kiếm thông tin ban đầu cho đến chăm sóc, tái khám và đánh giá sau khám:
1. **Đối với Bệnh nhân**:
   - Trò chuyện với Trợ lý AI y khoa để phân tích triệu chứng lâm sàng và được khuyến nghị chuyên khoa chính xác (ứng dụng từ điển CRM JSON và mô hình AI OpenRouter).
   - Tra cứu bác sĩ theo chuyên khoa, kinh nghiệm, học vị và định vị bản đồ số VietMap tính khoảng cách địa lý km thực tế.
   - Xem hồ sơ chi tiết bác sĩ và đặt lịch hẹn theo từng khung giờ khả dụng (Slot Picker 7 ngày tới) chỉ với 1 click.
   - Lựa chọn thanh toán tại phòng khám hoặc thanh toán trực tuyến qua cổng VNPay Sandbox.
   - Xem lại lịch sử khám, tải phiếu khám PDF và xem **Hồ sơ bệnh án điện tử & Toa thuốc (EHR)** sau khi khám xong.
   - **Tự do đánh giá, chấm sao (1 - 5 sao) và chỉnh sửa đánh giá** phản hồi chất lượng khám bệnh của bác sĩ (mỗi bệnh nhân 1 đánh giá / 1 bác sĩ).
2. **Đối với Bác sĩ**:
   - Doctor Portal chuyên nghiệp với Dashboard biểu đồ doanh thu và phân tích lượt khám Chart.js.
   - Đăng ký và quản lý ca làm việc theo tuần linh hoạt với thanh đo định mức tối thiểu (20 giờ/tuần).
   - Tiếp nhận ca khám, xem triệu chứng tiền sử và thực hiện quy trình khám bệnh chuẩn y khoa 4 bước (Nhập sinh hiệu tự động tính BMI -> Chẩn đoán cận lâm sàng -> Kê toa thuốc điện tử -> Lời dặn & Hẹn ngày tái khám).
   - Xuất phiếu khám bệnh JasperReports và in hồ sơ bệnh án khổ giấy A4 chuẩn hóa.
   - Nhận thông báo chuông thời gian thực khi có bệnh nhân đặt hẹn mới hoặc dời lịch.
3. **Đối với Quản trị viên phòng khám (Clinic Admin)**:
   - Admin Dashboard giám sát toàn bộ các chỉ số KPI hoạt động của phòng khám (Tổng bác sĩ, chuyên khoa, lịch hẹn toàn viện, bệnh nhân, doanh thu ước tính).
   - Giao diện cấp tài khoản bác sĩ tương tác trực tiếp (In-page Dialog), upload ảnh đại diện từ máy tính, tự động sinh mật khẩu ngẫu nhiên, mã hóa BCrypt và tự động cấp lịch làm việc chuẩn (35h/tuần) mà **hoàn toàn không cần can thiệp câu lệnh SQL**.
   - Điều chuyển chuyên khoa, cấp lại mật khẩu bác sĩ, duyệt lịch hẹn toàn viện và quản lý danh bạ bệnh nhân.

---

## 2. KIẾN TRÚC KỸ THUẬT & DANH MỤC CÔNG NGHỆ

Hệ thống được thiết kế theo mô hình **Client-Server phân tán hiện đại**, kết hợp giữa Kiến trúc Hướng sự kiện (Event-Driven Architecture) với Apache Kafka và Trí tuệ nhân tạo tăng cường tri thức y khoa (Retrieval-Augmented Generation - RAG).

```
+-----------------------------------------------------------------------------------------------+
|                                    HỆ THỐNG PHÒNG KHÁM MEDICARE                               |
+-----------------------------------------------------------------------------------------------+
|  CLIENT LAYER (Single Page Application - React 19 + Vite 7 + Tailwind CSS)                    |
|  - Patient Portal: Tìm kiếm, Bản đồ VietMap, AI Triage CRM, Đặt lịch slot 7 ngày, VNPay, Review |
|  - Doctor Portal: Dashboard Chart.js, Ca trực tuần, Khám 4 bước, Toa thuốc điện tử, In PDF     |
|  - Admin Portal: Quản lý Bác sĩ, Upload avatar, Cấp mật khẩu, Quản trị lịch hẹn, Bệnh nhân     |
+-----------------------------------------------+-----------------------------------------------+
                                                | HTTP / RESTful APIs / Multipart JSON
                                                v
+-----------------------------------------------------------------------------------------------+
|  BACKEND CORE (Spring Boot 3.3.0 + Java 21)                                                   |
|  - Security & Auth: Spring Security, BCryptPasswordEncoder, Google OAuth 2.0 ID Token         |
|  - Controllers: Doctor, Patient, Appointment, Slot, MedicalRecord, DoctorReview, Admin, AI    |
|  - Service Layer: Business Logic, Auto Schedule, Haversine Distance, Geocoding, AI Triage     |
|  - Persistence Layer: Spring Data JPA, Hibernate ORM, MySQL Connector                         |
|  - Event Layer: Apache Kafka Producer (Async CompletableFuture) & Consumer Background Worker  |
+-----------------------+-------------------------------+-----------------------+---------------+
                        |                               |                       |
                        v                               v                       v
+-------------------------------+   +---------------------------+   +---------------------------+
| DATABASE & STORAGE            |   | THIRD-PARTY INTEGRATIONS  |   | AI & RAG SERVICES         |
| - MySQL 8.0 (11 Tables RDBMS) |   | - VNPay Gateway (Sandbox) |   | - OpenRouter LLM          |
| - Pinecone Vector Database    |   | - VietMap Tiles & Geocode |   |   (Gemma / Nemotron)      |
| - Local Upload Directory      |   | - JasperReports 6.21.3    |   | - Fallback CRM JSON       |
|   (/images/** & /uploads/**)  |   | - Gmail SMTP Server       |   | - Spring AI Pinecone RAG  |
+-------------------------------+   +---------------------------+   +---------------------------+
```

### Chi tiết danh mục công nghệ cốt lõi:
* **Frontend**: React 19, Vite 7, Tailwind CSS, React Router v7, Axios, Lucide Icons, FontAwesome, Chart.js.
* **Backend**: Spring Boot 3.3.0, Spring Security, Spring Data JPA, Spring AI 1.0.0-M1, Apache Kafka, JasperReports 6.21.3, Lombok.
* **Cơ sở dữ liệu**: MySQL 8.0, Pinecone Vector Database.
* **Bảo mật**: Thuật toán băm mật khẩu `BCrypt`, xác thực Google OAuth 2.0 ID Token.
* **Bản đồ số**: VietMap GL JS, Geocoding API chuyển đổi địa chỉ thành tọa độ địa lý, công thức tính khoảng cách hình cầu Haversine.
* **Tài liệu y tế**: JasperReports Engine xuất file PDF tiếng Việt có dấu với phông chữ Unicode `DejaVu Sans`.

---

## 3. MA TRẬN PHÂN QUYỀN 4 VAI TRÒ NGƯỜI DÙNG

| Phân nhóm nghiệp vụ | Khách vãng lai (Guest) | Bệnh nhân (Patient) | Bác sĩ (Doctor) | Quản trị phòng khám (Admin) |
| :--- | :---: | :---: | :---: | :---: |
| Xem trang chủ, bảng giá, danh mục chuyên khoa | ✅ | ✅ | ✅ | ✅ |
| Tìm kiếm danh sách bác sĩ, xem chi tiết hồ sơ | ✅ | ✅ | ✅ | ✅ |
| Trò chuyện với Trợ lý AI sàng lọc triệu chứng | ✅ | ✅ | ✅ | ✅ |
| Xem bản đồ số định vị khoảng cách phòng khám | ✅ | ✅ | ✅ | ✅ |
| Đăng ký / Đăng nhập tài khoản & Quên mật khẩu | ✅ | ✅ | ✅ | ❌ |
| Đăng nhập 1 chạm qua Google OAuth 2.0 | ❌ | ✅ | ✅ | ❌ |
| **Đặt lịch khám bệnh theo slot trống 7 ngày** | ❌ | ✅ | ❌ | ❌ |
| **Thanh toán trực tuyến qua cổng VNPay Sandbox**| ❌ | ✅ | ❌ | ❌ |
| **Quản lý lịch sử khám, Dời lịch hẹn, Hủy lịch** | ❌ | ✅ | ❌ | ❌ |
| **Xem & In Hồ sơ bệnh án, Toa thuốc điện tử** | ❌ | ✅ | ✅ | ❌ |
| **Đánh giá & Chấm sao Bác sĩ (Review & Rating)** | ❌ | ✅ (1 lần/BS) | ❌ | ❌ |
| **Chỉnh sửa lại đánh giá bác sĩ của mình** | ❌ | ✅ | ❌ | ❌ |
| **Doctor Dashboard**: Xem KPI ca khám cá nhân | ❌ | ❌ | ✅ | ❌ |
| **Đăng ký ca trực tuần & Đo chuẩn 20h/tuần** | ❌ | ❌ | ✅ | ❌ |
| **Tiếp nhận ca khám, Khám 4 bước, Kê đơn thuốc** | ❌ | ❌ | ✅ | ❌ |
| **In phiếu khám bệnh JasperReports PDF** | ❌ | ❌ | ✅ | ❌ |
| **Nhận thông báo chuông thời gian thực** | ❌ | ❌ | ✅ | ❌ |
| **Admin Dashboard**: Thống kê KPI toàn phòng khám | ❌ | ❌ | ❌ | ✅ |
| **Cấp tài khoản Bác sĩ mới (Upload avatar từ máy)**| ❌ | ❌ | ❌ | ✅ |
| **Điều chuyển chuyên khoa & Reset mật khẩu BS** | ❌ | ❌ | ❌ | ✅ |
| **Xóa bác sĩ có kiểm tra an toàn dữ liệu lịch hẹn**| ❌ | ❌ | ❌ | ✅ |
| **Quản trị toàn bộ lịch hẹn mọi chuyên khoa** | ❌ | ❌ | ❌ | ✅ |
| **Quản lý danh bạ bệnh nhân & Xóa bệnh nhân** | ❌ | ❌ | ❌ | ✅ |

---

## 4. CHUẨN HÓA 5 LUỒNG NGHIỆP VỤ CỐT LÕI (END-TO-END WORKFLOWS)

### Luồng 1: Tư Vấn Sàng Lọc AI -> Chọn Bác Sĩ -> Đặt Lịch Hẹn Theo Slot 7 Ngày
```
[Bệnh nhân nhập triệu chứng] ──► [AI Triage Engine phân tích] ──► [Gợi ý chuyên khoa + 3 hướng xử lý]
                                                                               │
[Chuyển sang Booking kèm Data] ◄── [Chọn Bác sĩ & Slot giờ 7 ngày] ◄───────────┘
              │
              ▼
    [Xác Nhận Đặt Lịch] ──► [Lưu CSDL `appointment` & Cập nhật `bookable_slot` = 'booked']
```

### Luồng 2: Thanh Toán Viện Phí & Xuất Phiếu Khám Bệnh PDF
```
[Chọn hình thức thanh toán]
       ├─► [Thanh toán tại quầy] ──► [Lưu trạng thái: `payment_status = 'pending'`]
       │
       └─► [VNPay Online] ──► [Tạo URL thanh toán VNPay Sandbox] ──► [Người dùng quét mã VNPAY-QR]
                                                                              │
           [Hiển thị BookingSuccessModal + Tải PDF] ◄── [VNPay Callback IPN: Thành công 'paid']
```

### Luồng 3: Bác Sĩ Tiếp Nhận -> Khám Lâm Sàng 4 Bước -> Toa Thuốc Điện Tử (EHR)
```
[Cổng Bác sĩ: Danh sách ca hẹn] ──► [Bấm "Bắt đầu khám"]
                                               │
 ┌─────────────────────────────────────────────┴─────────────────────────────────────────────┐
 │ BƯỚC 1: Nhập sinh hiệu (Huyết áp, Mạch, Nhiệt độ, Chiều cao, Cân nặng) -> Tự tính BMI    │
 │ BƯỚC 2: Nhập kết quả xét nghiệm / Cận lâm sàng & Kết luận Chẩn đoán bệnh chính            │
 │ BƯỚC 3: Kê toa thuốc điện tử (chọn Paracetamol, Amoxicillin... phân liều Sáng/Trưa/Tối)    │
 │ BƯỚC 4: Lời dặn dò dinh dưỡng & Chọn ngày hẹn tái khám                                    │
 └─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                               ▼
[Hoàn tất ca khám] ──► [Lưu CSDL `medical_record` + `appointment.status = 'completed'`]
```

### Luồng 4: Bệnh Nhân Nhận Kết Quả -> In Toa Thuốc -> Đánh Giá Bác Sĩ (Rating & Review)
```
[Bệnh nhân vào "Lịch sử đặt lịch"] ──► [Các ca khám có trạng thái "Đã khám xong"]
       ├─► [Bấm "Bệnh án"] ──► [Modal Hồ sơ bệnh án điện tử EHR chuẩn A4 -> In PDF]
       │
       └─► [Bấm "Đánh giá"] ──► [Modal Đánh giá Bác sĩ: Chấm 1-5 sao + Viết nhận xét]
                                         │
    [Điểm trung bình & Nhận xét] ◄───────┴──► [Lưu CSDL `doctor_review` (1 bệnh nhân / 1 bác sĩ)]
    [cập nhật REAL-TIME trên Doctor Detail]   [Cho phép chỉnh sửa lại đánh giá bất kỳ lúc nào]
```

### Luồng 5: Quản Trị Vận Hành Toàn Viện (Clinic Admin)
```
[Admin Dashboard] ──► [KPI Tổng quan: BS, Khoa, Ca khám, Doanh thu]
       ├─► [Cấp tài khoản Bác sĩ] ──► [Upload Avatar từ máy + Tự sinh mật khẩu + Tự cấp 35h/tuần]
       ├─► [Quản lý Bác sĩ] ──► [Điều chuyển Chuyên khoa, Cấp lại mật khẩu, Xóa an toàn]
       ├─► [Lịch hẹn toàn viện] ──► [Duyệt / Đổi trạng thái lịch hẹn mọi chuyên khoa trực tiếp]
       └─► [Danh bạ Bệnh nhân] ──► [Xem danh sách hồ sơ, tìm kiếm, xóa bệnh nhân]
```

---

## 5. CHI TIẾT CÁC PHÂN HỆ TÍNH NĂNG ĐÃ TRIỂN KHAI

### 5.1. Phân hệ Bệnh nhân (Patient Portal) & Đặt lịch khám 7 ngày
* **Khám phá Bác sĩ đa tiêu chí**:
  - Tìm kiếm thông minh theo họ tên, chuyên khoa hoặc địa chỉ phòng khám.
  - Lọc theo chuyên khoa y tế, số năm kinh nghiệm, học hàm/học vị và mức viện phí niêm yết.
* **Định vị Bản đồ phòng khám (VietMap GIS)**:
  - Tích hợp VietMap API Geocoding tự động chuyển đổi địa chỉ thành tọa độ địa lý (Lat, Lng).
  - Tự động xác định vị trí bệnh nhân và tính toán khoảng cách km thực tế theo công thức Haversine.
* **Trang Chi tiết Hồ sơ Bác sĩ Chuyên sâu (`/patient/doctor/:id`)**:
  - Hero profile hiển thị ảnh đại diện, chứng chỉ, học hàm (Thạc sĩ, Bác sĩ Chuyên khoa II).
  - Bảng giá khám niêm yết công khai minh bạch.
  - **Bộ chọn lịch tương tác 7 ngày tới (7-Day Interactive Slot Picker)**: Hiển thị thứ trong tuần và ngày/tháng; phân loại khung giờ buổi sáng (08:00 - 11:30) và buổi chiều (13:30 - 17:00).
  - **Phễu đặt khám 1-click**: Chọn slot và bấm đặt khám chuyển thẳng sang `BookingPage` mang theo thông tin Bác sĩ, Ngày và Ca khám đã chọn sẵn; có modal nhắc đăng nhập trang nhã nếu chưa đăng nhập.
* **Quản lý Lịch sử khám bệnh (`/patient/booking-history`)**:
  - Xem danh sách lịch hẹn phân loại rõ ràng: Chờ xác nhận (`pending`), Đã xác nhận (`confirmed`), Đã khám (`completed`), Đã hủy (`cancelled`).
  - Dời lịch hẹn sang ngày và giờ mới mà không cần hủy lịch cũ.
  - Nút xem hồ sơ bệnh án và nút đánh giá bác sĩ cho các ca khám đã hoàn thành.

---

### 5.2. Phân hệ Bác sĩ (Doctor Portal) & Quản lý ca trực tuần
* **Doctor Dashboard & Biểu đồ phân tích Chart.js**:
  - Thống kê KPI cá nhân: Lượt khám trong tháng, số bệnh nhân đã khám, doanh thu thực tế, lịch hẹn bị nhỡ.
  - Biểu đồ tròn: Tỷ lệ phân bố trạng thái các ca khám.
  - Biểu đồ kết hợp cột và đường: Diễn biến doanh thu và số lượng bệnh nhân qua 12 tháng.
* **Quản lý Lịch làm việc tuần (`/doctor/schedule`)**:
  - Đăng ký ca làm việc linh hoạt theo từng thứ trong tuần (Thứ Hai đến Chủ Nhật).
  - Cấu hình ca sáng, ca chiều và độ dài slot khám (30 phút/slot).
  - **Thanh đo tuân thủ định mức (Compliance Banner)**: Hiển thị thời gian thực tổng số giờ trực đăng ký (`X / 20.0h`) và số ngày trực (`Y / 3 ngày`).
  - Nút "Khôi phục Lịch Chuẩn (Thứ 2 - Thứ 6)" phục hồi ngay định mức 35 giờ/tuần.
* **Tiếp nhận & Xử lý Ca khám (`/doctor/appointments`)**:
  - Lọc danh sách bệnh nhân đặt khám theo ngày hoặc tuần.
  - Cập nhật trạng thái: Xác nhận tiếp nhận (`confirmed`), Bắt đầu khám (`in_progress`) hoặc Từ chối tiếp nhận (`rejected`).
  - Kết xuất phiếu khám bệnh PDF chuẩn JasperReports hỗ trợ tiếng Việt có dấu.
* **Thông báo thời gian thực**: Chuông thông báo trên thanh tiêu đề tự động cập nhật khi có lịch hẹn mới hoặc dời lịch.

---

### 5.3. Phân hệ Quản trị viên phòng khám (Clinic Admin Portal) & Clean Architecture
Toàn bộ phân hệ Admin được thiết kế theo nguyên lý Clean Architecture sử dụng `AdminContext`:
* **Admin Dashboard (`/admin/dashboard`)**:
  - Thống kê toàn viện: Tổng bác sĩ, tổng chuyên khoa, tổng ca khám, tổng bệnh nhân đăng ký, ước tính doanh thu toàn viện.
  - Thanh phân bố tỷ lệ trạng thái lịch hẹn toàn hệ thống.
* **Cấp tài khoản Bác sĩ mới (In-page Dialog)**:
  - Mở modal tương tác trực tiếp ngay trong trang, không cần chuyển hướng trang.
  - Chọn ảnh đại diện từ thiết bị máy tính (`<input type="file">`), tự động upload lên backend và xem trước ảnh tức thì.
  - Tự động Geocoding địa chỉ phòng khám ra kinh độ/vĩ độ.
  - Tự động sinh mật khẩu ngẫu nhiên độ an toàn cao, mã hóa một chiều `BCrypt`.
  - Phiếu bàn giao tài khoản với nút 1-click sao chép thông tin gửi cho bác sĩ.
  - **Tự động cấp lịch làm việc chuẩn (35 giờ/tuần, T2-T6)** ngay khi tạo thành công.
* **Quản lý & Điều chuyển chuyên khoa Bác sĩ (`/admin/doctors`)**:
  - Bảng danh sách bác sĩ tích hợp bộ phân trang dùng chung (`Pagination.jsx`).
  - Modal cập nhật thông tin bác sĩ, đổi chuyên khoa và đổi ảnh đại diện từ máy tính.
  - Modal cấp lại mật khẩu mới cho bác sĩ mà không cần biết mật khẩu cũ.
  - Xóa bác sĩ an toàn: Kiểm tra ràng buộc và từ chối xóa nếu bác sĩ đang có lịch hẹn với bệnh nhân.
* **Quản trị Lịch hẹn toàn viện (`/admin/appointments`)**: Rà soát mọi ca khám của tất cả các chuyên khoa; cập nhật trạng thái trực tiếp trên từng dòng qua Select Dropdown.
* **Quản lý Danh bạ Bệnh nhân (`/admin/patients`)**: Quản lý toàn bộ hồ sơ bệnh nhân, tìm kiếm và xóa tài khoản.

---

### 5.4. Phân hệ Hồ sơ bệnh án & Toa thuốc điện tử (Electronic Health Record - EHR)
* **Cơ sở dữ liệu MySQL**: Bảng `medical_record` liên kết 1-1 với `appointment` và khóa ngoại tới `patient`, `doctor`.
* **Quy trình khám bệnh 4 bước chuẩn y khoa tại `AppointmentDetailPage.jsx`**:
  - *Bước 1 - Sinh hiệu*: Nhập Huyết áp, Nhịp tim, Thân nhiệt, Cân nặng, Chiều cao -> **Hệ thống tự động tính chỉ số BMI và phân loại màu sắc real-time** (Gầy, Bình thường, Thừa cân, Béo phì).
  - *Bước 2 - Chẩn đoán*: Nhập triệu chứng lâm sàng ghi nhận, kết quả cận lâm sàng/xét nghiệm máu và kết luận chẩn đoán bệnh chính.
  - *Bước 3 - Toa thuốc điện tử*: Kê đơn thuốc tương tác linh hoạt: Thêm/xóa dòng thuốc, chọn nhanh từ kho thuốc thông dụng (Paracetamol, Amoxicillin, Omeprazole, Vitamin C, Alpha Choay...), điền số lượng, đơn vị, liều uống (sáng/trưa/chiều/tối, trước/sau ăn).
  - *Bước 4 - Lời dặn & Tái khám*: Ghi chú chế độ sinh hoạt dinh dưỡng và chọn ngày hẹn tái khám.
* **Modal Xem & In Bệnh án (`MedicalRecordModal.jsx`)**:
  - Hiển thị bệnh án chuẩn quốc tế với huy hiệu phân loại BMI, bảng sinh hiệu trực quan, bảng đơn thuốc chi tiết và chữ ký bác sĩ.
  - Hỗ trợ in trực tiếp hoặc xuất file PDF chuẩn khổ giấy A4 (`window.print()`).
* **Tự động đồng bộ trạng thái**: Khi bác sĩ bấm "Hoàn Thành Ca Khám & Lưu Bệnh Án", backend tự động cập nhật `appointment.status = 'completed'` và `payment_status = 'paid'`.

---

### 5.5. Phân hệ AI Tư vấn Sàng lọc & Phân luồng Chuyên khoa (Clinical Triage CRM)
* **Tệp tri thức JSON CRM độc lập**:
  - Backend: `backend/src/main/resources/data/medical_specialty_crm_rules.json`
  - Frontend: `frontend/src/data/medicalSpecialtyDictionary.json`
  - Tách rời hoàn toàn tri thức y khoa ra khỏi mã nguồn nghiệp vụ, cho phép cập nhật từ khóa bệnh lý và câu hỏi sàng lọc mà không cần biên dịch lại hệ thống.
  - 5 chuyên khoa cốt lõi: Nội khoa (`INTERNAL_MED`), Tim mạch (`CARDIOLOGY`), Tai Mũi Họng (`ENT`), Da liễu (`DERMATOLOGY`), Nhi khoa (`PEDIATRICS`).
* **Động cơ phân tích lai (Hybrid Engine)**:
  - Khớp từ khóa triệu chứng và tính điểm tương đồng (`matchScore` 65% - 98%).
  - Tự động nhận diện các dấu hiệu nguy hiểm cấp cứu (co giật, liệt nửa người, đau ngực dữ dội...) để gắn nhãn `EMERGENCY` và hiển thị cảnh báo đỏ khẩn cấp.
  - Tích hợp mô hình AI LLM qua OpenRouter (Google Gemma / NVIDIA Nemotron 550B).
  - **Cơ chế Fallback thông minh (Zero-Downtime CRM Fallback)**: Khi mô hình AI trực tuyến bị nghẽn (429 Too Many Requests / Timeout) hoặc mất kết nối mạng, hệ thống tự động chuyển sang tri thức từ điển CRM JSON mà không bao giờ báo lỗi hệ thống.
* **Giao diện phản hồi 4 khối trực quan (`AssistantAI.jsx`)**:
  - 🩺 *Khối 1: AI Phân tích vấn đề*: Đánh giá lâm sàng nguyên nhân tiềm ẩn.
  - 🏥 *Khối 2: Đề xuất Chuyên khoa*: Huy hiệu khoa, điểm khớp triệu chứng, lý do chuyên môn và nút "Đặt khám khoa này".
  - 💡 *Khối 3: AI Đề xuất 3 hướng xử lý*: Hướng dẫn chăm sóc lối sống, theo dõi và khi nào cần khám trực tiếp.
  - ❓ *Khối 4: AI hỏi thêm để tư vấn chính xác*: Các nút chip câu hỏi sàng lọc tương tác 1-click.
  - 👨‍⚕️ *Khối 5: Bác sĩ tiêu biểu*: Thẻ bác sĩ thuộc chuyên khoa kèm nút đặt lịch tức thì.

---

### 5.6. Phân hệ Đánh giá & Chấm sao Bác sĩ thực tế (Doctor Review & Rating System)

> **Điểm đột phá giải quyết triệt để rủi ro phản biện đồ án**: Chuyển đổi 100% dữ liệu đánh giá từ dữ liệu tĩnh (mock data) thành **hệ thống đánh giá tương tác 2 chiều thời gian thực kết nối xuyên suốt từ Cơ sở dữ liệu MySQL -> Spring Boot REST API -> Giao diện React**.

#### 1. Quy chuẩn nghiệp vụ:
* **Đối tượng được đánh giá**: Người bệnh đã đăng nhập tài khoản bệnh nhân trên hệ thống.
* **Giới hạn quy tắc**: Mỗi bệnh nhân được đánh giá **tối đa 1 lần cho mỗi bác sĩ** (ràng buộc `UNIQUE (doctor_id, patient_id)`).
* **Quyền chỉnh sửa**: Bệnh nhân có quyền mở lại form để **chỉnh sửa mức sao và nội dung nhận xét của mình bất cứ lúc nào**. Khi chỉnh sửa, hệ thống tự động cập nhật đánh giá cũ (`updated_at`) thay vì tạo thêm dòng mới.
* **Tính toán điểm số tự động**: Điểm đánh giá trung bình (`averageRating`) và tổng số lượt đánh giá (`totalReviews`) của bác sĩ được tính toán động từ bảng `doctor_review` bằng câu lệnh SQL aggregate (`AVG`, `COUNT`), làm tròn 1 chữ số thập phân (VD: 4.8 / 5.0) và cập nhật ngay lập tức khi có đánh giá mới.

#### 2. Cơ sở dữ liệu (`doctor_review`):
```sql
CREATE TABLE IF NOT EXISTS `doctor_review` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `doctor_id` int(11) NOT NULL,
  `patient_id` int(11) NOT NULL,
  `appointment_id` int(11) DEFAULT NULL,
  `rating` int(11) NOT NULL DEFAULT 5,
  `comment` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_doctor_patient_review` (`doctor_id`, `patient_id`),
  CONSTRAINT `fk_review_doctor` FOREIGN KEY (`doctor_id`) REFERENCES `doctor` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_patient` FOREIGN KEY (`patient_id`) REFERENCES `patient` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_review_appointment` FOREIGN KEY (`appointment_id`) REFERENCES `appointment` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### 3. Backend Spring Boot REST API:
* **Tập tin thành phần**:
  - `DoctorReview.java`: Entity JPA ánh xạ bảng `doctor_review`.
  - `DoctorReviewDTO.java` & `DoctorReviewSummaryDTO.java`: DTO vận chuyển dữ liệu đánh giá và cơ cấu phân bố số sao (1 đến 5 sao).
  - `DoctorReviewRepository.java`: Truy vấn JPQL tính điểm trung bình `getAverageRatingByDoctorId` và số lượt `countReviewsByDoctorId`.
  - `DoctorReviewService.java`: Xử lý logic nghiệp vụ lưu mới hoặc cập nhật đánh giá (Upsert pattern).
  - `DoctorReviewController.java` (`/api/reviews`):
    - `POST /api/reviews`: Lưu hoặc chỉnh sửa đánh giá của bệnh nhân.
    - `GET /api/reviews/doctor/{doctorId}`: Trả về tóm tắt điểm trung bình, cơ cấu số sao và danh sách nhận xét của bác sĩ.
    - `GET /api/reviews/doctor/{doctorId}/patient/{patientId}`: Lấy đánh giá hiện có của bệnh nhân đó để điền sẵn vào form sửa.
    - `DELETE /api/reviews/{id}`: Xóa đánh giá.

#### 4. Frontend & Trải nghiệm người dùng (UX):
* **Hộp thoại Đánh giá Bác sĩ (`DoctorReviewModal.jsx`)**:
  - Hiển thị avatar, tên bác sĩ, chuyên khoa và mã ca khám.
  - Bộ chọn 5 sao tương tác (hover hiệu ứng sáng sao và click chọn) kèm nhãn cảm xúc trực quan (*Xuất sắc, Hài lòng, Bình thường, Chưa hài lòng, Rất thất vọng*).
  - Khung nhập nhận xét chi tiết với bộ đếm ký tự và kiểm tra hợp lệ.
  - Nút bấm thông minh: Hiển thị *"Gửi Đánh Giá Ngay"* khi tạo mới hoặc *"Cập Nhật Đánh Giá"* khi đang chỉnh sửa đánh giá cũ.
* **Tích hợp tại Trang Lịch Sử Khám (`BookingHistoryPage.jsx`)**:
  - Với mọi ca khám có trạng thái "Đã khám xong" (`completed`), hiển thị nút bấm màu vàng hổ phách: **⭐ Đánh giá**.
  - Bấm vào mở ngay `DoctorReviewModal` với thông tin bác sĩ và ca khám đã được điền sẵn.
* **Tích hợp tại Trang Chi Tiết Bác Sĩ (`DoctorDetailPage.jsx`)**:
  - Thẻ Hero Profile hiển thị điểm số thật và số lượt đánh giá thật lấy từ cơ sở dữ liệu.
  - Mục Đánh giá của bệnh nhân được nâng cấp:
    - Bảng thống kê điểm số trung bình lớn và thanh đo phần trăm phân bố tỷ lệ 5 sao, 4 sao, 3 sao, 2 sao, 1 sao.
    - Nếu bệnh nhân đã từng đánh giá bác sĩ này: Hiển thị khung nổi bật *"Đánh giá của bạn dành cho Bác sĩ"* và nút bấm **"Sửa Đánh Giá Của Bạn"**.
    - Nếu chưa đánh giá: Hiển thị nút bấm **"Viết Đánh Giá"** (yêu cầu đăng nhập nếu là khách vãng lai).
    - Danh sách toàn bộ nhận xét thực tế từ các bệnh nhân khác (avatar chữ cái đầu, tên, ngày đánh giá, số sao, nội dung).
    - **Cập nhật tức thì (Real-time Sync)**: Ngay khi bệnh nhân gửi đánh giá hoặc sửa xong, điểm trung bình và danh sách nhận xét trên trang tự động tải lại mà không cần tải lại toàn bộ trang web.

---

### 5.7. Hệ thống Thông báo Y tế Toast Notification & Confirm Modal chuẩn Hospital Grade
* **Thay thế 100% các hàm popup thô sơ**: Loại bỏ hoàn toàn `alert()` và `window.confirm()` mặc định của trình duyệt.
* **Kiến trúc quản lý tập trung**: Bao bọc bởi `ToastContext.jsx` và hiển thị qua `ToastContainer.jsx`.
* **4 phân loại chuẩn y tế**: Thành công (Emerald-500), Báo lỗi (Rose-500), Cảnh báo (Amber-500), Hướng dẫn y tế (Sky-500).
* **Đồng bộ hóa toàn bộ ứng dụng**: Đăng nhập, đăng ký, đăng xuất, đặt lịch thành công, dời lịch, hủy lịch hẹn, lưu bệnh án và lưu đánh giá bác sĩ.

---

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU MYSQL CHUẨN HÓA (11 BẢNG)

```
                            SƠ ĐỒ QUAN HỆ CƠ SỞ DỮ LIỆU (ERD)

     ┌──────────────┐             ┌──────────────┐             ┌─────────────────────┐
     │   SPECIALTY  │◄────────────┤    DOCTOR    │◄────────────┤ DOCTOR_AVAILABILITY │
     └──────────────┘             └──────┬───────┘             └──────────┬──────────┘
                                         │                                │
                                         │                                ▼
                                         │                     ┌─────────────────────┐
                                         ├────────────────────►│    BOOKABLE_SLOT    │
                                         │                     └──────────┬──────────┘
                                         ▼                                │
     ┌──────────────┐             ┌──────────────┐                        │
     │   PATIENT    │◄────────────┤  APPOINTMENT │◄───────────────────────┘
     └──────┬───────┘             └──────┬───────┘
            │                            │
            │      ┌─────────────────────┼─────────────────────┐
            │      ▼                     ▼                     ▼
            │ ┌──────────────┐  ┌───────────────────┐  ┌───────────────┐
            └►│DOCTOR_REVIEW │  │  MEDICAL_RECORD   │  │ NOTIFICATION  │
              └──────────────┘  └───────────────────┘  └───────────────┘
```

| STT | Tên bảng (Table Name) | Khóa chính | Khóa ngoại chính | Mục đích lưu trữ nghiệp vụ |
|:---:|:---|:---|:---|:---|
| 1 | `specialty` | `id` | Không | Danh mục các chuyên khoa y tế (Nội khoa, Tim mạch, Tai Mũi Họng, Da liễu, Nhi khoa...). |
| 2 | `doctor` | `id` | `specialty_id` | Hồ sơ bác sĩ, tài khoản đăng nhập, mật khẩu BCrypt, số năm kinh nghiệm, giá khám, tọa độ phòng khám (lat, lng). |
| 3 | `doctor_availability` | `id` | `doctor_id` | Lịch trực theo các thứ trong tuần của bác sĩ (Thứ Hai đến Chủ Nhật), giờ bắt đầu, giờ kết thúc, thời lượng slot. |
| 4 | `bookable_slot` | `id` | `doctor_id`, `availability_id` | Các khung giờ khám cụ thể theo từng ngày (`available`, `booked`, `off`), ràng buộc chống đặt trùng slot. |
| 5 | `patient` | `id` | Không | Hồ sơ bệnh nhân, tài khoản đăng nhập, mật khẩu BCrypt, số điện thoại, địa chỉ cư trú. |
| 6 | `appointment` | `id` | `patient_id`, `bookable_slot_id` | Đơn đặt lịch khám (`pending`, `confirmed`, `completed`, `cancelled`), lý do khám, viện phí, trạng thái thanh toán VNPay. |
| 7 | `medical_record` | `id` | `appointment_id`, `patient_id`, `doctor_id` | **Hồ sơ bệnh án điện tử EHR**: Sinh hiệu (Huyết áp, Mạch, Nhiệt độ, BMI), chẩn đoán, toa thuốc JSON, hẹn tái khám. |
| 8 | `doctor_review` | `id` | `doctor_id`, `patient_id`, `appointment_id` | **Đánh giá bác sĩ thực tế**: Chấm điểm rating (1 - 5 sao), nhận xét chi tiết, ràng buộc 1 đánh giá / 1 bác sĩ / 1 bệnh nhân. |
| 9 | `notification` | `id` | `doctor_id`, `patient_id` | Thông báo chuông thời gian thực khi có lịch hẹn mới, dời lịch, hủy hẹn. |
| 10 | `ai_symptom_analysis` | `id` | `patient_id`, `suggested_specialty_id` | Lưu vết lịch sử các phiên người bệnh trò chuyện sàng lọc triệu chứng với AI. |
| 11 | `ai_appointment_summary` | `id` | `appointment_id` | Bản tóm tắt y khoa tự động do AI trích xuất từ diễn biến ca khám. |

---

## 7. DANH MỤC RESTFUL API ENDPOINTS TOÀN DIỆN

### 7.1. Phân hệ Xác thực & Người dùng (Authentication)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/patient/login` | Đăng nhập tài khoản Bệnh nhân | Public |
| `POST` | `/api/patient/register` | Đăng ký tài khoản Bệnh nhân mới | Public |
| `POST` | `/api/patient/forgot_password` | Gửi mã OTP khôi phục mật khẩu qua Email | Public |
| `POST` | `/api/patient/reset_password` | Đặt lại mật khẩu mới với Token OTP | Public |
| `POST` | `/api/doctor/login` | Đăng nhập tài khoản Bác sĩ | Public |
| `POST` | `/api/doctor/google-login` | Đăng nhập Bác sĩ bằng Google ID Token | Public |
| `POST` | `/api/doctor/change_password` | Đổi mật khẩu Bác sĩ | Doctor |

### 7.2. Phân hệ Bác sĩ & Lịch làm việc (Doctor & Schedule)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/doctor/all` | Lấy danh sách toàn bộ bác sĩ kèm điểm rating và số lượt review thật | Public |
| `GET` | `/api/doctor/{id}` | Lấy chi tiết hồ sơ bác sĩ kèm điểm trung bình sao và lượt review | Public |
| `PUT` | `/api/doctor/update/{id}` | Bác sĩ cập nhật hồ sơ cá nhân và phòng khám | Doctor |
| `GET` | `/api/availability/schedule` | Lấy lịch làm việc tuần của bác sĩ | Doctor / Patient |
| `POST` | `/api/availability/update` | Bác sĩ cập nhật ca trực tuần | Doctor |
| `GET` | `/api/availability/summary` | Lấy báo cáo định mức số giờ và số ngày trực tuần | Doctor |
| `POST` | `/api/availability/init-default` | Khôi phục bộ lịch làm việc chuẩn (35h/tuần) | Doctor |
| `GET` | `/api/bookable_slots/doctor/{id}/slots` | Lấy danh sách các khung giờ khám trống theo ngày | Public |

### 7.3. Phân hệ Đặt lịch & Thanh toán (Appointment & Payment)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/appointment/save` | Đặt lịch khám mới (Async Kafka gửi email ngầm, hỗ trợ VNPay) | Patient |
| `GET` | `/api/appointment/doctor/{doctorId}` | Lấy danh sách lịch hẹn của bác sĩ | Doctor |
| `GET` | `/api/appointment/patient/{patientId}` | Lấy lịch sử hẹn khám của bệnh nhân | Patient |
| `PUT` | `/api/appointment/reschedule/{id}` | Bệnh nhân dời lịch khám sang ngày và giờ mới | Patient |
| `PUT` | `/api/appointment/status/{id}` | Bác sĩ cập nhật trạng thái ca khám (`confirmed`, `completed`...) | Doctor |
| `GET` | `/api/appointment/payment/result` | Callback xử lý kết quả giao dịch thanh toán từ VNPay | Public |

### 7.4. Phân hệ Hồ sơ bệnh án & Toa thuốc điện tử (EHR)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/medical-record` | Bác sĩ lưu hồ sơ bệnh án, sinh hiệu, chẩn đoán, toa thuốc JSON | Doctor |
| `GET` | `/api/medical-record/appointment/{appointmentId}` | Lấy hồ sơ bệnh án theo mã ca khám | Doctor / Patient |
| `GET` | `/api/medical-record/patient/{patientId}` | Lấy toàn bộ lịch sử bệnh án của bệnh nhân qua các lần khám | Doctor / Patient |
| `GET` | `/api/medical-record/doctor/{doctorId}` | Lấy danh sách các ca bệnh án do bác sĩ phụ trách | Doctor |

### 7.5. Phân hệ Đánh giá Bác sĩ (Doctor Review & Rating)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/reviews` | Bệnh nhân gửi đánh giá mới hoặc chỉnh sửa đánh giá cũ (Upsert) | Patient |
| `GET` | `/api/reviews/doctor/{doctorId}` | Lấy điểm trung bình, cơ cấu phân bố 1-5 sao và danh sách nhận xét | Public |
| `GET` | `/api/reviews/doctor/{doctorId}/patient/{patientId}` | Kiểm tra và lấy đánh giá hiện có của bệnh nhân đối với bác sĩ | Patient |
| `DELETE` | `/api/reviews/{id}` | Xóa đánh giá | Patient / Admin |

### 7.6. Phân hệ Quản trị viên phòng khám (Clinic Admin)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/doctor/create` | Cấp tài khoản bác sĩ mới, băm BCrypt, tự cấp lịch 35h/tuần | Admin |
| `POST` | `/api/upload/image` | Tải ảnh đại diện bác sĩ từ thiết bị máy tính lên server | Admin |
| `PUT` | `/api/doctor/admin/{id}` | Cập nhật thông tin bác sĩ & điều chuyển chuyên khoa | Admin |
| `PUT` | `/api/doctor/admin/{id}/reset-password` | Admin cấp lại mật khẩu mới cho bác sĩ | Admin |
| `DELETE` | `/api/doctor/{id}` | Xóa hồ sơ bác sĩ (có kiểm tra ràng buộc toàn vẹn) | Admin |
| `GET` | `/api/appointment/all` | Lấy toàn bộ lịch hẹn của mọi khoa phục vụ Admin Dashboard | Admin |
| `PUT` | `/api/appointment/admin/{id}/status` | Admin trực tiếp đổi trạng thái lịch hẹn | Admin |
| `GET` | `/api/patient/all` | Lấy danh bạ toàn bộ bệnh nhân đã đăng ký | Admin |
| `DELETE` | `/api/patient/admin/{id}` | Xóa hồ sơ bệnh nhân khỏi hệ thống | Admin |
| `GET` | `/api/specialty/all` | Lấy danh mục toàn bộ chuyên khoa y tế | Public / Admin |

### 7.7. Trí tuệ Nhân tạo & Báo cáo PDF
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/ai/triage-consult` | AI phân tích triệu chứng, gợi ý khoa, 3 hướng xử lý & câu hỏi | Public |
| `GET` | `/api/ai/crm-rules` | Trích xuất toàn bộ từ điển CRM tri thức y khoa JSON | Public |
| `POST` | `/api/ai/suggest-doctors` | Gợi ý bác sĩ phù hợp kèm tính khoảng cách km | Public |
| `GET` | `/api/report/appointment/{id}` | Xuất file PDF phiếu khám bệnh chính thức (JasperReports) | Doctor / Patient |

---

## 8. HẠ TẦNG TÍCH HỢP DỊCH VỤ BÊN THỨ BA

1. **Cổng thanh toán trực tuyến VNPay Sandbox**: Xử lý giao dịch thanh toán viện phí trực tuyến an toàn với thuật toán băm mã hóa SHA-512, tự động kiểm tra chữ ký số toàn vẹn và cập nhật trạng thái thanh toán tự động qua URL trả về.
2. **Nền tảng bản đồ số VietMap GIS Platform**: Cung cấp bản đồ số tương tác và dịch vụ Geocoding chuẩn xác theo địa giới hành chính Việt Nam, hỗ trợ tính toán khoảng cách số km từ vị trí người dùng đến phòng khám.
3. **JasperReports Engine**: Biên dịch template `appointment_detail.jrxml` sang tài liệu PDF hỗ trợ tiếng Việt có dấu chuẩn phông chữ `DejaVu Sans`.
4. **Apache Kafka Message Broker**: Kiến trúc hướng sự kiện xử lý tác vụ gửi email thông báo ngầm qua tiến trình bất đồng bộ (`CompletableFuture.runAsync`), bảo đảm không bao giờ làm nghẽn tiến trình xử lý HTTP của API đặt lịch.
5. **Google Identity Service (OAuth 2.0)**: Đăng nhập một chạm tiện lợi, an toàn và bảo mật cho bác sĩ và bệnh nhân.
6. **Gmail SMTP Server**: Gửi email tự động thông báo xác nhận lịch hẹn và mã token khôi phục mật khẩu.

---

## 9. HƯỚNG DẪN CÀI ĐẶT, CẤU HÌNH & KHỞI CHẠY HỆ THỐNG

### 9.1. Yêu cầu môi trường
* **Java Development Kit (JDK)**: Phiên bản 21 trở lên.
* **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node.js 20 hoặc 22 LTS).
* **Cơ sở dữ liệu**: MySQL 8.0 (cổng mặc định 3306).

### 9.2. Cấu hình Cơ sở dữ liệu MySQL
1. Khởi động MySQL Server trên máy tính.
2. Tạo database mới và nạp toàn bộ cấu trúc 11 bảng cùng dữ liệu mẫu:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dat_lich_kham_benh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p dat_lich_kham_benh < database/dat_lich_kham_benh.sql
   ```

### 9.3. Khởi chạy Backend (Spring Boot API)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Cấu hình kết nối MySQL và OpenRouter API Key trong file `.env` hoặc `application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/dat_lich_kham_benh?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_password
   ```
3. Khởi chạy máy chủ backend:
   ```bash
   ./mvnw spring-boot:run
   ```
   * Cổng API Backend: `http://localhost:8080`
   * Tài liệu Swagger OpenAPI: `http://localhost:8080/swagger-ui/index.html`

### 9.4. Khởi chạy Frontend (React Vite)
1. Mở cửa sổ dòng lệnh mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   * Cổng giao diện người dùng: `http://localhost:5173`
   * Cổng Quản trị Admin: `http://localhost:5173/admin/dashboard`
   * Cổng Bác sĩ (Doctor Portal): `http://localhost:5173/doctor/login`
   * Tài khoản mẫu Bác sĩ: `bs.a@example.com` / `password123`

---

## 10. KẾT LUẬN & GIÁ TRỊ THỰC TIỄN CỦA DỰ ÁN

Dự án **Klinik (MediCare)** đã hoàn thành toàn diện và xuất sắc tất cả các mục tiêu đề ra cho một đồ án chuyên ngành Công nghệ thông tin / Kỹ nghệ phần mềm:
* **Tính toàn diện & Liền mạch**: Bao phủ trọn vẹn 3 phân hệ độc lập (Bệnh nhân, Bác sĩ, Quản trị viên) với 4 vai trò người dùng được phân quyền chặt chẽ. Toàn bộ vòng đời khám chữa bệnh từ khâu tư vấn triệu chứng AI, đặt lịch slot 7 ngày, thanh toán VNPay, bác sĩ khám 4 bước, lưu hồ sơ bệnh án EHR cho đến đánh giá và chấm sao bác sĩ đều diễn ra thông suốt 100% bằng dữ liệu thật trong cơ sở dữ liệu.
* **Tính hiện đại về công nghệ**: Ứng dụng các công nghệ tiên tiến nhất hiện nay gồm React 19, Spring Boot 3.3.0, Kiến trúc Clean Architecture, Trí tuệ nhân tạo tăng cường tri thức y khoa RAG + CRM Fallback Zero-downtime, Message Queue Kafka bất đồng bộ và Bản đồ số GIS VietMap.
* **Độ ổn định, bảo mật & Sẵn sàng bảo vệ**: Toàn bộ các API được bảo vệ với kiểm tra ràng buộc toàn vẹn dữ liệu, mật khẩu băm một chiều an toàn bằng thuật toán `BCrypt`, giao diện chuẩn Hospital Grade loại bỏ hoàn toàn các lỗi popup thô sơ, sẵn sàng tự tin trình chiếu và trả lời thuyết phục mọi câu hỏi chất vấn từ hội đồng đánh giá.

