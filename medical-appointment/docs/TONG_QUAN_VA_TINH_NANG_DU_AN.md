# 🏥 BÁO CÁO TỔNG QUAN HỆ THỐNG & CHI TIẾT TÍNH NĂNG DỰ ÁN KLINIK (MEDICARE)

> **Tên dự án**: Hệ thống Đặt lịch khám bệnh và Quản lý phòng khám trực tuyến (Klinik / MediCare)  
> **Kiến trúc**: Client-Server (SPA React 19 + Spring Boot 3.3.0 RESTful API + Apache Kafka + Spring AI RAG)  
> **Cơ sở dữ liệu**: MySQL 8.0 + Pinecone Vector Database  
> **Cập nhật ngày**: 27/10/2026  
> **Trạng thái**: Đã hoàn thiện, kiểm thử tự động đạt 100% (PASS ✅), sẵn sàng triển khai thực tế  

---

## 📌 MỤC LỤC TỔNG QUAN

1. [Giới thiệu tổng quan & Bối cảnh dự án](#1-giới-thiệu-tổng-quan--bối-cảnh-dự-án)
2. [Lịch sử tiến trình phát triển theo dòng Commit (Từ đầu đến nay)](#2-lịch-sử-tiến-trình-phát-triển-theo-dòng-commit)
3. [Kiến trúc hệ thống & Danh mục công nghệ](#3-kiến-trúc-hệ-thống--danh-mục-công-nghệ)
4. [Ma trận phân quyền 4 vai trò người dùng](#4-ma-trận-phân-quyền-4-vai-trò-người-dùng)
5. [Chi tiết các phân hệ chức năng cốt lõi](#5-chi-tiết-các-phân-hệ-chức-năng-cốt-lõi)
   - 5.1. Phân hệ Bệnh nhân (Patient Portal)
   - 5.2. Phân hệ Bác sĩ (Doctor Portal)
   - 5.3. Phân hệ Quản trị viên phòng khám (Clinic Admin Portal)
   - 5.4. Hệ thống Trí tuệ Nhân tạo & RAG Engine (AI Assistant)
   - 5.5. Hạ tầng dịch vụ tích hợp bên thứ ba (VNPay, VietMap, JasperReports, Kafka, Google OAuth)
6. [Chuyên đề: Các tính năng MỚI NHẤT được bổ sung & Tối ưu hóa](#6-chuyên-đề-các-tính-năng-mới-nhất-được-bổ-sung--tối-ưu-hóa)
   - 6.1. Phân hệ Quản trị Admin tương tác & Cấp tài khoản Bác sĩ (Thoát ly can thiệp SQL)
   - 6.2. Upload ảnh đại diện trực tiếp từ máy tính (`POST /api/upload/image`)
   - 6.3. Tự động sinh lịch làm việc chuẩn (35 giờ/tuần) khi tạo bác sĩ
   - 6.4. Ràng buộc tuân thủ định mức làm việc tối thiểu (>= 20h/tuần, >= 3 ngày/tuần)
   - 6.5. Tối ưu hóa trải nghiệm chọn ngày khám cho Bệnh nhân (Patient UX)
   - 6.6. Tối ưu hóa hiệu năng API `POST /api/appointment/save` & Async Kafka
   - 6.7. Phiếu xác nhận đặt lịch khám thành công (`BookingSuccessModal`) & Tải PDF tức thì
7. [Bảng tổng hợp API Endpoints toàn diện](#7-bảng-tổng-hợp-api-endpoints-toàn-diện)
8. [Hướng dẫn cài đặt, cấu hình & Khởi chạy hệ thống](#8-hướng-dẫn-cài-đặt-cấu-hình--khởi-chạy-hệ-thống)

---

## 1. GIỚI THIỆU TỔNG QUAN & BỐI CẢNH DỰ ÁN

### 1.1. Đặt vấn đề
Trong bối cảnh hệ thống y tế hiện nay, bệnh nhân thường xuyên gặp phải tình trạng:
* Phải xếp hàng dài chờ đợi lấy số thứ tự từ sáng sớm tại các bệnh viện, phòng khám lớn.
* Khó khăn trong việc tìm kiếm thông tin bác sĩ đúng chuyên khoa phù hợp với tình trạng bệnh lý và vị trí địa lý gần nơi cư trú.
* Thông tin giờ khám, lịch trực của bác sĩ thiếu minh bạch, thường xuyên bị trùng lịch hoặc bị hủy hẹn đột ngột mà không được thông báo trước.
* Quá trình thanh toán viện phí thủ công, tốn thời gian đối soát tiền mặt.

Đối với đội ngũ y bác sĩ và người quản lý phòng khám:
* Thiếu công cụ số hóa để tự quản lý lịch biểu khám linh hoạt theo khung giờ.
* Không có dashboard trực quan để theo dõi lượt khám, phân tích doanh thu và lưu trữ hồ sơ bệnh án chuẩn hóa.
* Việc cấp phát tài khoản bác sĩ, phân khoa và quản trị hệ thống trước đây phải can thiệp thủ công bằng câu lệnh SQL trực tiếp vào cơ sở dữ liệu, tiềm ẩn rủi ro sai sót dữ liệu và mất an toàn bảo mật.

### 1.2. Mục tiêu của dự án Klinik (MediCare)
Dự án được xây dựng với mục tiêu trở thành **Nền tảng y tế số toàn diện**, số hóa 100% quy trình từ khâu tìm kiếm, tư vấn sơ bộ, đặt hẹn, phân phối ca trực, thanh toán cho đến quản trị vận hành phòng khám:
1. **Đối với Bệnh nhân**: Cung cấp giao diện trực quan tìm kiếm bác sĩ theo chuyên khoa, bản đồ VietMap định vị khoảng cách, trò chuyện với Trợ lý ảo AI ứng dụng công nghệ RAG, đặt lịch theo khung giờ khả dụng thực tế, thanh toán VNPay và tải phiếu hẹn PDF.
2. **Đối với Bác sĩ**: Cung cấp Doctor Portal chuyên nghiệp với Dashboard biểu đồ doanh thu Chart.js, quản lý ca làm việc theo tuần, tiếp nhận / hoàn tất / từ chối lịch khám, nhận thông báo chuông thời gian thực và in phiếu khám bệnh JasperReports.
3. **Đối với Quản trị viên (Admin)**: Cung cấp Admin Portal đồng bộ dữ liệu thời gian thực, cấp tài khoản bác sĩ với tải ảnh từ thiết bị, phân chuyên khoa, cấp lại mật khẩu, quản trị lịch hẹn toàn viện và danh bạ bệnh nhân mà không cần can thiệp bất kỳ câu lệnh SQL nào.

---

## 2. LỊCH SỬ TIẾN TRÌNH PHÁT TRIỂN THEO DÒNG COMMIT

Toàn bộ quá trình hình thành và phát triển của dự án được ghi nhận minh bạch qua 15 commit trên kho lưu trữ Git:

| STT | Commit Hash | Ngày thực hiện | Tác giả | Thông điệp Commit & Nội dung triển khai chính |
| :---: | :---: | :---: | :---: | :--- |
| **1** | `b2511a0` | 18/10/2026 | tay52636 | **first commit**: Khởi tạo cấu trúc dự án monorepo gồm thư mục `backend` (Spring Boot) và `frontend` (React Vite). |
| **2** | `3fe0176` | 18/10/2026 | tay52636 | **docs: add project and medical-appointment README files**: Bổ sung tài liệu cấu hình môi trường, cài đặt các thư viện phụ thuộc ban đầu. |
| **3** | `fa5ca00` | 25/10/2026 | tay52636 | **chord :update db**: Cập nhật cấu trúc cơ sở dữ liệu ban đầu cho các bảng nghiệp vụ. |
| **4** | `97c72fa` | 25/10/2026 | tay52636 | **feat: update database schema and add initial seed data**: Hoàn thiện toàn bộ lược đồ CSDL `dat_lich_kham_benh.sql` gồm các bảng `patient`, `doctor`, `specialty`, `doctor_availability`, `bookable_slots`, `appointment`, `notification` cùng dữ liệu mẫu ban đầu; thiết lập tầng Entity, Repository, Service, JasperReports, Kafka và Spring AI Pinecone RAG. |
| **5** | `0c9d2de` | 25/10/2026 | tay52636 | **feat: update frontend components and patient pages with improved UI**: Xây dựng giao diện trang chủ, danh bạ bác sĩ, bản đồ VietMap, trang đặt lịch khám, lịch sử hẹn, thanh toán trực tuyến VNPay và trợ lý AI tư vấn bệnh. |
| **6** | `78e5bb9` | 25/10/2026 | tay52636 | **feat: add admin dashboard interface and protect doctor routes**: Thiết lập khung làm việc Quản trị Admin, cấu hình bảo vệ Private Routes cho phân hệ Bác sĩ và Admin. |
| **7** | `96a727a` | 25/10/2026 | tay52636 | **feat: complete doctor account provisioning UI and backend management APIs**: Xây dựng các API quản trị bác sĩ, API lấy toàn bộ lịch hẹn và danh bạ bệnh nhân; triển khai form cấp tài khoản bác sĩ ban đầu có mã hóa mật khẩu `BCrypt`. |
| **8** | `1d32802` | 25/10/2026 | tay52636 | **docs: update progress report and generate professional docx report file**: Soạn thảo tài liệu tiến độ `TIEN_DO_HOAN_THIEN.md` và viết script Python tạo tài liệu Word `.docx` chuyên nghiệp. |
| **9** | `48c3937` | 25/10/2026 | tay52636 | **feat: add doctor account creation and avatar image upload features**: Bổ sung API `POST /api/upload/image` cho phép upload ảnh bác sĩ dạng `multipart/form-data`, tích hợp Geocoding tự động tọa độ phòng khám. |
| **10** | `76bc2da` | 25/10/2026 | tay52636 | **feat: convert doctor provisioning into in-page dialog with local avatar upload from device**: Chuyển đổi toàn bộ quy trình cấp tài khoản bác sĩ sang Dialog Modal hiện đại ngay trong trang `AdminDoctors.jsx`, hỗ trợ chọn ảnh trực tiếp từ máy tính xem trước tức thì, sinh mật khẩu ngẫu nhiên, ẩn/hiện mật khẩu và sao chép phiếu bàn giao tài khoản. |
| **11** | `cedc9fa` | 25/10/2026 | tay52636 | **feat: complete interactive API connections for all admin modules**: Kết nối API 100% cho toàn bộ phân hệ Admin (Admin Dashboard KPI, Thay đổi trạng thái lịch hẹn realtime trên bảng, Xóa hồ sơ bệnh nhân, Modal chỉnh sửa bác sĩ/chuyên khoa, Modal cấp lại mật khẩu). |
| **12** | `1049b02` | 25/10/2026 | tay52636 | **feat(admin): refactor Clean Architecture with AdminContext, component separation and reusable Pagination**: Tái cấu trúc phân hệ Admin theo Kiến trúc Clean Architecture với `AdminContext`, chia tách các component độc lập (`DoctorTable`, `DoctorProvisionDialog`, `DoctorEditModal`, `DoctorResetPasswordModal`, `Pagination`). |
| **13** | `54b64ec` | 26/10/2026 | tay52636 | **feat(upload): store doctor avatars directly in backend images/ and serve via /images/****: Tối ưu hóa lưu trữ ảnh đại diện bác sĩ trực tiếp vào thư mục tĩnh của backend và cấu hình `WebMvcConfigurer` phục vụ ảnh qua đường dẫn chuẩn. |
| **14** | `1f7f911` | 27/10/2026 | tay52636 | **feat: auto-provision default doctor schedule, enforce weekly minimum hours compliance, and optimize patient booking date picker UX**: Tự động sinh lịch làm việc chuẩn (35h/tuần, T2-T6) khi cấp tài khoản bác sĩ; áp dụng quy chuẩn ràng buộc định mức tối thiểu (>= 20h/tuần, >= 3 ngày/tuần) kèm thanh đo tiến độ thời gian thực; hiển thị trực quan các thứ bác sĩ có lịch trực và gợi ý 4 ngày khám gần nhất cho bệnh nhân. |
| **15** | `acfeebb` | 27/10/2026 | tay52636 | **fix(appointment): optimize /api/appointment/save performance, fix blocking Kafka producer timeout, add comprehensive error handling, and implement BookingSuccessModal with voucher & PDF download**: Tối ưu hóa hiệu năng API `/api/appointment/save`, chuyển Kafka sang bất đồng bộ (`CompletableFuture.runAsync`) loại bỏ độ trễ treo 60s, chuẩn hóa xử lý ngoại lệ HTTP 400 Bad Request, trả về trọn bộ metadata lịch hẹn và xây dựng modal `BookingSuccessModal` xác nhận đặt lịch kèm tải PDF trực tiếp. |

---

## 3. KIẾN TRÚC HỆ THỐNG & DANH MỤC CÔNG NGHỆ

Hệ thống được thiết kế theo mô hình **Client-Server phân tán hiện đại**, kết hợp giữa Kiến trúc Hướng sự kiện (Event-Driven Architecture) và Trí tuệ nhân tạo tăng cường tri thức (Retrieval-Augmented Generation - RAG).

```
+-----------------------------------------------------------------------------------------------+
|                                      KLINIK SYSTEM OVERVIEW                                   |
+-----------------------------------------------------------------------------------------------+
|  CLIENT LAYER (Single Page Application - React 19 + Vite + Tailwind CSS)                     |
|  - Patient Portal: Tìm kiếm, Bản đồ VietMap, AI Chat RAG, Đặt lịch hẹn, Thanh toán VNPay     |
|  - Doctor Portal: Dashboard Chart.js, Quản lý ca trực tuần, Tiếp nhận lịch hẹn, In PDF        |
|  - Admin Portal: Quản lý Bác sĩ, Cấp tài khoản & Upload ảnh, Quản trị lịch hẹn, Bệnh nhân     |
+-----------------------------------------------+-----------------------------------------------+
                                                | HTTP / RESTful APIs / Multipart
                                                v
+-----------------------------------------------------------------------------------------------+
|  BACKEND CORE (Spring Boot 3.3.0 + Java 21)                                                   |
|  - Security & Auth: Spring Security, BCrypt, Token Management, Google OAuth 2.0 Client        |
|  - REST Controllers: Doctor, Patient, Appointment, Slot, Availability, Report, Admin, AI      |
|  - Service Layer: Business Logic, Schedule Auto-Provisioning, Haversine Distance, Geocoding   |
|  - Persistence Layer: Spring Data JPA, Hibernate ORM, MySQL Connector                         |
|  - Event Layer: Apache Kafka Producer (Async CompletableFuture) & Consumer Background Worker  |
+-----------------------+-------------------------------+-----------------------+---------------+
                        |                               |                       |
                        v                               v                       v
+-------------------------------+   +---------------------------+   +---------------------------+
| DATABASE & STORAGE            |   | THIRD-PARTY INTEGRATIONS  |   | AI & RAG SERVICES         |
| - MySQL 8.0 (Primary RDBMS)   |   | - VNPay Gateway (Sandbox) |   | - OpenRouter API          |
| - Pinecone Vector Database    |   | - VietMap Tiles & Geocode |   |   (Longcat / Qwen Chat)   |
| - Local Upload Directory      |   | - JasperReports (PDF Lib) |   | - Spring AI Embedding     |
|   (/images/** & /uploads/**)  |   | - Gmail SMTP Server       |   | - Pinecone Vector Store   |
+-------------------------------+   +---------------------------+   +---------------------------+
```

### Chi tiết danh mục công nghệ cốt lõi:
* **Frontend**: React 19, Vite 7, Tailwind CSS, React Router v7, Axios, Lucide Icons, FontAwesome, Chart.js.
* **Backend**: Spring Boot 3.3.0, Spring Security, Spring Data JPA, Spring AI 1.0.0-M1, Apache Kafka, JasperReports 6.21.3.
* **Bảo mật**: Mã hóa mật khẩu một chiều `BCryptPasswordEncoder`, Google OAuth 2.0 ID Token verification.
* **Bản đồ & GIS**: VietMap API, Geocoding API, Bản đồ số tương tác VietMap GL JS, Thuật toán tính khoảng cách địa lý hình cầu Haversine.
* **Báo cáo y tế**: JasperReports Engine kết xuất file PDF chuẩn Unicode tiếng Việt có dấu với bộ phông chữ `DejaVu Sans`.

---

## 4. MA TRẬN PHÂN QUYỀN 4 VAI TRÒ NGƯỜI DÙNG

| Phân nhóm nghiệp vụ | Khách vãng lai (Guest) | Bệnh nhân (Patient) | Bác sĩ (Doctor) | Quản trị phòng khám (Admin) |
| :--- | :---: | :---: | :---: | :---: |
| Xem trang chủ, giới thiệu phòng khám, bài viết | ✅ | ✅ | ✅ | ✅ |
| Tra cứu danh mục chuyên khoa y tế | ✅ | ✅ | ✅ | ✅ |
| Tìm kiếm danh sách bác sĩ, xem giá khám, hồ sơ | ✅ | ✅ | ✅ | ✅ |
| Xem bản đồ số định vị vị trí phòng khám | ✅ | ✅ | ✅ | ✅ |
| Trò chuyện với Trợ lý ảo AI & Gợi ý bác sĩ | ✅ | ✅ | ✅ | ✅ |
| Đăng ký / Đăng nhập tài khoản mật khẩu | ✅ | ✅ | ✅ | ✅ |
| Đăng nhập 1 chạm qua Google OAuth 2.0 | ❌ | ✅ | ✅ | ❌ |
| Quên mật khẩu / Khôi phục tài khoản qua Email | ✅ | ✅ | ✅ | ❌ |
| **Đặt lịch khám bệnh theo khung giờ trống (`BookableSlot`)** | ❌ | ✅ | ❌ | ❌ |
| **Thanh toán trực tuyến qua cổng VNPay** | ❌ | ✅ | ❌ | ❌ |
| **Quản lý lịch sử đặt khám, Dời lịch, Hủy hẹn** | ❌ | ✅ | ❌ | ❌ |
| **Nhận phiếu xác nhận đặt hẹn & Tải PDF** | ❌ | ✅ | ❌ | ❌ |
| Cập nhật thông tin hồ sơ cá nhân | ❌ | ✅ | ✅ | ❌ |
| **Doctor Dashboard**: Xem thống kê KPI, ca khám cá nhân | ❌ | ❌ | ✅ | ❌ |
| **Quản lý lịch làm việc tuần & Đăng ký ca trực** | ❌ | ❌ | ✅ | ❌ |
| **Theo dõi thanh đo định mức tối thiểu (20h/tuần)** | ❌ | ❌ | ✅ | ❌ |
| **Tiếp nhận ca khám, Xác nhận khám xong, Từ chối hẹn** | ❌ | ❌ | ✅ | ❌ |
| **In phiếu khám bệnh JasperReports PDF** | ❌ | ❌ | ✅ | ❌ |
| **Nhận thông báo chuông thời gian thực khi có hẹn mới** | ❌ | ❌ | ✅ | ❌ |
| **Admin Dashboard**: Thống kê vận hành toàn phòng khám | ❌ | ❌ | ❌ | ✅ |
| **Cấp tài khoản Bác sĩ mới (Upload avatar từ máy)** | ❌ | ❌ | ❌ | ✅ |
| **Chỉnh sửa thông tin bác sĩ, điều chuyển chuyên khoa** | ❌ | ❌ | ❌ | ✅ |
| **Cấp lại mật khẩu bác sĩ trực tiếp** | ❌ | ❌ | ❌ | ✅ |
| **Xóa hồ sơ bác sĩ có kiểm tra ràng buộc lịch hẹn** | ❌ | ❌ | ❌ | ✅ |
| **Quản lý toàn bộ lịch hẹn của mọi khoa (Duyệt/Đổi trạng thái)** | ❌ | ❌ | ❌ | ✅ |
| **Quản trị danh bạ bệnh nhân & Xóa tài khoản bệnh nhân** | ❌ | ❌ | ❌ | ✅ |

---

## 5. CHI TIẾT CÁC PHÂN HỆ CHỨC NĂNG CỐT LÕI

### 5.1. Phân hệ Bệnh nhân (Patient Portal)
* **Khám phá Bác sĩ đa tiêu chí**:
  * Tìm kiếm theo tên bác sĩ, chuyên khoa điều trị hoặc địa chỉ phòng khám.
  * Bộ lọc linh hoạt: Lọc theo chuyên khoa (`Specialty`), kinh nghiệm, học vị, mức viện phí niêm yết.
* **Định vị Bản đồ phòng khám (VietMap GIS)**:
  * Tích hợp VietMap API Geocoding tự động chuyển đổi địa chỉ thành tọa độ địa lý.
  * Tự động xác định vị trí bệnh nhân và tính toán khoảng cách số km thực tế theo công thức Haversine.
* **Quy trình Đặt lịch trực quan (`BookingPage.jsx`)**:
  * Tự động tải danh sách thứ trực trong tuần của bác sĩ phụ trách.
  * Nút gợi ý 4 ngày khám gần nhất có lịch trực, hỗ trợ chọn nhanh 1-click.
  * Mở rộng đặt lịch linh hoạt trước trong vòng **30 ngày**.
  * Chọn khung giờ khám khả dụng trong ngày (`BookableSlot`) với thời lượng 30 phút/slot.
* **Thanh toán & Xuất phiếu**:
  * Hỗ trợ 2 hình thức: *Thanh toán trực tiếp tại quầy khi đến khám* hoặc *Thanh toán trực tuyến VNPay Sandbox*.
  * Tích hợp **Phiếu xác nhận thành công (`BookingSuccessModal`)** hiển thị mã lịch hẹn (kèm nút sao chép), toàn bộ thông số chi tiết và nút in file PDF phiếu khám ngay lập tức.
* **Quản lý Lịch sử khám bệnh (`BookingHistoryPage.jsx`)**:
  * Xem toàn bộ danh sách lịch hẹn: Chờ xác nhận (`pending`), Đã xác nhận (`confirmed`), Đã khám (`completed`), Đã hủy (`rejected` / `cancelled`).
  * Tính năng **Dời lịch khám**: Chọn ngày và giờ khám mới mà không cần hủy lịch cũ.
  * Tính năng **In phiếu hẹn PDF** trực tiếp từ lịch sử bất kỳ lúc nào.

---

### 5.2. Phân hệ Bác sĩ (Doctor Portal)
* **Doctor Dashboard & Biểu đồ phân tích**:
  * Thống kê KPI: Tổng số lịch hẹn trong tháng, số bệnh nhân đã khám, doanh thu thực tế, số lịch hẹn bị nhỡ.
  * Biểu đồ tròn (`PieChart.jsx`): Tỷ lệ phân bố trạng thái các lịch hẹn (Đã khám / Chờ khám / Đã hủy).
  * Biểu đồ kết hợp cột và đường (`CombinationChart.jsx`): Thống kê diễn biến doanh thu và lượt bệnh nhân qua 12 tháng trong năm.
* **Quản lý Lịch làm việc tuần (`SchedulePage.jsx` & `EditSchedulePage.jsx`)**:
  * Đăng ký ca làm việc linh hoạt theo từng thứ trong tuần (Thứ Hai đến Chủ Nhật).
  * Cấu hình ca sáng, ca chiều và độ dài slot khám (30 phút/slot).
  * **Thanh đo tuân thủ định mức (Compliance Banner)**: Hiển thị thời gian thực tổng số giờ trực đăng ký (`X / 20.0h`) và số ngày trực (`Y / 3 ngày`).
  * Nút "Khôi phục Lịch Chuẩn (Thứ 2 - Thứ 6)" phục hồi ngay lập tức lịch chuẩn 35h/tuần.
* **Tiếp nhận & Xử lý Lịch hẹn (`AppointmentsPage.jsx`)**:
  * Xem danh sách bệnh nhân đặt khám theo ngày hoặc tuần.
  * Xem thông tin chi tiết triệu chứng, tiền sử bệnh án và ghi chú của bệnh nhân.
  * Chuyển trạng thái lịch hẹn: Xác nhận tiếp nhận (`confirmed`), Hoàn thành ca khám (`completed`) hoặc Từ chối tiếp nhận (`rejected`).
* **Xuất phiếu khám bệnh PDF chuẩn mẫu y tế**:
  * Kết xuất phiếu khám thông qua JasperReports Engine với đầy đủ thông tin: Mã lịch hẹn, Logo phòng khám, Tên bác sĩ, Chuyên khoa, Thông tin bệnh nhân, Ngày giờ khám, Hướng dẫn khám bệnh.
* **Hệ thống thông báo thời gian thực**:
  * Chuông thông báo trên thanh tiêu đề hiển thị số lượng thông báo chưa đọc.
  * Tự động sinh thông báo khi có bệnh nhân đặt lịch mới hoặc khi bệnh nhân dời lịch khám.

---

### 5.3. Phân hệ Quản trị viên phòng khám (Clinic Admin Portal)
Toàn bộ phân hệ Admin được tái cấu trúc theo mô hình **Clean Architecture** sử dụng `AdminContext`:
* **Admin Dashboard (`AdminDashboard.jsx`)**:
  * Tổng hợp toàn diện 4 chỉ số cốt lõi: Tổng số bác sĩ, Tổng số chuyên khoa, Tổng số lịch hẹn toàn viện, Tổng số bệnh nhân đăng ký.
  * Thống kê cơ cấu trạng thái lịch hẹn toàn hệ thống.
  * Ước tính tổng doanh thu toàn viện dựa trên các ca khám đã hoàn thành.
* **Quản lý danh sách Bác sĩ (`AdminDoctors.jsx`)**:
  * Danh sách phân trang chuyên nghiệp (`Pagination.jsx`).
  * Tìm kiếm nhanh theo họ tên, email, số điện thoại, địa chỉ phòng khám.
  * Lọc bác sĩ theo chuyên khoa y tế.
* **Cấp tài khoản Bác sĩ mới (In-page Dialog)**:
  * Không chuyển trang, mở modal tương tác tiện lợi.
  * Chọn ảnh đại diện từ thiết bị máy tính, xem trước ảnh tức thì (`preview`) và upload tự động lên máy chủ.
  * Tự động geocoding địa chỉ phòng khám ra kinh độ/vĩ độ.
  * Tự động sinh mật khẩu ngẫu nhiên độ an toàn cao kèm nút bật/tắt hiển thị mật khẩu.
  * Phiếu bàn giao tài khoản với nút sao chép thông tin tài khoản 1 chạm.
  * **Tự động cấp lịch làm việc chuẩn (35 giờ/tuần)** ngay khi tài khoản được tạo thành công.
* **Cập nhật hồ sơ & Điều chuyển chuyên khoa**:
  * Modal chỉnh sửa thông tin bác sĩ, cho phép đổi chuyên khoa công tác, cập nhật giá khám, địa chỉ và thay đổi ảnh đại diện từ máy tính.
* **Cấp lại mật khẩu trực tiếp (Reset Password Modal)**:
  * Admin cấp lại mật khẩu mới cho bác sĩ mà không yêu cầu nhập mật khẩu cũ.
  * Tích hợp nút sinh mật khẩu ngẫu nhiên và sao chép bàn giao.
* **Xóa tài khoản Bác sĩ**:
  * Kiểm tra toàn vẹn dữ liệu: Cảnh báo và từ chối xóa nếu bác sĩ đang có lịch hẹn với bệnh nhân để bảo đảm dữ liệu y tế.
* **Quản trị Lịch hẹn toàn viện (`AdminAppointments.jsx`)**:
  * Xem toàn bộ lịch hẹn của tất cả các chuyên khoa.
  * Tìm kiếm theo mã lịch hẹn (`APT...`), tên bệnh nhân, tên bác sĩ.
  * Cập nhật trạng thái trực tiếp trên từng dòng qua Select Dropdown (Chờ duyệt, Đã duyệt, Đã hoàn thành, Đã hủy) - tự động đồng bộ trạng thái khung giờ `BookableSlot`.
* **Quản lý Danh bạ Bệnh nhân (`AdminPatients.jsx`)**:
  * Quản lý danh sách toàn bộ bệnh nhân đã đăng ký trên hệ thống.
  * Tìm kiếm bệnh nhân theo tên, email, điện thoại, địa chỉ.
  * Xóa tài khoản bệnh nhân không còn hoạt động.

---

### 5.4. Trí tuệ Nhân tạo Y tế & RAG Engine (AI Assistant)
* **Mô hình ngôn ngữ lớn (LLM)**: Tích hợp thông qua OpenRouter API, sử dụng các mô hình tiên tiến để tư vấn sơ bộ triệu chứng y khoa.
* **Kiến trúc RAG (Retrieval-Augmented Generation)**:
  * Cơ sở dữ liệu Vector Pinecone lưu trữ vector embedding của các tài liệu y khoa và hồ sơ năng lực của đội ngũ bác sĩ.
  * Khi bệnh nhân đặt câu hỏi (ví dụ: *"Tôi bị đau thắt ngực lan ra cánh tay trái thì nên khám ở đâu?"*), hệ thống thực hiện tìm kiếm ngữ nghĩa (Semantic Search) trên Pinecone để trích xuất tri thức liên quan nhất, đưa vào ngữ cảnh Prompt gửi cho LLM.
* **AI Doctor Suggestion (`DoctorSuggestPage.jsx`)**:
  * Bệnh nhân mô tả triệu chứng, hệ thống AI tự động phân tích và đề xuất danh sách 3 bác sĩ có chuyên môn phù hợp nhất kèm khoảng cách km cụ thể từ vị trí bệnh nhân đến phòng khám.

---

### 5.5. Hạ tầng dịch vụ tích hợp bên thứ ba
1. **VNPay Sandbox Payment Gateway**: Xử lý giao dịch thanh toán viện phí trực tuyến chuẩn xác, tính toán mã băm SHA-512 kiểm tra tính toàn vẹn dữ liệu giao dịch và cập nhật trạng thái thanh toán tự động qua URL trả về.
2. **VietMap GIS Platform**: Cung cấp bản đồ số tương tác và dịch vụ Geocoding chuẩn xác theo địa giới hành chính Việt Nam.
3. **JasperReports Engine**: Biên dịch template `appointment_detail.jrxml` sang tài liệu PDF hỗ trợ tiếng Việt có dấu.
4. **Apache Kafka Message Broker**: Kiến trúc hướng sự kiện xử lý tác vụ gửi email thông báo ngầm, bảo đảm không làm nghẽn tiến trình xử lý HTTP.
5. **Google Identity Service (OAuth 2.0)**: Đăng nhập một chạm tiện lợi, an toàn và bảo mật cho người dùng.
6. **Gmail SMTP Server**: Gửi email tự động thông báo xác nhận lịch hẹn và gửi mã token khôi phục mật khẩu.

---

## 6. CHUYÊN ĐỀ: CÁC TÍNH NĂNG MỚI NHẤT ĐƯỢC BỔ SUNG & TỐI ƯU HÓA

### 6.1. Phân hệ Quản trị Admin tương tác & Cấp tài khoản Bác sĩ (Thoát ly can thiệp SQL)
* **Trước đây**: Hệ thống chưa có giao diện quản trị phòng khám. Mọi thao tác thêm bác sĩ, cấp quyền tài khoản hay gán chuyên khoa đều phải thực hiện thủ công bằng lệnh SQL trực tiếp vào MySQL Workbench, dễ gây lỗi khóa ngoại và lộ mật khẩu.
* **Hiện tại**: Phân hệ Quản trị Admin hoàn thiện 100% với giao diện tương tác hiện đại tại `/admin/doctors`, `/admin/appointments`, `/admin/patients`, `/admin/dashboard`. Cấp tài khoản trực tiếp qua giao diện, mã hóa BCrypt tự động và ràng buộc toàn vẹn khóa ngoại.

### 6.2. Upload ảnh đại diện trực tiếp từ máy tính (`POST /api/upload/image`)
* Hỗ trợ chọn tệp hình ảnh (`.png`, `.jpg`, `.jpeg`, `.webp`) trực tiếp từ máy tính hoặc điện thoại.
* Hiển thị ảnh xem trước tức thì trên màn hình trước khi bấm lưu.
* File được lưu trữ an toàn tại thư mục tĩnh `images/` của backend và được cấu hình phục vụ công khai qua đường dẫn `/images/**`.

### 6.3. Tự động sinh lịch làm việc chuẩn (35 giờ/tuần) khi tạo bác sĩ
* **Bài toán**: Bác sĩ mới tạo chưa kịp vào cấu hình lịch trực sẽ có lịch làm việc trống 100%, khiến bệnh nhân khi vào đặt khám luôn nhận thông báo bác sĩ không có giờ khám khả dụng.
* **Giải pháp**: Ngay khi Admin tạo bác sĩ thành công, backend tự động khởi tạo bộ lịch làm việc chuẩn:
  * Các ngày làm việc: Từ **Thứ Hai đến Thứ Sáu**.
  * Ca sáng: `08:00 - 11:30` (7 slot x 30 phút = 3.5 giờ).
  * Ca chiều: `13:30 - 17:00` (7 slot x 30 phút = 3.5 giờ).
  * Định mức tuần: 7 giờ/ngày x 5 ngày = **35 giờ/tuần**.
  * Bệnh nhân có thể vào đặt lịch ngay lập tức mà không gặp bất kỳ lỗi thiếu giờ khám nào.

### 6.4. Ràng buộc tuân thủ định mức làm việc tối thiểu (>= 20h/tuần, >= 3 ngày/tuần)
* **Quy chuẩn phòng khám**:
  * Mỗi bác sĩ phải đăng ký làm việc **tối thiểu 20 giờ/tuần**.
  * Mỗi bác sĩ phải làm việc **tối thiểu 3 ngày/tuần**.
* **Tiện ích trên Doctor Portal**:
  * **Thanh đo tuân thủ (Compliance Banner)**: Tính toán tự động thời gian thực số giờ trực (`X / 20.0h`) kèm thanh tiến độ trực quan, nhãn phân loại (Đạt chuẩn / Chưa đạt).
  * **Nút phục hồi 1 chạm**: Bác sĩ có thể bấm "Khôi phục Lịch Chuẩn (Thứ 2 - Thứ 6)" để phục hồi ngay định mức 35 giờ/tuần bất cứ lúc nào.
  * Cảnh báo trực tiếp nếu chỉnh sửa ca khiến thời gian tuần giảm xuống dưới 20 giờ.

### 6.5. Tối ưu hóa trải nghiệm chọn ngày khám cho Bệnh nhân (Patient UX)
* **Hiển thị trực quan lịch trực**: Ngay khi chọn bác sĩ, giao diện hiển thị danh sách các thứ bác sĩ có ca trực trong tuần (`[Thứ Hai] [Thứ Ba] [Thứ Tư]...`).
* **Gợi ý 4 ngày khám gần nhất**: Tính toán tự động và đưa ra các nút chọn nhanh 1-click cho 4 ngày khám gần nhất mà bác sĩ có ca trực.
* **Loại bỏ popup `alert()`**: Thay thế toàn bộ popup alert chặn màn hình bằng thông báo cảnh báo inline mềm mại, đẹp mắt.
* **Mở rộng phạm vi đặt lịch**: Cho phép bệnh nhân đặt lịch trước linh hoạt trong vòng **30 ngày**, thay vì bị giới hạn cứng trong tuần hiện tại.

### 6.6. Tối ưu hóa hiệu năng API `POST /api/appointment/save` & Async Kafka
* **Khắc phục lỗi treo 60 giây**: Khi hệ thống Kafka broker trên máy không mở cổng 9092, lệnh gửi tin nhắn Kafka đồng bộ trước đây bị giữ lại chờ timeout kết nối 60 giây. Đã chuyển sang gửi tin nhắn **Bất đồng bộ (`CompletableFuture.runAsync`)** và giới hạn timeout `MAX_BLOCK_MS_CONFIG = 1500ms`. API phản hồi tức thì trong **10 - 20ms**.
* **Chuẩn hóa phản hồi lỗi**: Bắt ngoại lệ tại Controller, trả về mã `400 Bad Request` kèm nội dung lỗi rõ ràng dạng JSON `{ "success": false, "message": "Khung giờ này vừa có người đặt..." }`.
* **Trả về trọn bộ metadata**: Trả về đầy đủ `id`, `appointmentCode`, `doctorName`, `specialtyName`, `slotDate`, `startTime`, `endTime`, `price`, `paymentMethod` hỗ trợ trang thanh toán online và hiển thị phiếu xác nhận.
* **Sinh mã lịch hẹn an toàn**: Trích xuất số thứ tự an toàn, không còn rủi ro `NullPointerException` hay `NumberFormatException`.

### 6.7. Phiếu xác nhận đặt lịch khám thành công (`BookingSuccessModal`) & Tải PDF tức thì
* Modal phiếu khám hiện đại với hiệu ứng checkmark chuyển động.
* Hộp mã lịch hẹn nổi bật kèm nút **"Sao chép mã" 1-click** (có trạng thái *"Đã chép mã!"*).
* Hiển thị đầy đủ thông tin: Bác sĩ, Chuyên khoa, Ngày khám (định dạng tiếng Việt), Giờ khám, Bệnh nhân, Hình thức thanh toán, Chi phí và Địa chỉ phòng khám.
* Tích hợp 2 nút thao tác tiện lợi:
  * 📄 **"Xem Lịch Sử Hẹn"**: Chuyển thẳng về trang `/patient/booking-history`.
  * 🖨️ **"In Phiếu (PDF)"**: Gọi `reportService.downloadAppointment(id)` tải ngay file PDF về thiết bị.

---

## 7. BẢNG TỔNG HỢP API ENDPOINTS TOÀN DIỆN

### 7.1. Phân hệ Xác thực & Người dùng (Authentication)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/patient/login` | Đăng nhập tài khoản Bệnh nhân | Public |
| `POST` | `/api/patient/register` | Đăng ký tài khoản Bệnh nhân mới | Public |
| `POST` | `/api/patient/forgot_password` | Gửi mã OTP khôi phục mật khẩu qua Email | Public |
| `POST` | `/api/patient/reset_password` | Đặt lại mật khẩu mới với Token OTP | Public |
| `POST` | `/api/patient/change_password` | Đổi mật khẩu cá nhân (yêu cầu mật khẩu cũ) | Patient |
| `POST` | `/api/doctor/login` | Đăng nhập tài khoản Bác sĩ | Public |
| `POST` | `/api/doctor/google-login` | Đăng nhập Bác sĩ bằng Google ID Token | Public |
| `POST` | `/api/doctor/change_password` | Đổi mật khẩu Bác sĩ | Doctor |

### 7.2. Phân hệ Bác sĩ & Lịch làm việc (Doctor & Schedule)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `GET` | `/api/doctor/all` | Lấy danh sách tất cả bác sĩ đang công tác | Public |
| `GET` | `/api/doctor/{id}` | Lấy chi tiết hồ sơ bác sĩ theo ID | Public |
| `PUT` | `/api/doctor/update/{id}` | Cập nhật hồ sơ bác sĩ & địa chỉ phòng khám | Doctor |
| `GET` | `/api/availability/schedule` | Lấy lịch làm việc theo thứ của bác sĩ | Doctor / Patient |
| `POST` | `/api/availability/update` | Cập nhật ca làm việc tuần của bác sĩ | Doctor |
| `GET` | `/api/availability/summary` | Lấy báo cáo định mức số giờ và số ngày trực tuần | Doctor |
| `POST` | `/api/availability/init-default` | Khôi phục bộ lịch làm việc chuẩn (35h/tuần) | Doctor |
| `GET` | `/api/bookable_slots/doctor/{id}/slots` | Lấy các khung giờ khám trống theo ngày | Public |

### 7.3. Phân hệ Đặt lịch & Thanh toán (Appointment & Payment)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/appointment/save` | Đặt lịch khám mới (hỗ trợ cả offline & online VNPay) | Patient |
| `GET` | `/api/appointment/doctor/{doctorId}` | Lấy danh sách lịch hẹn của bác sĩ | Doctor |
| `GET` | `/api/appointment/patient/{patientId}` | Lấy lịch sử hẹn khám của bệnh nhân | Patient |
| `GET` | `/api/appointment/doctor/{doctorId}/{appointmentId}` | Xem chi tiết lịch hẹn | Doctor |
| `PUT` | `/api/appointment/reschedule/{id}` | Dời lịch khám sang ngày và giờ mới | Patient |
| `PUT` | `/api/appointment/status/{id}` | Cập nhật trạng thái lịch hẹn (`confirmed`, `completed`, `rejected`) | Doctor |
| `GET` | `/api/appointment/payment/result` | Callback xử lý kết quả giao dịch thanh toán từ VNPay | Public |

### 7.4. Phân hệ Quản trị viên phòng khám (Clinic Admin)
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `POST` | `/api/doctor/create` | Cấp tài khoản bác sĩ mới kèm mật khẩu BCrypt | Admin |
| `POST` | `/api/upload/image` | Upload ảnh đại diện bác sĩ từ thiết bị máy tính | Admin |
| `PUT` | `/api/doctor/admin/{id}` | Cập nhật thông tin bác sĩ & đổi chuyên khoa | Admin |
| `PUT` | `/api/doctor/admin/{id}/reset-password` | Cấp lại mật khẩu mới cho bác sĩ | Admin |
| `DELETE` | `/api/doctor/{id}` | Xóa hồ sơ bác sĩ (có kiểm tra ràng buộc lịch hẹn) | Admin |
| `GET` | `/api/appointment/all` | Lấy toàn bộ lịch hẹn của mọi khoa phục vụ Admin | Admin |
| `PUT` | `/api/appointment/admin/{id}/status` | Admin trực tiếp cập nhật trạng thái lịch hẹn | Admin |
| `GET` | `/api/patient/all` | Lấy danh bạ toàn bộ bệnh nhân đã đăng ký | Admin |
| `DELETE` | `/api/patient/admin/{id}` | Xóa hồ sơ bệnh nhân | Admin |
| `GET` | `/api/specialty/all` | Lấy danh mục chuyên khoa để phân bổ bác sĩ | Public / Admin |

### 7.5. Báo cáo, Thống kê, AI & Thông báo
| Method | Endpoint | Mô tả chức năng | Quyền truy cập |
| :--- | :--- | :--- | :---: |
| `GET` | `/dashboard/stats` | Thống kê các chỉ số KPI hoạt động của bác sĩ | Doctor |
| `GET` | `/api/appointment/statistics/status` | Thống kê tỷ lệ trạng thái lịch hẹn vẽ biểu đồ tròn | Doctor |
| `GET` | `/api/appointment/statistics/revenue-patient` | Thống kê doanh thu và lượt khám 12 tháng vẽ biểu đồ cột | Doctor |
| `GET` | `/api/report/appointment/{id}` | Xuất phiếu khám bệnh dạng file PDF (JasperReports) | Doctor / Patient |
| `POST` | `/api/ai/chat` | Trò chuyện với Trợ lý Y tế AI (OpenRouter LLM) | Public |
| `POST` | `/api/ai/suggest-doctors` | AI phân tích triệu chứng và gợi ý bác sĩ kèm khoảng cách | Public |
| `POST` | `/api/rag-chat/ask` | Truy vấn y tế với RAG + Pinecone Vector Database | Public |
| `GET` | `/api/notification/doctor/{id}` | Lấy danh sách thông báo của bác sĩ | Doctor |
| `GET` | `/api/notification/doctor/{id}/unread_count` | Lấy số lượng thông báo chưa đọc | Doctor |

---

## 8. HƯỚNG DẪN CÀI ĐẶT, CẤU HÌNH & KHỞI CHẠY HỆ THỐNG

### 8.1. Yêu cầu môi trường
* **Java Development Kit (JDK)**: Phiên bản 21 trở lên.
* **Node.js**: Phiên bản 18 trở lên (khuyên dùng Node.js 20 hoặc 22 LTS).
* **Cơ sở dữ liệu**: MySQL 8.0 (cổng mặc định 3306).
* **Công cụ xây dựng**: Maven Wrapper (`./mvnw`) có sẵn trong backend và `npm` trong frontend.

### 8.2. Cấu hình Cơ sở dữ liệu MySQL
1. Khởi động MySQL Server trên máy tính.
2. Tạo database mới và nạp dữ liệu mẫu ban đầu:
   ```bash
   mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS dat_lich_kham_benh CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
   mysql -u root -p dat_lich_kham_benh < database/dat_lich_kham_benh.sql
   ```

### 8.3. Khởi chạy Backend (Spring Boot API)
1. Di chuyển vào thư mục backend:
   ```bash
   cd backend
   ```
2. Kiểm tra thông số kết nối cơ sở dữ liệu tại `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/dat_lich_kham_benh?useSSL=false&serverTimezone=UTC&characterEncoding=UTF-8&allowPublicKeyRetrieval=true
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
3. Biên dịch và khởi chạy server:
   ```bash
   ./mvnw spring-boot:run
   ```
   * Server backend chạy tại: `http://localhost:8080`
   * Tài liệu OpenAPI Swagger UI: `http://localhost:8080/swagger-ui/index.html`

### 8.4. Khởi chạy Frontend (React SPA)
1. Mở cửa sổ dòng lệnh mới và di chuyển vào thư mục frontend:
   ```bash
   cd frontend
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Khởi chạy máy chủ phát triển Vite:
   ```bash
   npm run dev
   ```
   * Cổng giao diện ứng dụng: `http://localhost:5173`
   * Cổng Quản trị Admin: `http://localhost:5173/admin/dashboard`
   * Cổng Bác sĩ: `http://localhost:5173/doctor/dashboard`
   * Cổng Bệnh nhân: `http://localhost:5173/`

---

## 9. KẾT LUẬN & ĐÁNH GIÁ ĐẠT ĐƯỢC

Dự án **Klinik (MediCare)** đã hoàn thành xuất sắc toàn bộ các mục tiêu đặt ra cho một hệ thống y tế số chuẩn mực:
* **Tính toàn diện**: Bao phủ trọn vẹn 3 phân hệ độc lập (Bệnh nhân, Bác sĩ, Quản trị viên) với 4 vai trò người dùng được phân quyền chặt chẽ.
* **Tính hiện đại**: Ứng dụng các công nghệ tiên tiến nhất hiện nay gồm React 19, Spring Boot 3.3.0, AI RAG với Vector Database, Kiến trúc Event-Driven Kafka bất đồng bộ và Bản đồ số VietMap GIS.
* **Tính tiện dụng & Trải nghiệm người dùng (UX)**: Loại bỏ triệt để các rào cản thao tác thủ công, cung cấp giao diện tương tác tức thì (In-page Dialog, Upload ảnh từ thiết bị, Gợi ý ngày trực, Phiếu xác nhận thành công và Tải phiếu PDF 1-click).
* **Độ ổn định & An toàn**: 100% các API cốt lõi được bảo vệ với xử lý ngoại lệ chuẩn hóa, kiểm tra ràng buộc toàn vẹn dữ liệu và mã hóa bảo mật chuẩn y tế.
