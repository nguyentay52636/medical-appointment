import { useEffect, useState, useContext } from "react";
import { PatientContext } from "../../context/PatientContext";
import { appointmentService } from "../../service/appointmentService";
import { fetchAllDoctor, fetchScheduleSummary } from "../../service/doctorService";
import { bookableSlotService } from "../../service/bookableSlotService";
import { reportService } from "../../service/reportService";

export default function BookingHistory() {
  const { patient } = useContext(PatientContext);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedAppt, setSelectedAppt] = useState(null);
  const [rescheduleAppt, setRescheduleAppt] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [rescheduleWarning, setRescheduleWarning] = useState("");
  const [rescheduleSummary, setRescheduleSummary] = useState(null);
  const [suggestedRescheduleDates, setSuggestedRescheduleDates] = useState([]);

  const [filterDate, setFilterDate] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDoctor, setFilterDoctor] = useState('');

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Mapping trạng thái thanh toán
  const paymentStatusMap = {
    paid: { text: "Đã thanh toán", color: "text-green-600 font-semibold" },
    pending: { text: "Chưa thanh toán", color: "text-yellow-500 font-semibold" },
    refunded: { text: "Đã hoàn tiền", color: "text-blue-600 font-semibold" },
    failed: { text: "Thanh toán thất bại", color: "text-red-600 font-semibold" },
  };

  // Mapping trạng thái lịch hẹn
  const getStatus = (status) => {
    switch (status) {
      case "pending": return { label: "Chờ xác nhận", color: "text-yellow-500" };
      case "confirmed": return { label: "Đã xác nhận", color: "text-blue-500" };
      case "completed": return { label: "Đã khám", color: "text-green-500" };
      case "cancelled": return { label: "Đã hủy", color: "text-red-500" };
      case "missed": return { label: "Đã bỏ lỡ", color: "text-gray-500" };
      default: return { label: status, color: "text-gray-500" };
    }
  };

  const getDoctorById = (id) => doctors.find((d) => d.id === id);

  // Lấy lịch hẹn và bác sĩ
  useEffect(() => {
    if (!patient) return;

    const fetchData = async () => {
      try {
        const [apptData, doctorData] = await Promise.all([
          appointmentService.getAppointmentsByPatientId(patient.id),
          fetchAllDoctor.getAllDoctors(),
        ]);
        setAppointments(apptData);
        setDoctors(doctorData);
      } catch (err) {
        console.error(err);
        setError("Không thể tải lịch sử đặt lịch");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [patient]);

  // Tự cập nhật trạng thái lịch đã quá hạn (pending | confirmed)
  useEffect(() => {
    if (!appointments || appointments.length === 0) return;

    const now = new Date();

    const autoUpdate = async () => {
      for (const appt of appointments) {
        const apptDateStr = appt.date?.slice(0, 10);
        if (!apptDateStr) continue;

        const [hours, minutes] = appt.time.split(":").map(Number);
        const apptDate = new Date(appt.date);
        apptDate.setHours(hours, minutes, 0, 0);

        if ((appt.status === "pending" || appt.status === "confirmed") && apptDate < now) {
          try {
            await appointmentService.autoExpireAppointment(appt.id);
          } catch (err) {
            console.error("Lỗi auto cập nhật:", err);
          }
        }
      }
    };

    autoUpdate();
  }, [appointments]);

  // Lọc ngày và giờ khám
  useEffect(() => {
    if (!rescheduleAppt || !newDate) {
      setRescheduleWarning("");
      return;
    }

    const fetchSlots = async () => {
      setSlotsLoading(true);
      setRescheduleWarning("");
      try {
        const slots = await bookableSlotService.getAvailableSlots(rescheduleAppt.doctorId, newDate);

        const now = new Date();
        const selectedDate = new Date(newDate);

        const available = slots.filter(slot => {
          if (slot.status !== "available") return false;
          if (
            selectedDate.toDateString() === now.toDateString() &&
            slot.startTime <= now.toTimeString().slice(0, 5)
          ) return false;
          return true;
        });

        if (slots.length === 0) {
          const dayNameVi = new Date(newDate + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long' });
          setRescheduleWarning(`Bác sĩ không có lịch trực vào ${dayNameVi}. Vui lòng chọn một trong các ngày gợi ý.`);
        } else if (available.length === 0) {
          setRescheduleWarning("Ngày này đã kín hết slot khám hoặc khung giờ đã trôi qua. Vui lòng chọn ngày khác.");
        } else {
          setRescheduleWarning("");
        }

        setAvailableSlots(available);
        setNewTime("");
      } catch (err) {
        console.error(err);
        setAvailableSlots([]);
        setRescheduleWarning("Không thể tải danh sách giờ khám. Vui lòng thử lại!");
      } finally {
        setSlotsLoading(false);
      }
    };

    fetchSlots();
  }, [rescheduleAppt, newDate]);

  const formatDate = (dateStr) => new Date(dateStr).toLocaleDateString("vi-VN");

  // Khi nhấn dời lịch
  const handleRescheduleClick = async (appt) => {
    setRescheduleAppt(appt);
    setNewDate("");
    setNewTime("");
    setRescheduleWarning("");
    setRescheduleSummary(null);
    setSuggestedRescheduleDates([]);

    if (appt?.doctorId) {
      try {
        const summary = await fetchScheduleSummary(appt.doctorId);
        setRescheduleSummary(summary);

        if (summary && summary.workingDays && summary.workingDays.length > 0) {
          const dayMap = {
            'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
            'thursday': 4, 'friday': 5, 'saturday': 6
          };
          const targetDayNums = summary.workingDays.map(d => dayMap[d.toLowerCase()]);
          const suggestions = [];
          const curr = new Date();

          for (let i = 0; i < 21 && suggestions.length < 4; i++) {
            const candidate = new Date();
            candidate.setDate(curr.getDate() + i);
            const dayNum = candidate.getDay();
            if (targetDayNums.includes(dayNum)) {
              const yyyy = candidate.getFullYear();
              const mm = String(candidate.getMonth() + 1).padStart(2, '0');
              const dd = String(candidate.getDate()).padStart(2, '0');
              const dateStr = `${yyyy}-${mm}-${dd}`;

              const weekdayVi = candidate.toLocaleDateString('vi-VN', { weekday: 'long' });
              const formattedDisplay = `${weekdayVi.charAt(0).toUpperCase() + weekdayVi.slice(1)}, ${dd}/${mm}`;
              suggestions.push({ dateStr, label: formattedDisplay });
            }
          }
          setSuggestedRescheduleDates(suggestions);
        }
      } catch (err) {
        console.error("Lỗi lấy thông tin lịch bác sĩ khi dời lịch:", err);
      }
    }
  };

  // Khi đóng popup dời lịch
  const handleCloseReschedule = () => {
    setRescheduleAppt(null);
    setNewDate("");
    setNewTime("");
    setAvailableSlots([]);
    setRescheduleWarning("");
    setRescheduleSummary(null);
    setSuggestedRescheduleDates([]);
  };

  // Khi nhấn xác nhận dời lịch
  const handleRescheduleSubmit = async () => {
    if (!newDate || !newTime) return alert("Vui lòng chọn ngày và giờ mới");

    try {
      // input type="date" trả về yyyy-MM-dd, nếu bạn dùng input khác phải convert
      const payload = { date: newDate, time: newTime };

      await appointmentService.rescheduleAppointment(rescheduleAppt.id, payload);

      // Load lại lịch hẹn mới nhất
      const updatedAppointments = await appointmentService.getAppointmentsByPatientId(patient.id);
      setAppointments(updatedAppointments);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === rescheduleAppt.id ? { ...a, date: newDate, time: newTime } : a
        )
      );

      alert("Dời lịch thành công");
      handleCloseReschedule();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Dời lịch thất bại");
    }
  };

  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;

  // Lọc
  const handleResetFilter = () => {
    setFilterDate('');
    setFilterStatus('');
    setFilterDoctor('');
  };

  const filteredAppointments = appointments
    .filter(appt => !filterDate || appt.date.slice(0, 10) === filterDate)
    .filter(appt => !filterStatus || appt.status === filterStatus)
    .filter(appt => !filterDoctor || appt.doctorId === Number(filterDoctor));

  // Phân trang
  const totalPages = Math.ceil(filteredAppointments.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAppointments = filteredAppointments.slice(indexOfFirstItem, indexOfLastItem);

  return (
    <div className="p-6 bg-gradient-to-r from-white via-blue-50 to-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4 text-blue-800 text-center">Lịch sử đặt lịch</h1>

      {appointments.length === 0 ? (
        <div className="text-center mt-10">
          <div className="inline-block bg-red-100 text-red-600 px-6 py-4 rounded-xl shadow-md">
            Bạn chưa có lịch sử đặt lịch.
          </div>
        </div>
      ) : (
        <>
          {/* Bộ lọc */}
          <div className="bg-white p-4 rounded-xl shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">

            {/* Lọc theo ngày */}
            <div>
              <label className="block font-semibold mb-1">Ngày khám</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full border px-3 py-2 rounded cursor-pointer"
              />
            </div>

            {/* Lọc theo bác sĩ */}
            <div>
              <label className="block font-semibold mb-1">Bác sĩ</label>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full border px-3 py-2 rounded cursor-pointer"
              >
                <option value="">Tất cả</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>

            {/* Lọc theo trạng thái */}
            <div>
              <label className="block font-semibold mb-1">Trạng thái</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full border px-3 py-2 rounded cursor-pointer"
              >
                <option value="">Tất cả</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Đã khám</option>
                <option value="missed">Đã bỏ lỡ</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Nút reset */}
            <div className="flex items-end">
              <button
                onClick={handleResetFilter}
                className="1w-full px-4 py-2 text-white text-base font-semibold bg-blue-600 hover:bg-blue-700 rounded hover:scale-[1.01] cursor-pointer"
              >
                Xóa lọc
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow-md text-center">
              <thead className="bg-blue-500 text-white">
                <tr>
                  <th>Mã lịch</th>
                  <th>Bác sĩ</th>
                  <th>Chuyên khoa</th>
                  <th>Ngày</th>
                  <th>Giờ bắt đầu</th>
                  <th>Giờ kết thúc</th>
                  <th>Lý do khám</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {currentAppointments.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="py-4 text-center text-red-600 font-semibold">
                      Không có lịch hẹn nào được tìm thấy.
                    </td>
                  </tr>
                ) : (
                  currentAppointments.map((appt) => {
                    const doctor = getDoctorById(appt.doctorId);
                    return (
                      <tr key={appt.id} className="border-b hover:bg-gray-50">
                        <td>{appt.appointmentCode}</td>
                        <td>{doctor?.fullName || "Không có"}</td>
                        <td>{doctor?.specialtyName || "Không có"}</td>
                        <td>{formatDate(appt.date)}</td>
                        <td>{appt.time}</td>
                        <td>{appt.endTime}</td>
                        <td>{appt.reason || "Không có"}</td>
                        <td className={`font-semibold ${getStatus(appt.status).color}`}>
                          {getStatus(appt.status).label}
                        </td>
                        <td>
                          <button
                            onClick={() => setSelectedAppt(appt)}
                            className="p-2 rounded-full bg-blue-500 hover:bg-blue-600 text-white cursor-pointer"
                          >
                            Xem
                          </button>
                          {appt.status === "pending" && (
                            <button
                              onClick={() => handleRescheduleClick(appt)}
                              className="ml-2 p-2 rounded-full bg-yellow-500 hover:bg-yellow-600 text-white cursor-pointer"
                            >
                              Dời lịch
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center mt-4 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  className={`px-4 py-2 rounded ${page === currentPage ? "bg-blue-500 text-white" : "bg-gray-300"} cursor-pointer`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Popup chi tiết lịch */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
            <button
              onClick={() => setSelectedAppt(null)}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-5 text-center">Chi tiết lịch khám</h2>

            <div className="space-y-3">
              <p className="flex justify-between">
                <span className="font-semibold">Mã lịch:</span>
                <span>{selectedAppt.appointmentCode}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Giá khám:</span>
                <span>{(selectedAppt.price || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Phương thức thanh toán:</span>
                <span>{selectedAppt.paymentMethod === "offline" ? "Khi đến khám" : "Trực tuyến"}</span>
              </p>
              <p className="flex justify-between">
                <span className="font-semibold">Trạng thái thanh toán:</span>
                <span className={paymentStatusMap[selectedAppt.paymentStatus]?.color}>
                  {paymentStatusMap[selectedAppt.paymentStatus]?.text || "Không rõ"}
                </span>
              </p>
              <div className="flex flex-col mb-3">
                <span className="font-semibold">Ghi chú:</span>
                <div className="border p-2 rounded h-24 overflow-y-auto bg-gray-50">
                  {selectedAppt.note || "Không có"}
                </div>
              </div>
            </div>

            <div className="flex justify-center mt-6 gap-4">
              {selectedAppt.status === "pending" && (
                <button
                  onClick={() => {
                    setSelectedAppt(null);
                    handleRescheduleClick(selectedAppt);
                  }}
                  className="px-6 py-2 bg-yellow-500 text-white rounded-xl hover:bg-yellow-600 cursor-pointer"
                >
                  Dời lịch
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    const blob = await reportService.downloadAppointment(selectedAppt.id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Lich_Kham_${selectedAppt.appointmentCode}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url); // giải phóng memory
                  } catch (err) {
                    console.error("Lỗi tải PDF:", err);
                    alert("Không thể tải PDF. Vui lòng thử lại hoặc liên hệ phòng khám.");
                  }
                }}
                className="px-6 py-2 bg-green-600 text-white rounded-xl hover:bg-green-700 cursor-pointer"
              >
                In lịch hẹn
              </button>
              <button
                onClick={() => setSelectedAppt(null)}
                className="px-6 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Popup dời lịch */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md mx-4 relative">
            <button
              onClick={handleCloseReschedule}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-lg cursor-pointer"
            >
              ✕
            </button>

            <h2 className="text-2xl font-bold mb-5 text-center">Dời lịch hẹn</h2>

            {/* Doctor working days info */}
            {rescheduleSummary && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 text-left">
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-900 font-bold">
                  <i className="fas fa-calendar-check text-blue-600"></i>
                  Lịch trực của Bác sĩ:
                  {rescheduleSummary.workingDaysVi && rescheduleSummary.workingDaysVi.length > 0 ? (
                    rescheduleSummary.workingDaysVi.map((d, idx) => (
                      <span key={idx} className="px-2 py-0.5 bg-white border border-blue-300 text-blue-800 rounded font-semibold text-[11px]">
                        {d}
                      </span>
                    ))
                  ) : (
                    <span className="italic text-gray-500 font-normal">Chưa có lịch trực cố định</span>
                  )}
                </div>
                {suggestedRescheduleDates.length > 0 && (
                  <div className="pt-1.5 border-t border-blue-200/60 flex flex-wrap items-center gap-1.5 text-xs">
                    <span className="font-semibold text-gray-700">Gợi ý ngày trực:</span>
                    {suggestedRescheduleDates.map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setNewDate(item.dateStr)}
                        className={`px-2 py-0.5 text-[11px] rounded font-bold border transition cursor-pointer ${newDate === item.dateStr ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-100 text-blue-700 border-blue-200'}`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">Chọn ngày mới</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className={`w-full mb-3 border px-3 py-2 rounded-xl cursor-pointer ${rescheduleWarning ? 'border-amber-400 bg-amber-50/30' : ''}`}
              min={new Date().toISOString().split("T")[0]}
              max={(() => {
                const d = new Date();
                d.setDate(d.getDate() + 30);
                return d.toISOString().split("T")[0];
              })()}
            />

            {/* Inline warning notice */}
            {rescheduleWarning && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2 text-left">
                <i className="fas fa-exclamation-circle text-amber-600 mt-0.5 shrink-0"></i>
                <div className="space-y-1">
                  <p className="font-semibold leading-relaxed">{rescheduleWarning}</p>
                  {suggestedRescheduleDates.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      <span className="font-bold text-gray-700">Chọn nhanh:</span>
                      {suggestedRescheduleDates.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewDate(item.dateStr)}
                          className="px-2 py-0.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded text-[11px] font-bold cursor-pointer transition"
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            <label className="block mb-1 text-xs font-bold text-gray-700 uppercase">Chọn khung giờ mới</label>
            {slotsLoading ? (
              <div className="mb-4">Đang tải slot...</div>
            ) : (
              <select
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="w-full mb-4 border px-3 py-2 rounded cursor-pointer"
                disabled={availableSlots.length === 0}
              >
                <option value="">-- Chọn giờ --</option>
                {availableSlots.map((slot) => (
                  <option
                    key={slot.id} // key duy nhất
                    value={slot.startTime} // giá trị mà user chọn
                  >
                    {slot.startTime} - {slot.endTime}
                  </option>
                ))}
              </select>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={handleCloseReschedule}
                className="px-4 py-2 rounded border hover:bg-gray-100 cursor-pointer"
              >
                Hủy
              </button>
              <button
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
                disabled={!newDate || !newTime}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
