# 📋 BÁO CÁO TIẾN ĐỘ HOÀN THIỆN: PHÂN HỆ QUẢN TRỊ PHÒNG KHÁM, CẤP TÀI KHOẢN BÁC SĨ & CHUẨN HÓA KIẾN TRÚC

> **Dự án**: Hệ thống Đặt lịch khám bệnh và Quản lý phòng khám trực tuyến (Klinik / MediCare)  
> **Thời gian cập nhật**: 25/10/2026  
> **Trạng thái**: Đã hoàn thiện & Kiểm thử thành công 100%  
> **Phiên bản tài liệu**: 2.0 (Cập nhật phân hệ Quản trị, Cấp tài khoản Bác sĩ, Phân chuyên khoa & Kết nối thông suốt Backend)

---

## 1. TỔNG QUAN YÊU CẦU & BỐI CẢNH

### 1.1. Thực trạng trước khi xử lý
- **Lệch vai trò nghiệp vụ**: Ban đầu hệ thống chỉ có 2 đối tượng là **Bệnh nhân (Patient)** và **Bác sĩ (Doctor)**.
- **Trang Dashboard cá nhân bị nhầm lẫn**: Trang làm việc cá nhân của Bác sĩ bị gán nhãn là "Dashboard" (`/doctor/dashboard`), gây nhầm lẫn là Dashboard quản lý của cả phòng khám.
- **Thiếu phân hệ Admin**: Không có nơi để Ban quản lý phòng khám xem tổng quan KPI, thống kê doanh thu toàn viện, tuyển dụng/thêm bác sĩ mới, cấp tài khoản, phân bổ chuyên khoa hay xóa bác sĩ nghỉ việc. Dữ liệu bác sĩ trước đây bị gán cứng (hardcode) trong cơ sở dữ liệu MySQL.
- **Lỗi điều hướng & bảo mật (UX/Auth Guard)**:
  - Gõ `/doctor` bị đẩy vào form đăng nhập; chưa đăng nhập mà gõ `/doctor/dashboard` thì không bị chặn dẫn tới lỗi dữ liệu do thiếu ID bác sĩ trong phiên làm việc.
  - Các trang Quên mật khẩu / Đặt lại mật khẩu bị lồng nhầm vào bên trong `DoctorLayout` (hiển thị cả sidebar của bác sĩ dù chưa đăng nhập).
  - Thiếu nút chuyển đổi giữa các phân hệ trên thanh Navigation Header và Footer.

### 1.2. Mục tiêu đã thực hiện thành công
- **Bảo toàn nguyên vẹn 100% các phân hệ hiện có**:
  - Phân hệ Bệnh nhân: Đặt lịch, chat AI tư vấn triệu chứng, bản đồ Geocoding tìm bác sĩ gần nhất, thanh toán trực tuyến VNPay, xem lịch sử đặt lịch.
  - Cổng Bác sĩ (Doctor Portal): Xem lịch khám cá nhân hôm nay, tiếp nhận/hoàn thành ca khám, cài đặt lịch làm việc trong tuần, xuất phiếu khám PDF.
- **Xây dựng mới hoàn chỉnh Phân hệ Quản trị Toàn diện (Clinic Admin Dashboard)**:
  - Bảng điều khiển KPI toàn viện (`/admin/dashboard` hoặc `/dashboard`).
  - Giao diện Cấp tài khoản Bác sĩ mới chuẩn hóa 3 phần với Live Preview và Phiếu bàn giao tài khoản (`/admin/doctors/create`).
  - Quản lý danh sách bác sĩ, phân lại chuyên khoa, cấp lại mật khẩu và xóa bác sĩ an toàn (`/admin/doctors`).
  - Quản lý lịch hẹn khám toàn viện (`/admin/appointments`).
  - Quản lý danh bạ hồ sơ bệnh nhân (`/admin/patients`).
  - Kết nối thông suốt với hệ thống REST API Spring Boot và bảo mật mật khẩu bằng thuật toán BCrypt.

---

## 2. MA TRẬN 3 PHÂN HỆ TOÀN DIỆN SAU KHI HOÀN THIỆN

