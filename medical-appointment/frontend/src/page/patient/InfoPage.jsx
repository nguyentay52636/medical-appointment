import React, { useContext, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { PatientContext } from "../../context/PatientContext";
import PatientService from "../../service/patientService";
import { useToast } from "../../context/ToastContext";

export default function PatientInfo() {
  const { patient, updatePatientInfo } = useContext(PatientContext);
  const { success: showToastSuccess, error: showToastError, warning: showToastWarning } = useToast();
  const navigate = useNavigate();

  // Đọc thông tin từ Context hoặc trực tiếp từ SessionStorage để đảm bảo luôn có dữ liệu
  const getInitialPatient = () => {
    if (patient) return patient;
    try {
      const stored = sessionStorage.getItem("patient");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  };

  const initialPatient = getInitialPatient();
  const [activePatient, setActivePatient] = useState(initialPatient);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submittingInfo, setSubmittingInfo] = useState(false);
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const [formData, setFormData] = useState({
    fullName: initialPatient?.fullName || "",
    email: initialPatient?.email || "",
    phoneNumber: initialPatient?.phoneNumber || "",
    address: initialPatient?.address || "",
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Kiểm tra đăng nhập và tự động nạp dữ liệu mới nhất từ CSDL
  useEffect(() => {
    const current = patient || getInitialPatient();

    if (!current || !current.id) {
      showToastWarning("Yêu cầu đăng nhập", "Vui lòng đăng nhập để xem và cập nhật hồ sơ cá nhân của bạn.");
      navigate("/patient/login", { replace: true });
      return;
    }

    setActivePatient(current);
    setFormData({
      fullName: current.fullName || "",
      email: current.email || "",
      phoneNumber: current.phoneNumber || "",
      address: current.address || "",
    });

    // Đồng bộ dữ liệu mới nhất từ Backend MySQL
    const fetchFreshProfile = async () => {
      setLoadingProfile(true);
      try {
        const freshData = await PatientService.getPatientById(current.id);
        if (freshData) {
          setActivePatient(freshData);
          setFormData({
            fullName: freshData.fullName || "",
            email: freshData.email || "",
            phoneNumber: freshData.phoneNumber || "",
            address: freshData.address || "",
          });
          updatePatientInfo(freshData);
        }
      } catch (err) {
        console.warn("Không thể tải thông tin mới từ server, sử dụng dữ liệu phiên làm việc:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchFreshProfile();
  }, [patient?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  // Cập nhật thông tin cá nhân
  const handleSubmitInfo = async (e) => {
    e.preventDefault();

    if (!activePatient?.id) {
      showToastError("Lỗi phiên làm việc", "Không tìm thấy mã bệnh nhân. Vui lòng đăng nhập lại.");
      navigate("/patient/login");
      return;
    }

    if (!formData.fullName.trim()) {
      showToastWarning("Thiếu thông tin", "Họ và tên không được để trống!");
      return;
    }

    setSubmittingInfo(true);
    try {
      const updated = await PatientService.updatePatient(activePatient.id, formData);
      updatePatientInfo(updated);
      setActivePatient(updated);
      showToastSuccess("Cập nhật thành công!", "Thông tin cá nhân của bạn đã được cập nhật trên toàn hệ thống.");
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data === "Số điện thoại đã tồn tại"
        ? "Số điện thoại này đã được tài khoản khác sử dụng, vui lòng nhập số khác!"
        : err.response?.data?.message || "Cập nhật thông tin thất bại. Vui lòng kiểm tra lại.";
      showToastError("Cập nhật thất bại", errMsg);
    } finally {
      setSubmittingInfo(false);
    }
  };

  // Đổi mật khẩu tài khoản
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!activePatient?.id) {
      showToastError("Lỗi phiên làm việc", "Không tìm thấy tài khoản. Vui lòng đăng nhập lại.");
      navigate("/patient/login");
      return;
    }

    if (!passwordData.oldPassword) {
      showToastWarning("Thiếu dữ liệu", "Vui lòng nhập mật khẩu hiện tại của bạn.");
      return;
    }

    if (passwordData.newPassword.length < 6) {
      showToastWarning("Mật khẩu quá ngắn", "Mật khẩu mới phải có độ dài ít nhất 6 ký tự.");
      return;
    }

    if (passwordData.newPassword === passwordData.oldPassword) {
      showToastWarning("Mật khẩu trùng lặp", "Mật khẩu mới không được trùng với mật khẩu cũ.");
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToastWarning("Mật khẩu không khớp", "Xác nhận mật khẩu mới không trùng khớp. Vui lòng nhập lại.");
      return;
    }

    setSubmittingPassword(true);
    try {
      await PatientService.changePassword(activePatient.id, {
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      });

      showToastSuccess("Đổi mật khẩu thành công!", "Mật khẩu mới đã được kích hoạt. Hãy ghi nhớ cho lần đăng nhập tới.");
      setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      console.error(err);
      const errMsg = typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.";
      showToastError("Đổi mật khẩu thất bại", errMsg);
    } finally {
      setSubmittingPassword(false);
    }
  };

  const patientInitials = (formData.fullName || activePatient?.fullName || "B")
    .trim()
    .split(" ")
    .slice(-1)[0][0]?.toUpperCase() || "P";

  return (
    <div className="min-h-screen bg-slate-50/70 pb-16">
      {/* Breadcrumb điều hướng */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5">
          <nav className="flex items-center text-xs text-slate-500 space-x-2">
            <Link to="/patient/home" className="hover:text-blue-600 transition flex items-center gap-1">
              <i className="fas fa-home"></i>
              <span>Trang chủ</span>
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Hồ sơ cá nhân & Tài khoản</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        
        {/* ================= HERO PROFILE BANNER ================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-5 text-center md:text-left">
            {/* Avatar chữ cái */}
            <div className="relative">
              <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-blue-500/25 border-2 border-white">
                {patientInitials}
              </div>
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-white text-[10px]" title="Đang hoạt động">
                <i className="fas fa-check"></i>
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                  <i className="fas fa-user-shield mr-1"></i> Bệnh nhân chính thức
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Mã BN: #{activePatient?.id || "---"}
                </span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                {formData.fullName || activePatient?.fullName || "Bệnh nhân"}
              </h1>
              <p className="text-xs text-slate-500 flex items-center justify-center md:justify-start gap-3">
                <span><i className="far fa-envelope text-slate-400 mr-1"></i> {formData.email || activePatient?.email || "---"}</span>
                <span>•</span>
                <span><i className="fas fa-phone text-slate-400 mr-1"></i> {formData.phoneNumber || activePatient?.phoneNumber || "Chưa cập nhật SĐT"}</span>
              </p>
            </div>
          </div>

          {/* Lối tắt chức năng nhanh */}
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to="/patient/booking_history"
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition flex items-center gap-1.5"
            >
              <i className="fas fa-calendar-check text-blue-600"></i>
              <span>Lịch Sử Đặt Khám</span>
            </Link>
            <Link
              to="/patient/doctor_list"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-sm shadow-blue-500/25 flex items-center gap-1.5"
            >
              <i className="fas fa-plus"></i>
              <span>Đặt Lịch Mới</span>
            </Link>
          </div>
        </div>

        {/* ================= HAI CỘT THÔNG TIN VÀ ĐỔI MẬT KHẨU ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* CỘT TRÁI (7/12): CẬP NHẬT THÔNG TIN CÁ NHÂN */}
          <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-base">
                  <i className="fas fa-id-card"></i>
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Cập Nhật Thông Tin Cá Nhân
                  </h2>
                  <p className="text-[11px] text-slate-500">Thông tin sử dụng để lập hồ sơ khám và đơn thuốc</p>
                </div>
              </div>
              {loadingProfile && (
                <span className="text-[11px] text-blue-600 font-semibold flex items-center gap-1">
                  <i className="fas fa-spinner fa-spin"></i> Đang đồng bộ...
                </span>
              )}
            </div>

            <form onSubmit={handleSubmitInfo} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Họ và tên đầy đủ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="far fa-user text-xs"></i>
                  </span>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="Ví dụ: Nguyễn Văn Long"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 transition outline-hidden font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1 flex items-center justify-between">
                  <span>Địa chỉ Email</span>
                  <span className="text-[10px] text-slate-400 font-normal"><i className="fas fa-lock text-[9px] mr-0.5"></i> Cố định theo tài khoản</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="far fa-envelope text-xs"></i>
                  </span>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    disabled
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 font-mono text-[11px] cursor-not-allowed outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Số điện thoại liên hệ <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-phone text-xs"></i>
                  </span>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="Ví dụ: 0912345678"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 transition outline-hidden font-mono"
                    required
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Bác sĩ và phòng khám sẽ liên hệ số này để xác nhận giờ khám.</p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Địa chỉ nơi cư trú
                </label>
                <div className="relative">
                  <span className="absolute top-2.5 left-3.5 pointer-events-none text-slate-400">
                    <i className="fas fa-location-dot text-xs"></i>
                  </span>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    rows="3"
                    placeholder="Ví dụ: 273 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-slate-800 transition outline-hidden resize-none leading-relaxed"
                  ></textarea>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  <i className="fas fa-info-circle mr-1"></i> Dữ liệu được bảo mật y tế an toàn.
                </span>
                <button
                  type="submit"
                  disabled={submittingInfo}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition shadow-md shadow-blue-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingInfo ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Đang lưu...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-save"></i>
                      <span>Lưu Thay Đổi</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* CỘT PHẢI (5/12): ĐỔI MẬT KHẨU TÀI KHOẢN */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-8 space-y-6">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center text-base">
                <i className="fas fa-shield-halved"></i>
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Đổi Mật Khẩu
                </h2>
                <p className="text-[11px] text-slate-500">Bảo vệ tài khoản cá nhân của bạn</p>
              </div>
            </div>

            <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mật khẩu hiện tại <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-key text-xs"></i>
                  </span>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordData.oldPassword}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-800 transition outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-lock text-xs"></i>
                  </span>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-800 transition outline-hidden"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Xác nhận mật khẩu mới <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <i className="fas fa-check-double text-xs"></i>
                  </span>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Nhập lại mật khẩu mới"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-100 text-slate-800 transition outline-hidden"
                    required
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={submittingPassword}
                  className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-md shadow-rose-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submittingPassword ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i>
                      <span>Đang đổi mật khẩu...</span>
                    </>
                  ) : (
                    <>
                      <i className="fas fa-lock"></i>
                      <span>Cập Nhật Mật Khẩu</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
}
