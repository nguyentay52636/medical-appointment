# 🏥 TÀI LIỆU CHI TIẾT TÍNH NĂNG HỆ THỐNG ĐẶT LỊCH KHÁM BỆNH & QUẢN LÝ PHÒNG KHÁM (MEDICARE)

> **Dự án**: Hệ thống Đặt lịch khám bệnh và Quản lý phòng khám trực tuyến  
> **Kiến trúc**: Client-Server (SPA React 19 + Spring Boot 3.3.0 RESTful API + Apache Kafka + Spring AI RAG)  
> **Cập nhật ngày**: 25/10/2026  

---

## 📌 MỤC LỤC
1. [Tổng Quan Hệ Thống](#1-tổng-quan-hệ-thống)
2. [Ma Trận Phân Quyền & Vai Trò](#2-ma-trận-phân-quyền--vai-trò)
3. [Phân Hệ Xác Thực & Bảo Mật (Authentication & Security)](#3-phân-hệ-xác-thực--bảo-mật)
4. [Phân Hệ Bệnh Nhân (Patient Portal)](#4-phân-hệ-bệnh-nhân-patient-portal)
5. [Phân Hệ Bác Sĩ (Doctor Portal)](#5-phân-hệ-bác-sĩ-doctor-portal)
6. [Hệ Thống Trí Tuệ Nhân Tạo & Tìm Kiếm Thông Minh (AI & RAG Engine)](#6-hệ-thống-trí-tuệ-nhân-tạo--tìm-kiếm-thông-minh-ai--rag-engine)
7. [Hạ Tầng & Dịch Vụ Tích Hợp Bên Thứ Ba (3rd Party Integrations)](#7-hạ-tầng--dịch-vụ-tích-hợp-bên-thứ-ba)
8. [Danh Mục API Endpoints Chính](#8-danh-mục-api-endpoints-chính)

---

## 1. TỔNG QUAN HỆ THỐNG

**MediCare** là nền tảng y tế số toàn diện kết nối giữa **Bệnh nhân** và **Bác sĩ/Phòng khám tư nhân**, giải quyết bài toán quá tải tại bệnh viện truyền thống, tối ưu hóa quy trình đặt hẹn và quản lý phòng khám:
- **Dành cho Bệnh nhân**: Tìm kiếm bác sĩ theo chuyên khoa, triệu chứng, vị trí bản đồ địa lý; nhận tư vấn sơ bộ từ AI Bot; đặt lịch khám và thanh toán online nhanh chóng.
- **Dành cho Bác sĩ**: Quản lý lịch biểu khám linh hoạt theo từng khung giờ; theo dõi và xử lý lịch hẹn; phân tích doanh thu qua biểu đồ trực quan; in phiếu khám bệnh PDF chuẩn hóa.

```
+-----------------------------------------------------------------------------------+
|                                  MEDICARE SYSTEM                                  |
+-----------------------------------------+-----------------------------------------+
|             PATIENT PORTAL              |              DOCTOR PORTAL              |
|  - Tìm kiếm & Lọc bác sĩ đa tiêu chí    |  - Dashboard thống kê & Biểu đồ Chart.js|
|  - Trợ lý AI tư vấn triệu chứng RAG     |  - Quản lý lịch làm việc & Ca khám      |
|  - Bản đồ số VietMap định vị phòng khám |  - Tiếp nhận, Xác nhận & Khám bệnh      |
|  - Đặt lịch theo khung giờ khả dụng     |  - Xuất phiếu khám bệnh Jasper PDF      |
|  - Thanh toán trực tuyến VNPay Sandbox  |  - Hệ thống thông báo thời gian thực    |
|  - Quản lý lịch sử, dời lịch, hủy hẹn   |  - Quản lý hồ sơ chuyên khoa, giá khám  |
+-----------------------------------------+-----------------------------------------+
|                  CORE PLATFORM & EXTERNAL INTEGRATIONS                            |
|    Spring Security + JWT | Google OAuth 2.0 | Apache Kafka Event-Driven           |
|    MySQL Database + JPA | JasperReports | VietMap API | OpenRouter AI + Pinecone  |
+-----------------------------------------------------------------------------------+
```

---

## 2. MA TRẬN PHÂN QUYỀN & VAI TRÒ

| Nhóm tính năng | Khách vãng lai (Guest) | Bệnh nhân (Patient) | Bác sĩ (Doctor) |
| :--- | :---: | :---: | :---: |
| Xem trang chủ, giới thiệu, chuyên khoa | ✅ | ✅ | ✅ |
| Tìm kiếm danh sách bác sĩ | ✅ | ✅ | ✅ |
| Xem bản đồ phòng khám & khoảng cách | ✅ | ✅ | ✅ |
| Chat với Trợ lý ảo AI & Gợi ý bác sĩ | ✅ | ✅ | ✅ |
| Đăng ký / Đăng nhập (Mật khẩu & Google) | ✅ | ✅ | ✅ |
| Quên mật khẩu / Khôi phục qua Email | ✅ | ✅ | ✅ |
| Đặt lịch khám theo khung giờ (`BookableSlot`) | ❌ | ✅ | ❌ |
| Thanh toán trực tuyến qua VNPay | ❌ | ✅ | ❌ |
| Quản lý lịch sử khám, Dời lịch, Hủy hẹn | ❌ | ✅ | ❌ |
| Quản lý thông tin hồ sơ cá nhân | ❌ | ✅ | ✅ |
| Dashboard báo cáo & Biểu đồ doanh thu | ❌ | ❌ | ✅ |
| Cấu hình lịch biểu hàng tuần (`Availability`) | ❌ | ❌ | ✅ |
| Duyệt lịch hẹn, Tiếp nhận khám, Từ chối | ❌ | ❌ | ✅ |
| Xuất phiếu khám bệnh PDF (JasperReports) | ❌ | ❌ | ✅ |
| Nhận thông báo lịch khám thời gian thực | ❌ | ❌ | ✅ |

---

## 3. PHÂN HỆ XÁC THỰC & BẢO MẬT

### 3.1. Đăng ký & Đăng nhập
- **Đăng ký tài khoản Bệnh nhân**: Kiểm tra tính duy nhất của Số điện thoại và Email; mã hóa mật khẩu một chiều bằng thuật toán `BCrypt`.
- **Đăng nhập Email/Mật khẩu**: Hỗ trợ phân tách luồng đăng nhập riêng biệt giữa Bệnh nhân và Bác sĩ.
- **Đăng nhập 1 chạm Google OAuth 2.0**: Cho phép người dùng đăng nhập tức thì thông qua tài khoản Google mà không cần nhập mật khẩu.
- **Phiên làm việc & Token**: Quản lý phiên bằng `PatientContext` và `DoctorContext` lưu trữ tại LocalStorage/SessionStorage, bảo vệ các Private Routes.

### 3.2. Quên mật khẩu & Khôi phục tài khoản
- **Xác thực qua Email (Gmail SMTP)**: Nhập email đã đăng ký, hệ thống tự động sinh mã Token khôi phục mật khẩu có thời hạn gửi vào hòm thư.
- **Đặt lại mật khẩu (Reset Password)**: Xác thực Token hợp lệ và cập nhật mật khẩu mới đã mã hóa vào hệ thống.
- **Đổi mật khẩu chủ động**: Người dùng đăng nhập có thể đổi mật khẩu bất kỳ lúc nào với yêu cầu xác nhận mật khẩu cũ.

---

## 4. PHÂN HỆ BỆNH NHÂN (PATIENT PORTAL)

### 4.1. Khám phá & Tìm kiếm Bác sĩ
- **Danh bạ Bác sĩ đa tiêu chí**:
  - Lọc theo Chuyên khoa y tế (Nhi khoa, Tim mạch, Da liễu, Tai Mũi Họng, Răng Hàm Mặt, Thần kinh,...).
  - Tìm kiếm theo tên bác sĩ hoặc phòng khám.
  - Sắp xếp và xem thông tin: số năm kinh nghiệm, học hàm/học vị, giá khám niêm yết, địa chỉ phòng khám.
- **Trang chi tiết Chuyên khoa (`SpecialtyDetailPage`)**: Giới thiệu thông tin bệnh lý liên quan, triệu chứng thường gặp, và danh sách bác sĩ chuyên môn thuộc khoa đó.

### 4.2. Định vị Bản đồ số Phòng khám (VietMap GIS)
- **Tích hợp VietMap API**: Tự động Geocode địa chỉ phòng khám của bác sĩ thành tọa độ địa lý (Latitude/Longitude).
- **Tính toán khoảng cách thông minh**: Dựa trên vị trí hiện tại của bệnh nhân (hoặc địa chỉ nhập vào), áp dụng công thức Haversine để tính số km thực tế đến từng bác sĩ.
- **Bản đồ tương tác trực quan**: Hiển thị vị trí phòng khám trên bản đồ số VietMap GL JS / Leaflet kèm chỉ đường.

### 4.3. Quy trình Đặt lịch Khám (`BookingPage`)
- **Chọn ngày & Bác sĩ**: Lịch động cho phép bệnh nhân chọn ngày khám theo mong muốn.
- **Khung giờ khám khả dụng (`BookableSlot`)**: Hiển thị danh sách các slot thời gian (ví dụ: `08:00 - 08:30`, `08:30 - 09:00`,...) với trạng thái trực quan:
  - Khung giờ còn trống: Cho phép click chọn.
  - Khung giờ đã được đặt: Bị khóa (`disabled`), tránh tình trạng trùng lịch (double-booking).
- **Nhập thông tin bệnh án sơ bộ**: Điền triệu chứng ban đầu, tiền sử bệnh lý, ghi chú yêu cầu gửi đến bác sĩ.

### 4.4. Thanh toán Trực tuyến (VNPay Gateway)
- **Tích hợp cổng VNPay Sandbox**:
  - Hỗ trợ thanh toán qua Quét mã VNPAY-QR, Thẻ ATM / Tài khoản ngân hàng nội địa, Internet Banking, Thẻ quốc tế (Visa, MasterCard, JCB).
  - Bảo mật giao dịch bằng thuật toán băm Checksum (HMAC-SHA512).
- **Xử lý kết quả giao dịch (`OnlinePaymentResultPage`)**:
  - Tự động kiểm tra mã phản hồi (`vnp_ResponseCode = '00'` là thành công).
  - Cập nhật tức thì trạng thái thanh toán của lịch hẹn thành `paid` hoặc `failed`.
  - Hiển thị hóa đơn xác nhận thanh toán trực tuyến cho bệnh nhân.

### 4.5. Quản lý Lịch sử Đặt lịch (`BookingHistoryPage`)
- **Theo dõi tiến trình lịch khám**:
  - Bộ lọc lịch hẹn theo trạng thái: `Tất cả`, `Chờ xác nhận (pending)`, `Đã xác nhận (confirmed)`, `Đã khám (completed)`, `Đã hủy (cancelled)`.
- **Dời lịch hẹn (Reschedule)**: Cho phép bệnh nhân thay đổi ngày và khung giờ khám mới nếu chưa đến giờ hẹn.
- **Hủy lịch hẹn (Cancel)**: Hủy lịch khám trực tiếp trên hệ thống; hệ thống tự động giải phóng khung giờ (`BookableSlot`) để bệnh nhân khác có thể đặt.

### 4.6. Trợ giúp & Thông tin cá nhân
- **Trang thông tin cá nhân (`InfoPage`)**: Cập nhật hồ sơ bệnh nhân (Họ tên, ngày sinh, giới tính, số điện thoại, địa chỉ cư trú).
- **Trung tâm hỗ trợ (`SupportPage`)**: FAQ danh mục câu hỏi thường gặp dạng Accordion, chính sách khám chữa bệnh và điều khoản sử dụng.

---

## 5. PHÂN HỆ BÁC SĨ (DOCTOR PORTAL)

### 5.1. Dashboard Thống kê & Phân tích (Analytics Dashboard)
- **Thẻ chỉ số tổng quan (KPI Cards)**:
  - Tổng số lịch hẹn trong ngày hôm nay.
  - Số lượng lịch hẹn sắp tới cần tiếp nhận.
  - Số lượng lịch hẹn bị nhỡ / bệnh nhân không đến.
- **Biểu đồ tròn tỷ lệ trạng thái (`PieChart`)**:
  - Phân bổ trực quan tỷ lệ % giữa: Đã hoàn thành, Chờ duyệt, Đã hủy, Bị nhỡ.
- **Biểu đồ kết hợp đa trục (`CombinationChart`)**:
  - Biểu đồ cột (Bar Chart): Thống kê doanh thu từng tháng trong năm (VNĐ).
  - Biểu đồ đường (Line Chart): Thống kê số lượng lượt bệnh nhân khám qua 12 tháng.

### 5.2. Quản lý Lịch hẹn Bệnh nhân (`AppointmentsPage`)
- **Danh sách lịch hẹn chi tiết**: Xem đầy đủ lịch hẹn theo ngày, tuần, trạng thái và thông tin bệnh nhân.
- **Chi tiết ca khám (`AppointmentDetailPage`)**: Xem lý do khám, triệu chứng bệnh nhân ghi chú, lịch sử giờ hẹn, trạng thái thanh toán.
- **Luồng xử lý trạng thái lịch khám**:
  - `Xác nhận lịch`: Bác sĩ chấp nhận ca khám của bệnh nhân.
  - `Bắt đầu khám / Đang khám`: Cập nhật tiến trình tiếp nhận.
  - `Hoàn thành khám`: Đóng ca khám, lưu vào lịch sử doanh thu.
  - `Hủy / Từ chối lịch hẹn`: Hủy ca khám kèm lý do, tự động mở lại khung giờ cho bệnh nhân khác.

### 5.3. Quản lý Thời khóa biểu & Khung giờ khám (`SchedulePage`)
- **Cấu hình ca làm việc trong tuần (`DoctorAvailability`)**:
  - Bác sĩ thiết lập lịch định kỳ từ Thứ 2 đến Chủ Nhật.
  - Cấu hình linh hoạt: Ca sáng (Morning), Ca chiều (Afternoon), Ca tối (Evening), thời gian bắt đầu - kết thúc.
  - Bật / tắt trạng thái làm việc theo từng ngày mà không làm mất cấu hình cũ (Soft update).
- **Tự động sinh Khung giờ khả dụng (`BookableSlot`)**:
  - Hệ thống tự động chia nhỏ ca làm việc thành các slot 30 phút hoặc 60 phút để bệnh nhân dễ dàng lựa chọn.

### 5.4. Xuất Báo cáo & Phiếu khám bệnh PDF (JasperReports)
- **Báo cáo lịch hẹn chi tiết (`ReportsPage`)**: Lọc và thống kê danh sách ca khám theo khoảng thời gian tùy chọn.
- **In phiếu khám bệnh chuyên nghiệp**:
  - Sử dụng JasperReports Engine kết xuất file PDF chất lượng cao.
  - Tích hợp font chữ Unicode Tiếng Việt chuẩn hóa.
  - Đầy đủ thông tin: Mã lịch hẹn, Logo phòng khám, Thông tin bác sĩ phụ trách, Thông tin bệnh nhân, Ngày giờ khám, Chi phí và Chữ ký xác nhận.

### 5.5. Hệ thống Thông báo Thời gian thực (Notifications)
- **Badge thông báo nổi bật**: Hiển thị số lượng thông báo mới chưa đọc trên thanh điều hướng.
- **Nhận thông báo tự động khi**:
  - Có bệnh nhân mới đặt lịch hẹn thành công.
  - Bệnh nhân thực hiện dời ngày/giờ khám.
  - Bệnh nhân hoặc hệ thống hủy lịch hẹn.
- **Tương tác**: Đánh dấu đã đọc từng thông báo hoặc Đánh dấu tất cả đã đọc (`Mark all as read`).

### 5.6. Quản lý Hồ sơ Bác sĩ (`ProfilePage`)
- Cập nhật thông tin chuyên môn: Chuyên khoa, Bằng cấp, Số năm kinh nghiệm.
- Cập nhật thông tin phòng khám: Tên phòng khám, Địa chỉ chi tiết (tự động cập nhật Geocode bản đồ), Giá khám mỗi lượt.
- Cập nhật tiểu sử giới thiệu (Bio) và thông tin liên hệ.

---

## 6. HỆ THỐNG TRÍ TUỆ NHÂN TẠO & TÌM KIẾM THÔNG MINH (AI & RAG ENGINE)

### 6.1. Trợ lý Y tế AI (AI Medical Chatbot)
- **Cơ chế hoạt động**: Sử dụng **Spring AI** kết nối mô hình ngôn ngữ lớn (LLM qua OpenRouter API).
- **Ngữ cảnh y khoa an toàn (Guardrails & Instructions)**:
  - AI được hướng dẫn nhận diện và giải thích triệu chứng thông thường, định hướng chuyên khoa phù hợp.
  - Từ chối chẩn đoán bệnh dứt điểm hoặc kê đơn thuốc tự do; luôn khuyến nghị bệnh nhân thăm khám với bác sĩ chuyên môn.
- **Bộ nhớ hội thoại (`Conversation Memory`)**: Duy trì ngữ cảnh trao đổi theo từng phiên (`sessionId`), giúp câu trả lời mạch lạc và liền mạch theo câu chuyện của bệnh nhân.

### 6.2. Gợi ý Bác sĩ Thông minh theo Triệu chứng & Vị trí (`ai-suggest`)
- **Quy trình gợi ý**:
  1. Bệnh nhân nhập mô tả các dấu hiệu bất thường về sức khỏe (ví dụ: *"Tôi bị đau nửa đầu kèm theo chóng mặt buồn nôn"*).
  2. Bệnh nhân nhập vị trí hiện tại (ví dụ: *"Quận 1, TP. Hồ Chí Minh"*).
  3. Hệ thống AI phân tích triệu chứng để suy luận chuyên khoa phù hợp nhất (Khoa Thần kinh).
  4. Hệ thống kết hợp dữ liệu bác sĩ, vị trí địa lý (VietMap Haversine) và đánh giá chất lượng để xếp hạng các bác sĩ phù hợp nhất gần bệnh nhân.

### 6.3. Kiến trúc RAG (Retrieval-Augmented Generation) & Pinecone Vector Store
- **Lưu trữ dữ liệu vector**: Thông tin hồ sơ, năng lực chuyên môn, kinh nghiệm của các bác sĩ được chuyển đổi thành Vector Embeddings và lưu trên **Pinecone Vector Database**.
- **Tìm kiếm ngữ nghĩa (Semantic Search)**: Khi người dùng đặt câu hỏi, hệ thống truy vấn vector tương đồng trên Pinecone để cung cấp thông tin chính xác nhất làm ngữ cảnh (Context) cho mô hình LLM sinh phản hồi.

---

## 7. HẠ TẦNG & DỊCH VỤ TÍCH HỢP BÊN THỨ BA

| Dịch vụ / Công nghệ | Vai trò & Ứng dụng trong MediCare |
| :--- | :--- |
| **Apache Kafka** | Kiến trúc hướng sự kiện (Event-driven). Khi phát sinh giao dịch đặt lịch/hủy lịch, sự kiện được đẩy vào topic `appointments`. `KafkaConsumerService` sẽ tiêu thụ message và kích hoạt tiến trình gửi email ngầm mà không làm chậm phản hồi HTTP của người dùng. |
| **VNPay Gateway** | Cổng thanh toán điện tử hỗ trợ chuẩn bảo mật sandbox, xử lý giao dịch viện phí trực tuyến, xác thực chữ ký SHA-512 và đồng bộ trạng thái thanh toán tức thì. |
| **VietMap API** | Dịch vụ bản đồ số và GIS thuần Việt: Cung cấp API Geocoding để chuyển đổi địa chỉ thành tọa độ kinh/vĩ độ và hiển thị bản đồ trực quan với VietMap GL JS. |
| **JasperReports Engine** | Thư viện tạo báo cáo và xuất tài liệu PDF chuyên nghiệp: Tạo phiếu hẹn khám bệnh chuẩn mẫu y tế hỗ trợ tiếng Việt có dấu. |
| **Google Identity (OAuth 2.0)** | Đăng nhập an toàn một chạm cho bệnh nhân và bác sĩ thông qua Google Sign-In SDK. |
| **Gmail SMTP (Spring Mail)** | Dịch vụ gửi email thông báo: Gửi email tự động xác nhận lịch hẹn (kèm mã lịch, tên bác sĩ, giờ khám) và gửi token OTP đặt lại mật khẩu. |
| **SpringDoc Swagger 3.0** | Tự động sinh tài liệu API chuẩn OpenAPI 3.0, hỗ trợ kiểm thử trực tiếp các endpoint tại `/swagger-ui/index.html`. |

---

## 8. DANH MỤC API ENDPOINTS CHÍNH

### 8.1. Authentication & User APIs
- `POST /api/patient/login` - Đăng nhập bệnh nhân
- `POST /api/patient/register` - Đăng ký tài khoản bệnh nhân
- `POST /api/patient/forgot_password` - Gửi mã khôi phục mật khẩu qua Email
- `POST /api/patient/reset_password` - Đặt lại mật khẩu mới
- `POST /api/patient/change_password` - Đổi mật khẩu cá nhân
- `POST /api/doctor/login` - Đăng nhập bác sĩ
- `POST /api/doctor/google-login` - Đăng nhập bác sĩ bằng Google ID Token
- `POST /api/doctor/change_password` - Đổi mật khẩu bác sĩ

### 8.2. Doctor & Schedule APIs
- `GET /api/doctor/all` - Lấy danh sách tất cả bác sĩ
- `GET /api/doctor/{id}` - Lấy thông tin chi tiết bác sĩ
- `PUT /api/doctor/update/{id}` - Cập nhật hồ sơ bác sĩ & địa chỉ phòng khám
- `GET /api/availability/schedule?doctorId={id}` - Lấy lịch làm việc của bác sĩ
- `POST /api/availability/update?doctorId={id}` - Cập nhật lịch làm việc theo thứ
- `GET /api/slots/doctor/{doctorId}?date={date}` - Lấy các khung giờ khám khả dụng trong ngày

### 8.3. Appointment & Payment APIs
- `POST /api/appointment/book` - Đặt lịch khám bệnh mới
- `GET /api/appointment/doctor/{doctorId}` - Lấy danh sách lịch hẹn của bác sĩ
- `GET /api/appointment/patient/{patientId}` - Lấy lịch sử hẹn khám của bệnh nhân
- `GET /api/appointment/doctor/{doctorId}/{appointmentId}` - Xem chi tiết lịch hẹn
- `PUT /api/appointment/reschedule/{id}` - Dời ngày/giờ lịch khám
- `PUT /api/appointment/status/{id}` - Cập nhật trạng thái lịch hẹn (`confirmed`, `completed`, `cancelled`)
- `GET /api/appointment/payment/result` - Webhook xử lý callback thanh toán từ VNPay

### 8.4. Dashboard & Reports APIs
- `GET /dashboard/stats?doctorId={id}` - Lấy các chỉ số KPI thống kê tổng quan
- `GET /dashboard/upcoming?doctorId={id}` - Lấy các lịch hẹn sắp tới
- `GET /dashboard/missed?doctorId={id}` - Lấy các lịch hẹn bị nhỡ
- `GET /api/appointment/stats/monthly?doctorId={id}&year={year}` - Thống kê doanh thu & bệnh nhân 12 tháng
- `GET /api/report/appointment/{id}` - Xuất phiếu khám bệnh dạng file PDF (JasperReports)

### 8.5. AI & Notification APIs
- `POST /api/ai/chat` - Trò chuyện với Trợ lý Y tế AI (kèm bộ nhớ phiên)
- `POST /api/ai/suggest-doctors` - AI phân tích triệu chứng và gợi ý bác sĩ kèm khoảng cách
- `POST /api/rag-chat/ask` - Truy vấn y tế với RAG + Pinecone Vector Store
- `GET /api/notification/doctor/{doctorId}` - Lấy danh sách thông báo của bác sĩ
- `GET /api/notification/doctor/{doctorId}/unread_count` - Lấy số lượng thông báo chưa đọc
- `POST /api/notification/doctor/{doctorId}/mark_all_read` - Đánh dấu tất cả thông báo đã đọc

---

*(Tài liệu được biên soạn tự động dựa trên mã nguồn thực tế của hệ thống MediCare)*