```
                                      HỆ THỐNG PHÒNG KHÁM KLINIK
                                                  │
                ┌─────────────────────────────────┼─────────────────────────────────┐
                ▼                                 ▼                                 ▼
         PHÂN HỆ BỆNH NHÂN               CỔNG BÁC SĨ (PORTAL)           QUẢN TRỊ PHÒNG KHÁM (ADMIN)
         URL: /patient/*                   URL: /doctor/*               URL: /admin/* | /dashboard/*
   • Tìm kiếm bác sĩ & chuyên khoa    • Xem lịch khám cá nhân hôm nay   • KPI thống kê toàn bộ phòng khám
   • Chat Trợ lý AI tư vấn triệu chứng• Tiếp nhận, Khám & Hủy ca khám   • Cấp tài khoản bác sĩ mới chuẩn hóa
   • Bản đồ số tìm phòng khám gần     • Cài đặt ca rảnh hàng tuần       • Điều chuyển & phân chuyên khoa bác sĩ
   • Đặt lịch hẹn & Thanh toán VNPay  • Xuất phiếu khám bệnh PDF        • Cấp lại mật khẩu (Reset Password)
   • Quản lý lịch sử, dời lịch hẹn    • Thông báo lịch khám realtime    • Lọc & Giám sát lịch hẹn toàn viện
   • Đăng ký, đăng nhập bảo mật       • Đổi mật khẩu cá nhân bác sĩ     • Quản lý danh bạ hồ sơ bệnh nhân
```

---

## 3. CHI TIẾT CÁC HẠNG MỤC ĐÃ TRIỂN KHAI

### 3.1. Frontend: Phân hệ Quản trị Phòng khám (Clinic Admin Dashboard)

