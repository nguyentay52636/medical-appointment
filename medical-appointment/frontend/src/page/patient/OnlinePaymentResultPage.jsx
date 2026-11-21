import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { appointmentService } from "../../service/appointmentService";
import { fetchAllDoctor } from "../../service/doctorService";

export default function PaymentResult() {
  const location = useLocation();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [appt, setAppt] = useState(null);
  const [error, setError] = useState("");
  const [doctors, setDoctors] = useState([]);

  // Lấy vnpTxnRef và vnpResponseCode từ query param
  const searchParams = new URLSearchParams(location.search);
  const txnRef = searchParams.get("vnp_TxnRef");
  const responseCode = searchParams.get("vnp_ResponseCode");

  useEffect(() => {
    if (!txnRef || !responseCode) {
      setError("Không tìm thấy thông tin thanh toán.");
      setLoading(false);
      return;
    }

    const fetchPaymentResult = async () => {
      try {
        const allQueryParams = Object.fromEntries(searchParams.entries());
        const [apptData, doctorData] = await Promise.all([
          appointmentService.getPaymentResult(txnRef, responseCode, allQueryParams),
          fetchAllDoctor.getAllDoctors()
        ]);

        setAppt(apptData);
        setDoctors(doctorData);
      } catch (err) {
        console.error(err);
        setError("Không thể tải thông tin lịch khám hoặc lỗi xử lý thanh toán.");
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentResult();
  }, [txnRef, responseCode]);

  const getDoctorById = (id) => doctors.find(d => d.id === id);

  if (loading) return <p className="p-6 text-center text-gray-600">Đang tải thông tin...</p>;
  if (error) return <p className="p-6 text-center text-red-500">{error}</p>;
  if (!appt) return <p className="p-6 text-center text-red-500">Không tìm thấy lịch khám.</p>;

  const doctor = getDoctorById(appt.doctorId);
  const isPaid = appt.paymentStatus === "paid";

  // Màu theo trạng thái
  const statusStyles = {
    paid: "bg-green-100 text-green-700 border-green-500",
    failed: "bg-red-100 text-red-700 border-red-500",
    pending: "bg-yellow-100 text-yellow-700 border-yellow-500",
  };

  const statusClass = statusStyles[appt.paymentStatus] || statusStyles.pending;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100 p-6">
      <div className="bg-white shadow-2xl rounded-3xl max-w-lg w-full p-8 text-center border-t-8" style={{ borderColor: statusClass.split(" ")[2].replace("border-", "") }}>
        
        {/* Thanh toán thành công / thất bại */}
        <div className={`p-4 mb-6 rounded-lg ${statusClass} font-semibold text-lg flex items-center justify-center space-x-2`}>
          {isPaid ? (
            <span>Thanh toán thành công!</span>
          ) : (
            <span>Thanh toán thất bại</span>
          )}
        </div>

        {/* Thông tin tổng quát */}
        <p className="text-gray-700 mb-4">
          Bạn {isPaid ? "đã" : "chưa"} thanh toán{" "}
          <span className="font-semibold">
            {appt.price?.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) || "0 VND"}
          </span>{" "}
          cho lịch khám với{" "}
          <span className="font-semibold">{doctor?.fullName || "Bác sĩ"}</span> ({doctor?.specialtyName || "Chuyên khoa"}).
        </p>

        {/* Card thông tin chi tiết */}
        <div className="text-left bg-gray-50 p-4 rounded-xl space-y-2 mb-6 shadow-inner text-sm">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <span className="font-semibold text-gray-600">Trạng thái:</span>
            <span className={`px-2.5 py-0.5 rounded-full font-bold text-xs ${
              isPaid ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}>
              {isPaid ? "Đã Xác Nhận & Đã Thanh Toán" : "Chưa Hoàn Tất"}
            </span>
          </div>
          <p><span className="font-semibold">Mã lịch hẹn:</span> <span className="font-mono font-bold text-blue-700">{appt.appointmentCode}</span></p>
          <p><span className="font-semibold">Ngày khám:</span> {appt.date ? new Date(appt.date).toLocaleDateString("vi-VN") : "-"}</p>
          <p><span className="font-semibold">Giờ khám:</span> {appt.time || "-"} {appt.endTime ? `- ${appt.endTime}` : ""}</p>
          <p><span className="font-semibold">Lý do khám:</span> {appt.reason || "Không có"}</p>
          {appt.note && <p><span className="font-semibold">Ghi chú:</span> {appt.note}</p>}
          <p><span className="font-semibold">Địa chỉ:</span> {doctor?.address || "Phòng khám MediCare Clinic"}</p>
        </div>

        {/* Thông báo hẹn gặp nếu thanh toán thành công */}
        {isPaid && (
          <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-emerald-800 font-medium mb-6 flex items-center justify-center gap-2">
            <i className="fas fa-check-circle text-emerald-600"></i>
            <span>Lịch hẹn đã được hệ thống ghi nhận thành công. Hẹn gặp bạn vào ngày khám!</span>
          </div>
        )}

        {/* Thông báo nếu thất bại */}
        {!isPaid && (
          <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-red-700 font-medium mb-6">
            Thanh toán không thành công. Vui lòng thử lại để hoàn tất đặt lịch.
          </div>
        )}

        {/* Nút thao tác */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {isPaid && (
            <button
              onClick={() => navigate("/patient/history")}
              className="px-6 py-3 font-bold rounded-xl transition cursor-pointer bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center gap-2 shadow-md"
            >
              <i className="fas fa-calendar-check"></i>
              <span>Xem Lịch Hẹn Của Tôi</span>
            </button>
          )}
          <button
            onClick={() => navigate(isPaid ? "/patient/home" : `/patient/booking`)}
            className={`px-6 py-3 font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-2 ${
              isPaid
                ? "bg-slate-100 hover:bg-slate-200 text-slate-700"
                : "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <i className={`fas ${isPaid ? "fa-home" : "fa-undo"}`}></i>
            <span>{isPaid ? "Về trang chủ" : "Thử lại đặt lịch"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