| STT | Tập tin | Đường dẫn (URL) | Chức năng chi tiết |
|:---:|:---|:---|:---|
| 1 | [`AdminLayout.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/layout/AdminLayout.jsx) | `/admin/*` | Khung giao diện quản trị chuẩn Slate-900 / Blue-600; Sidebar thu gọn thông minh; Phím tắt chuyển nhanh sang Cổng Bác sĩ và Website người dùng; Menu điều hướng tinh gọn 4 phân hệ cốt lõi. |
| 2 | [`AdminDashboard.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/admin/AdminDashboard.jsx) | `/admin/dashboard`<br>`/dashboard` | **KPI Cards**: Tổng bác sĩ, Tổng chuyên khoa, Tổng ca khám, Bệnh nhân, Doanh thu ước tính.<br>**Tiến độ**: Thanh phân bố tỷ lệ ca khám *(Chờ duyệt, Đã duyệt, Đã khám, Đã hủy)*.<br>**Lối tắt**: Nút "Cấp Tài Khoản Bác Sĩ" (kích hoạt mở Dialog) và "Danh Sách Bác Sĩ". |
| 3 | [`AdminDoctors.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/admin/AdminDoctors.jsx) | `/admin/doctors`<br>`/dashboard/doctor`<br>`/dashboard/doctors` | **Bảng danh sách bác sĩ & Dialog Cấp tài khoản / Upload ảnh tại chỗ**:<br>• **Dialog Cấp Tài Khoản Mới**: Mở trực tiếp ngay trong trang, không cần chuyển hướng trang.<br>• **Chọn ảnh từ máy tính / thiết bị**: Tải ảnh avatar trực tiếp từ máy tính (`<input type="file">`), tự động upload lên server và hiển thị preview tức thì.<br>• **Sinh mật khẩu tự động & Bàn giao**: Nút random mật khẩu; Phiếu bàn giao tài khoản với nút 1-click Copy.<br>• **Modal Sửa & Đổi ảnh & Chuyên khoa**: Cập nhật thông tin, đổi chuyên khoa và đổi ảnh đại diện từ máy tính.<br>• **Modal Cấp lại mật khẩu**: Đổi mật khẩu tài khoản bác sĩ nhanh chóng.<br>• **Xóa Bác sĩ**: Hộp thoại an toàn có xử lý ràng buộc lịch hẹn. |
| 4 | [`AdminAppointments.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/admin/AdminAppointments.jsx) | `/admin/appointments` | Theo dõi và rà soát mọi ca khám bệnh của tất cả các chuyên khoa; Lọc theo trạng thái và tìm kiếm theo tên bệnh nhân / bác sĩ phụ trách. |
| 5 | [`AdminPatients.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/admin/AdminPatients.jsx) | `/admin/patients` | Quản lý danh bạ hồ sơ bệnh nhân đã đăng ký trên hệ thống, email, SĐT, địa chỉ. |
| 6 | [`adminService.js`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/service/adminService.js) | N/A | Tầng Axios Service xử lý gọi các API quản trị từ backend Spring Boot (cấp tài khoản, upload avatar, cập nhật, đổi mật khẩu, xóa bác sĩ, tải chuyên khoa...). |

---

### 3.2. Frontend: Chuẩn hóa Điều hướng & Điểm liên kết (Routing & UX)

- **Cấu hình Routes trong [`main.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/main.jsx)**:
  - Khởi tạo cụm route `/admin` độc lập bọc bởi `AdminLayout`.
  - Hỗ trợ bí danh URL thông minh: Gõ `/dashboard`, `/dashboard/doctor`, `/dashboard/create-doctor` đều tự động điều hướng chính xác.
  - Tách các trang Quên mật khẩu & Đổi mật khẩu của bác sĩ ra ngoài `DoctorLayout` (trở thành trang xác thực độc lập, không còn bị dính thanh sidebar).
  - Bổ sung route chính thức `/doctor/login` và cơ chế `DoctorIndexRedirect`.
- **Bảo vệ tuyến đường trong [`DoctorLayout.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/page/layout/DoctorLayout.jsx)**:
  - Bổ sung **Auth Guard**: Tự động chuyển hướng về `/doctor/login` nếu chưa đăng nhập.
  - Thêm nút liên kết **"Về trang phòng khám"** trên Sidebar bác sĩ.
- **Bổ sung lối vào trên Header & Footer**:
  - [`Header.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/component/Header.jsx): Thêm 2 nút bấm riêng biệt: **"Cổng Bác sĩ"** và **"Quản trị Phòng khám"** ở góc trên cùng.
  - [`Footer.jsx`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/frontend/src/component/Footer.jsx): Bổ sung liên kết nhanh tới cả 2 cổng quản lý.

---

### 3.3. Backend: Nâng cấp Spring Boot REST API

| Endpoint | Phương thức | Lớp xử lý | Chức năng chi tiết |
|:---|:---:|:---|:---|
| `/api/doctor/create` | `POST` | `DoctorController`<br>`DoctorService` | Cấp tài khoản bác sĩ mới vào CSDL; kiểm tra trùng email; mã hóa mật khẩu `BCrypt`; liên kết khóa ngoại với `Specialty`; gán tọa độ mặc định. |
| `/api/doctor/admin/{id}` | `PUT` | `DoctorController`<br>`DoctorService` | Admin cập nhật thông tin bác sĩ & phân lại chuyên khoa công tác. |
| `/api/doctor/admin/{id}/reset-password` | `PUT` | `DoctorController`<br>`DoctorService` | Admin cấp lại mật khẩu mới cho bác sĩ mà không cần biết mật khẩu cũ. |
| `/api/doctor/{id}` | `DELETE` | `DoctorController`<br>`DoctorService` | Xóa bác sĩ khỏi CSDL theo ID có xử lý ràng buộc toàn vẹn dữ liệu. |
| `/api/doctor/all` | `GET` | `DoctorController`<br>`DoctorService` | Lấy danh sách toàn bộ bác sĩ công tác tại phòng khám kèm chuyên khoa. |
| `/api/specialty/all` | `GET` | `SpecialtyController`<br>`SpecialtyService` | Lấy danh sách toàn bộ các chuyên khoa để phân công cho bác sĩ. |
| `/api/appointment/all` | `GET` | `AppointmentController`<br>`AppointmentService` | Lấy toàn bộ lịch hẹn khám trong toàn hệ thống phục vụ Admin Dashboard. |
| `/api/appointment/admin/{id}/status` | `PUT` | `AppointmentController`<br>`AppointmentService` | Admin trực tiếp duyệt, hoàn tất hoặc hủy lịch khám bệnh của mọi chuyên khoa. |
| `/api/patient/all` | `GET` | `PatientController`<br>`PatientService` | Lấy danh sách toàn bộ hồ sơ bệnh nhân đã đăng ký. |
| `/api/patient/admin/{id}` | `DELETE` | `PatientController`<br>`PatientService` | Admin xóa hồ sơ bệnh nhân khỏi hệ thống có kiểm tra an toàn dữ liệu lịch hẹn. |
| `/api/upload/image` | `POST` | `UploadController`<br>`WebMvcConfig` | Tải ảnh avatar từ máy tính người dùng; lưu vào thư mục `uploads/` và đồng bộ `public/uploads/`; phục vụ tĩnh trực tiếp. |

---

## 4. KẾT QUẢ KIỂM THỬ THỰC TẾ & ĐỘ ỔN ĐỊNH

| Hạng mục kiểm thử | Kịch bản kiểm thử | Kết quả thực tế | Trạng thái |
|:---|:---|:---|:---:|
| **Biên dịch Frontend** | Thực thi lệnh `npm run build` với Vite | Built in 1.13s, 158 modules transformed, 0 lỗi cú pháp | **PASS** ✅ |
| **Biên dịch Backend** | Thực thi lệnh `./mvnw compile` với Maven | `BUILD SUCCESS`, 71 source files biên dịch hoàn tất | **PASS** ✅ |
| **Cấp tài khoản Bác sĩ** | Tạo bác sĩ mới từ giao diện `/admin/doctors/create` | Lưu thành công vào MySQL, mật khẩu được băm BCrypt | **PASS** ✅ |
| **Đăng nhập Bác sĩ mới** | Đăng nhập tại `/doctor/login` với tài khoản vừa tạo | Đăng nhập thành công, nhận JWT/Session vào Cổng Bác sĩ | **PASS** ✅ |
| **Cập nhật & Phân khoa** | Đổi chuyên khoa từ Tim mạch sang Nội khoa qua Modal | CSDL cập nhật ngay lập tức, hiển thị đúng trên danh sách | **PASS** ✅ |
| **Cấp lại mật khẩu** | Admin reset mật khẩu cho bác sĩ qua popup | Đổi mật khẩu thành công, bác sĩ login được với pass mới | **PASS** ✅ |
| **Xóa Bác sĩ** | Xóa bác sĩ thử nghiệm và kiểm tra ràng buộc | Xóa an toàn nếu chưa có lịch khám, báo lỗi nếu có lịch | **PASS** ✅ |
| **Hiển thị KPI Admin** | Kiểm tra các thẻ tổng quan phòng khám | Hiển thị chính xác số bác sĩ, chuyên khoa, lịch hẹn | **PASS** ✅ |

---

## 5. HƯỚNG DẪN TRUY CẬP & BÀN GIAO SỬ DỤNG

| Phân hệ | Đường dẫn truy cập | Hướng dẫn sử dụng |
|:---|:---|:---|
| **Cấp Tài Khoản Bác Sĩ Mới** | [`http://localhost:5173/admin/doctors/create`](http://localhost:5173/admin/doctors/create) | Điền thông tin bác sĩ, chọn chuyên khoa, bấm "Cấp Tài Khoản" và bấm "Sao chép thông tin" để gửi bác sĩ. |
| **Quản Lý Bác Sĩ & Đổi Chuyên Khoa** | [`http://localhost:5173/admin/doctors`](http://localhost:5173/admin/doctors) | Xem danh sách, tìm kiếm, bấm nút Sửa để đổi chuyên khoa hoặc nút Chìa khóa để cấp lại mật khẩu. |
| **Bảng Điều Khiển Quản Trị Toàn Viện** | [`http://localhost:5173/admin/dashboard`](http://localhost:5173/admin/dashboard) | Giám sát toàn bộ KPI, doanh thu và tiến độ các ca khám của cả phòng khám. |
| **Lịch Hẹn Toàn Viện** | [`http://localhost:5173/admin/appointments`](http://localhost:5173/admin/appointments) | Xem và lọc mọi ca khám trong hệ thống. |
| **Cổng Bác Sĩ (Doctor Portal)** | [`http://localhost:5173/doctor/login`](http://localhost:5173/doctor/login) | Dành cho Bác sĩ tiếp nhận ca khám, quản lý lịch trực.<br>Tài khoản mẫu: `bs.a@example.com` / `password123` |
| **Trang Chủ Bệnh Nhân** | [`http://localhost:5173/patient/home`](http://localhost:5173/patient/home) | Trải nghiệm đặt lịch khám, trợ lý AI và thanh toán VNPay. |

---

## 6. TÁI CẤU TRÚC CLEAN ARCHITECTURE: PHÂN TRANG (PAGINATION), COMPONENT & CONTEXT

Nhằm tối ưu hóa hiệu năng, khả năng mở rộng và tuân thủ các nguyên lý **Clean Code / Separation of Concerns (SoC)**, toàn bộ phân hệ Admin đã được tái cấu trúc triệt để:

### 6.1. Quản lý trạng thái tập trung với `AdminContext` (`frontend/src/context/AdminContext.jsx`)
- **Tập trung hóa State**: Đưa toàn bộ danh sách Bác sĩ, Chuyên khoa, Lịch hẹn, Bệnh nhân và các chỉ số thống kê (KPIs) về một Store duy nhất.
- **Tối ưu hóa Network**: Loại bỏ tình trạng fetch trùng lặp nhiều lần khi chuyển đổi qua lại giữa các trang Dashboard, Doctors, Appointments và Patients.
- **Real-time Sync**: Khi thêm/sửa/xóa bác sĩ hoặc cập nhật trạng thái lịch hẹn ở bất kỳ component con nào, toàn bộ hệ thống (gồm cả các badge counter trên Sidebar navigation) tự động đồng bộ tức thì.
- **Custom Hook `useAdmin()`**: Cung cấp giao diện truy cập state và methods trực quan, rõ ràng cho mọi component.

### 6.2. Bộ điều khiển phân trang dùng chung (`Pagination.jsx`)
- **Vị trí**: `frontend/src/component/common/Pagination.jsx`
- **Tính năng nổi bật**:
  - Hỗ trợ chuyển trang: Trang đầu (`<<`), Trước (`<`), các nút số trang có dấu rút gọn (`...`), Sau (`>`), Trang cuối (`>>`).
  - Chọn số dòng trên mỗi trang (*Page Size Selector*: 5, 10, 20, 50 dòng/trang).
  - Tự động nhảy về trang 1 khi người dùng gõ từ khóa tìm kiếm hoặc lọc chuyên khoa/trạng thái.
  - Hiển thị văn bản tóm tắt thân thiện: *"Hiển thị X - Y trong tổng số Z mục"*.
  - Tích hợp đồng bộ trên 3 trang quản lý chính: Bác sĩ (`AdminDoctors`), Lịch hẹn (`AdminAppointments`) và Bệnh nhân (`AdminPatients`).

### 6.3. Tách nhỏ Component chuyên biệt (Clean Architecture)
Thay vì nhồi nhét mã nguồn vào các file lớn (trước đây `AdminDoctors.jsx` dài hơn 1.040 dòng), toàn bộ giao diện đã được phân tách thành các component độc lập:
1. `StatCard.jsx`: Hiển thị thẻ thống kê KPI với thanh gradient, biểu tượng sinh động và nhãn xu hướng.
2. `DoctorTable.jsx`: Hiển thị danh sách bác sĩ kèm chuyên khoa, avatar, liên hệ, mức phí và các nút thao tác.
3. `DoctorCreateModal.jsx`: Hộp thoại cấp tài khoản bác sĩ, chọn ảnh avatar từ máy tính, bộ sinh mật khẩu ngẫu nhiên và phân khoa.
4. `DoctorVoucherModal.jsx`: Hộp thoại bàn giao tài khoản với nút 1-click sao chép thông tin đăng nhập.
5. `DoctorEditModal.jsx`: Hộp thoại chỉnh sửa thông tin, đổi chuyên khoa và đổi ảnh đại diện.
6. `DoctorResetPasswordModal.jsx`: Hộp thoại cấp lại mật khẩu nhanh cho bác sĩ.
7. `AppointmentTable.jsx`: Bảng quản lý lịch hẹn toàn viện, hiển thị trạng thái và dropdown đổi trạng thái trực tiếp.
8. `PatientTable.jsx`: Bảng danh bạ hồ sơ bệnh nhân kèm thao tác xóa và tìm kiếm.

---

## 7. PHÂN HỆ HỒ SƠ BỆNH ÁN & TOA THUỐC ĐIỆN TỬ (ELECTRONIC HEALTH RECORD - EHR)

> **Cập nhật ngày 02/11/2026**: Hoàn thành toàn diện luồng nghiệp vụ từ Người dùng Đặt lịch -> Bác sĩ Khám bệnh toàn diện -> Lưu Hồ Sơ Bệnh Án -> Bệnh nhân & Bác sĩ Xem/In Bệnh án & Đơn thuốc.

### 7.1. Cơ sở dữ liệu MySQL (`medical_record`)
- Đã tạo bảng `medical_record` liên kết 1-1 với `appointment(id)` và khóa ngoại tới `patient(id)`, `doctor(id)`.
- Các trường chuẩn hóa y khoa:
  - **Chỉ số sinh hiệu**: `blood_pressure` (Huyết áp), `heart_rate` (Nhịp tim), `temperature` (Thân nhiệt), `weight` (Cân nặng), `height` (Chiều cao), `clinical_symptoms` (Triệu chứng lâm sàng).
  - **Chẩn đoán y khoa**: `diagnosis` (Chẩn đoán chính), `lab_results` (Kết quả xét nghiệm / Cận lâm sàng).
  - **Đơn thuốc điều trị**: `prescriptions` (JSON array: Tên thuốc, số lượng, đơn vị, liều dùng, ghi chú uống thuốc).
  - **Lời dặn & Tái khám**: `doctor_advice` (Lời dặn dò dinh dưỡng, sinh hoạt), `follow_up_date` (Ngày hẹn tái khám).
  - **Trạng thái & Thời gian**: `status` (`completed` / `draft`), `created_at`, `updated_at`.

### 7.2. Backend Spring Boot (REST API)
- Entity: `MedicalRecord.java`
- DTO: `MedicalRecordDTO.java`
- Repository: `MedicalRecordRepository.java`
- Service: `MedicalRecordService.java` (Tự động cập nhật `appointment.status = 'completed'` và đánh dấu thanh toán `paid` khi hoàn tất bệnh án).
- Controller: `MedicalRecordController.java` (`/api/medical-record`):
  - `POST /api/medical-record`: Lưu hoặc cập nhật bệnh án.
  - `GET /api/medical-record/appointment/{appointmentId}`: Lấy bệnh án theo ca khám.
  - `GET /api/medical-record/patient/{patientId}`: Lấy lịch sử bệnh án của bệnh nhân.
  - `GET /api/medical-record/doctor/{doctorId}`: Lấy danh sách bệnh án do bác sĩ phụ trách.

### 7.3. Frontend (Giao diện Bệnh nhân & Bác sĩ)
1. **Bệnh nhân Đặt Lịch (`BookingPage.jsx`)**:
   - Thêm nút lựa chọn hình thức khám: **Khám Tổng Quát** (đầy đủ sinh hiệu & kiểm tra toàn diện), **Khám Chuyên Khoa**, **Tái Khám Định Kỳ**.
2. **Bác sĩ Khám Bệnh (`AppointmentDetailPage.jsx`)**:
   - Phân hệ khám bệnh đa năng 4 bước chuẩn y khoa:
     - *Bước 1*: Nhập sinh hiệu (Huyết áp, Mạch, Thân nhiệt, Cân nặng, Chiều cao) -> **Tự động tính BMI & phân loại màu sắc real-time**.
     - *Bước 2*: Nhập kết quả xét nghiệm / Cận lâm sàng & Kết luận Chẩn đoán bệnh.
     - *Bước 3*: Kê đơn thuốc tương tác linh hoạt: Thêm/xóa thuốc, chọn nhanh từ kho thuốc thông dụng (Paracetamol, Amoxicillin, Omeprazole, Vitamin C, Alpha Choay...).
     - *Bước 4*: Lời dặn dò dinh dưỡng & Chọn ngày hẹn tái khám.
   - Thao tác: **"Hoàn Thành Ca Khám & Lưu Bệnh Án"** hoặc **"Lưu Nháp"**.
3. **Xem & In Bệnh Án Điện Tử (`MedicalRecordModal.jsx`)**:
   - Modal hiển thị bệnh án chuẩn quốc tế với huy hiệu phân loại BMI, bảng sinh hiệu trực quan, bảng đơn thuốc chi tiết và chữ ký bác sĩ.
   - Tích hợp tính năng In bệnh án / Xuất phiếu khám chuẩn giấy A4 (`window.print()`).
4. **Bệnh nhân Xem Lịch Sử Khám (`BookingHistoryPage.jsx`)**:
   - Bổ sung nút **"Bệnh án"** tại bảng lịch sử cho mọi ca khám đã hoàn thành (`completed`).
   - Mở trực tiếp Modal Hồ Sơ Bệnh Án & Toa Thuốc cho bệnh nhân xem lại phác đồ điều trị và in mang ra nhà thuốc.

---

## 8. PHÂN HỆ AI TƯ VẤN SÀNG LỌC & PHÂN LUỒNG CHUYÊN KHOA THÔNG MINH (AI CLINICAL TRIAGE & SPECIALTY CRM)

> **Cập nhật ngày 03/11/2026**: Hoàn thiện toàn diện trợ lý AI tư vấn sức khỏe, tự động phân tích triệu chứng lâm sàng, khuyến nghị chuyên khoa cần khám, đưa ra 3 hướng xử lý chuẩn y khoa và câu hỏi sàng lọc; toàn bộ từ khóa bệnh lý và quy tắc điều hướng được tách thành tệp JSON CRM độc lập.

### 8.1. Tệp Tri Thức JSON CRM Độc Lập
- **Vị trí tệp**:
  - Backend: `backend/src/main/resources/data/medical_specialty_crm_rules.json`
  - Frontend: `frontend/src/data/medicalSpecialtyDictionary.json`
- **Ý nghĩa kiến trúc**: Tách biệt hoàn toàn tri thức bệnh lý, từ khóa triệu chứng và các câu hỏi sàng lọc ra khỏi mã nguồn nghiệp vụ. Cho phép đội ngũ y tế hoặc quản trị viên mở rộng từ khóa, bổ sung chuyên khoa mới mà không cần biên dịch lại mã nguồn hệ thống.
- **Dữ liệu chuẩn hóa gồm 5 chuyên khoa cốt lõi**:
  1. `Nội khoa` (Mã: `INTERNAL_MED`): Từ khóa mất ngủ, khó ngủ, đau đầu, migraine, mệt mỏi, suy nhược, chóng mặt, tiền đình, sốt nhẹ, tê bì tay chân...
  2. `Tim mạch` (Mã: `CARDIOLOGY`): Từ khóa đau ngực, tức ngực, hồi hộp, đánh trống ngực, tim đập nhanh, khó thở, tăng huyết áp, phù chân...
  3. `Tai Mũi Họng` (Mã: `ENT`): Từ khóa đau họng, rát họng, nuốt đau, ho khan, ho đờm, nghẹt mũi, viêm mũi, đau xoang, ù tai...
  4. `Da liễu` (Mã: `DERMATOLOGY`): Từ khóa ngứa da, mề đay, dị ứng da, phát ban, nổi mụn, mụn bọc, chàm, vảy nến, zona...
  5. `Nhi khoa` (Mã: `PEDIATRICS`): Từ khóa trẻ em, bé sốt, sốt ở trẻ, lười ăn, biếng ăn, nôn trớ, quấy khóc, thở khò khè, tay chân miệng...

### 8.2. Backend Spring Boot (`MedicalTriageService` & `AiController`)
- **Tập tin tạo mới**: `MedicalTriageService.java`, `TriageConsultRequestDTO.java`, `TriageConsultResponseDTO.java`, `SpecialtyRecommendationDTO.java`.
- **Cập nhật**: `AiController.java` (`POST /api/ai/triage-consult` và `GET /api/ai/crm-rules`).
- **Động cơ phân tích lai (Hybrid Engine)**:
  1. *Khớp từ khóa CRM*: Đối chiếu tin nhắn người dùng với hệ thống từ khóa & bí danh chuyên khoa trong JSON, tính điểm `matchScore` (65% - 98%).
  2. *Kiểm tra dấu hiệu khẩn cấp*: Tự động phát hiện các từ khóa cấp cứu (VD: liệt nửa người, co giật, ngất xỉu, đau ngực kéo dài > 15 phút, vã mồ hôi lạnh...) để gắn nhãn `EMERGENCY` và hiển thị cảnh báo đỏ.
  3. *Tích hợp OpenRouter AI API Key*:
      - Cấu hình an toàn biến môi trường `OPENROUTER_API_KEY` qua file `.env`.
     - Cấu hình chuỗi định tuyến mô hình thông minh:
       - **Ưu tiên 1**: `google/gemma-4-26b-a4b-it:free` (Model Google Gemma theo yêu cầu).
       - **Ưu tiên 2**: `nvidia/nemotron-3-ultra-550b-a55b:free` (Model siêu lớn 550B của NVIDIA, hoạt động ổn định khi Google bị giới hạn hàng đợi 429).
       - **Ưu tiên 3**: `dots-studio/dots-3-note-preview:free`.
     - **Cơ chế Fallback thông minh (Zero-Downtime CRM Fallback)**: Trường hợp toàn bộ các mô hình AI trực tuyến bị nghẽn hàng đợi (429 Too Many Requests / 503 Service Unavailable / Timeout), hệ thống tự động và êm dịu chuyển sang sử dụng bộ quy tắc chuẩn từ điển CRM ([`medical_specialty_crm_rules.json`](file:///Users/m1lt43/Desktop/DoAnChuyennganh/medical-appointment/backend/src/main/resources/data/medical_specialty_crm_rules.json)) mà không bao giờ báo lỗi hệ thống.
  4. *Tự động liên kết Bác sĩ*: Tự động truy vấn danh sách bác sĩ chuyên khoa tương ứng trong cơ sở dữ liệu (`doctorService.getDoctorsBySpecialtyId`) đính kèm phản hồi.

### 8.3. Frontend: Giao Diện Trợ Lý AI Nâng Cao (`AssistantAI.jsx`)
- **Đường dẫn truy cập**:
  - Trang độc lập: `/patient/ai-consult` (đã gắn liên kết nổi bật `🤖 Tư Vấn AI` trên NavBar và Banner CTA Trang chủ).
  - Khung hội thoại nhúng: `/patient/support` (Hỗ trợ trực tuyến).
  - Phím chuyển nhanh tại trang Gợi ý bác sĩ: `/patient/ai-suggest`.
- **Cấu trúc phản hồi trực quan theo 4 khối chuẩn mực**:
  - 🩺 **Khối 1: AI Phân Tích Vấn Đề**: Phân tích lâm sàng thực tế sinh động từ mô hình AI LLM (hoặc từ điển CRM khi ngoại tuyến).
  - 🏥 **Khối 2: Đề Xuất Chuyên Khoa Phù Hợp**: Huy hiệu chuyên khoa, thanh điểm khớp triệu chứng (VD: 95% Khớp), giải thích lý do chuyên môn và nút bấm *"Đặt khám khoa này"*.
  - 💡 **Khối 3: AI Đề Xuất 3 Hướng Xử Lý**: Thẻ đánh số 1-2-3 hướng dẫn điều chỉnh sinh hoạt, theo dõi triệu chứng và khi nào cần khám trực tiếp.
  - ❓ **Khối 4: AI Hỏi Thêm Để Tư Vấn Chính Xác Hơn**: Các nút bấm tương tác chứa câu hỏi sàng lọc gợi ý; bệnh nhân chỉ cần click là câu hỏi được tự động gửi vào khung chat.
  - 👨‍⚕️ **Khối 5: Bác Sĩ Tiêu Biểu Thuộc Khoa**: Thẻ thông tin bác sĩ (ảnh, tên, giá khám, năm kinh nghiệm) kèm nút *"Đặt lịch ngay"* chuyển thẳng sang trang Booking.
- **Tính năng mở rộng**:
  - **Huy hiệu nguồn phân tích**: Nhãn `✨ AI LLM Online` (khi phân tích qua API Key) và `📖 CRM Knowledge Base` (khi dùng dự phòng).
  - **Thanh chip triệu chứng nhanh**: Bấm 1-click các tình huống phổ biến (Mất ngủ đau đầu, Đau ngực tim đập nhanh, Đau rát họng, Ngứa da dị ứng, Bé sốt quấy khóc).
  - **Modal Từ Điển CRM Tri Thức Y Khoa**: Xem danh mục toàn bộ chuyên khoa, từ khóa triệu chứng, bệnh lý liên quan và 3 hướng xử lý trích xuất trực tiếp từ file JSON độc lập.

### 8.4. Kết Quả Kiểm Thử Thực Tế (Live Verified with OpenRouter API)
- **Kịch bản kiểm thử**:
  - *Input*: `"Tôi thường xuyên mất ngủ, đau đầu và cảm thấy mệt mỏi. Tôi nên làm gì?"`
  - *Kết quả trả về*:
    ```json
    {
      "analysis": "**Phân tích:** Triệu chứng mất ngủ kéo dài, đau đầu và mệt mỏi thường có liên quan chặt chẽ với **rối loạn chức năng thần kinh tự chủ do căng thẳng, lo âu** hoặc **hội chứng mệt mỏi mãn tính**; tuy nhiên cần loại trừ các nguyên nhân nội khoa tiềm ẩn như rối loạn tuyến giáp, thiếu máu, hoặc huyết áp không ổn định.\n\n**Lời khuyên:** Bạn nên đến khám **Nội khoa** để kiểm tra huyết áp, xét nghiệm máu (CBC, TSH, chức năng gan/thận) và đánh giá tâm thần. Hiện tại, hãy ưu tiên ngủ trước 23h, hạn chế caffeine/manh hàn sau 15h, tập thể dục nhẹ nhàng 30 phút/ngày và áp dụng kỹ thuật thư giãn (thở sâu, thiền) trước khi ngủ.",
      "recommendedSpecialties": [
        {
          "specialtyId": 1,
          "specialtyName": "Nội khoa",
          "departmentCode": "INTERNAL_MED",
          "matchScore": 95,
          "reason": "Các triệu chứng nhận diện (mất ngủ, đau đầu, mệt mỏi) phù hợp nhất với phạm vi chẩn đoán và điều trị của Chuyên khoa Nội khoa."
        }
      ],
      "consultationSource": "AI_LLM_ONLINE",
      "aiModelUsed": "nvidia/nemotron-3-ultra-550b-a55b:free"
    }
    ```
- **Xác thực tự động chuyển mạch (Auto-Routing & Fallback)**:
  - Khi `google/gemma-4-26b-a4b-it:free` bị nghẽn hàng đợi (429 upstream rate limit), OpenRouter tự động điều hướng sang `nvidia/nemotron-3-ultra-550b-a55b:free` tạo phản hồi thành công trong 1.8 giây.
  - Khi ngắt kết nối mạng hoặc toàn bộ model AI free bận, hệ thống tự động dùng tri thức CRM với nguồn `CRM_RULES_OFFLINE` bảo đảm 100% thời gian hoạt động.
