import { useEffect, useState, useContext } from "react";
import { PatientContext } from "../../context/PatientContext";
import { appointmentService } from "../../service/appointmentService";
import { fetchAllDoctor, fetchScheduleSummary } from "../../service/doctorService";
import { bookableSlotService } from "../../service/bookableSlotService";
import { reportService } from "../../service/reportService";
import { medicalRecordService } from "../../service/medicalRecordService";
import MedicalRecordModal from "../../component/common/MedicalRecordModal";
import { useToast } from "../../context/ToastContext";

export default function BookingHistory() {
  const { patient } = useContext(PatientContext);
  const { success: showToastSuccess, error: showToastError, warning: showToastWarning, info: showToastInfo } = useToast();
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

  // Hồ sơ bệnh án
  const [activeMedicalRecord, setActiveMedicalRecord] = useState(null);
  const [selectedRecordAppt, setSelectedRecordAppt] = useState(null);
  const [showMedicalRecordModal, setShowMedicalRecordModal] = useState(false);
  const [recordLoading, setRecordLoading] = useState(false);

  // Phân trang
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // Mapping trạng thái thanh toán
  const paymentStatusMap = {
    paid: {
      text: "Đã thanh toán",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    pending: {
      text: "Chưa thanh toán",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
      dotClass: "bg-amber-500",
    },
    refunded: {
      text: "Đã hoàn tiền",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500",
    },
    failed: {
      text: "Thanh toán thất bại",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500",
    },
  };

  // Mapping trạng thái lịch hẹn chuẩn y tế
  const getStatus = (status) => {
    switch (status) {
      case "pending":
        return {
          label: "Chờ xác nhận",
          badgeClass: "bg-amber-50 text-amber-800 border-amber-200",
          dotClass: "bg-amber-500",
          icon: "fa-clock",
        };
      case "confirmed":
        return {
          label: "Đã xác nhận",
          badgeClass: "bg-blue-50 text-blue-800 border-blue-200",
          dotClass: "bg-blue-600",
          icon: "fa-calendar-check",
        };
      case "completed":
        return {
          label: "Đã khám xong",
          badgeClass: "bg-emerald-50 text-emerald-800 border-emerald-200",
          dotClass: "bg-emerald-600",
          icon: "fa-check-circle",
        };
      case "cancelled":
        return {
          label: "Đã hủy",
          badgeClass: "bg-rose-50 text-rose-800 border-rose-200",
          dotClass: "bg-rose-500",
          icon: "fa-ban",
        };
      case "missed":
        return {
          label: "Đã bỏ lỡ",
          badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
          dotClass: "bg-slate-400",
          icon: "fa-calendar-xmark",
        };
      default:
        return {
          label: status,
          badgeClass: "bg-slate-100 text-slate-700 border-slate-300",
          dotClass: "bg-slate-400",
          icon: "fa-circle-info",
        };
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
    if (!newDate || !newTime) {
      showToastWarning("Thiếu thông tin", "Vui lòng chọn ngày và khung giờ khám mới");
      return;
    }

    try {
      const payload = { date: newDate, time: newTime };
      await appointmentService.rescheduleAppointment(rescheduleAppt.id, payload);

      const updatedAppointments = await appointmentService.getAppointmentsByPatientId(patient.id);
      setAppointments(updatedAppointments);

      setAppointments((prev) =>
        prev.map((a) =>
          a.id === rescheduleAppt.id ? { ...a, date: newDate, time: newTime } : a
        )
      );

      showToastSuccess("Dời lịch thành công", `Lịch hẹn đã được chuyển sang ngày ${formatDate(newDate)} lúc ${newTime}.`);
      handleCloseReschedule();
      setSelectedAppt(null);
    } catch (err) {
      console.error(err);
      showToastError("Dời lịch thất bại", err.response?.data?.message || "Không thể dời lịch hẹn. Vui lòng thử lại!");
    }
  };

  const handleViewMedicalRecord = async (appt) => {
    setRecordLoading(true);
    setSelectedRecordAppt(appt);
    try {
      const res = await medicalRecordService.getMedicalRecordByAppointment(appt.id);
      if (res?.success && res?.data) {
        setActiveMedicalRecord(res.data);
        setShowMedicalRecordModal(true);
      } else {
        showToastInfo("Chưa có bệnh án", "Bác sĩ chưa xuất bệnh án cho ca khám này hoặc đang trong quá trình cập nhật.");
      }
    } catch (err) {
      console.error(err);
      showToastError("Lỗi tải bệnh án", err.response?.data?.message || "Không thể tải hồ sơ bệnh án. Vui lòng liên hệ phòng khám.");
    } finally {
      setRecordLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-3">
          <i className="fas fa-spinner fa-spin text-3xl text-blue-600"></i>
          <p className="text-sm font-semibold text-slate-600">Đang tải lịch sử đặt lịch...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-xl mx-auto mt-10">
        <div className="bg-rose-50 border border-rose-200 text-rose-700 p-5 rounded-2xl text-center space-y-2">
          <i className="fas fa-exclamation-triangle text-2xl text-rose-500"></i>
          <p className="font-semibold">{error}</p>
        </div>
      </div>
    );
  }

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
    <div className="p-4 md:p-8 bg-slate-50/70 min-h-screen space-y-6">
      {/* Tiêu đề trang & Thống kê */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-md shadow-blue-500/20">
            <i className="fas fa-calendar-check"></i>
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
              Lịch Sử Đặt Lịch Khám
            </h1>
            <p className="text-xs md:text-sm text-slate-500 mt-0.5">
              Theo dõi lịch hẹn, hồ sơ bệnh án điện tử và đơn thuốc đã được kê
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200/80 flex items-center gap-1.5">
            <i className="fas fa-list-check text-blue-600"></i>
            <span>Tổng số: <strong className="text-slate-900">{appointments.length}</strong> ca khám</span>
          </span>
        </div>
      </div>

      {appointments.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-md mx-auto space-y-3 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto">
            <i className="fas fa-calendar-plus"></i>
          </div>
          <h3 className="text-base font-bold text-slate-800">Chưa có lịch hẹn khám nào</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bạn chưa thực hiện đặt lịch khám nào trên hệ thống. Hãy chọn bác sĩ chuyên khoa và đặt lịch khám ngay.
          </p>
        </div>
      ) : (
        <>
          {/* Bộ lọc chuẩn y tế */}
          <div className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Lọc theo ngày */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                <i className="fas fa-calendar-day text-slate-400 mr-1"></i> Ngày khám
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-xl text-xs text-slate-800 cursor-pointer transition"
              />
            </div>

            {/* Lọc theo bác sĩ */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                <i className="fas fa-user-md text-slate-400 mr-1"></i> Bác sĩ phụ trách
              </label>
              <select
                value={filterDoctor}
                onChange={(e) => setFilterDoctor(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-xl text-xs text-slate-800 cursor-pointer transition"
              >
                <option value="">Tất cả bác sĩ</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.fullName}</option>
                ))}
              </select>
            </div>

            {/* Lọc theo trạng thái */}
            <div>
              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1">
                <i className="fas fa-filter text-slate-400 mr-1"></i> Trạng thái
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 px-3 py-2 rounded-xl text-xs text-slate-800 cursor-pointer transition"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="pending">Chờ xác nhận</option>
                <option value="confirmed">Đã xác nhận</option>
                <option value="completed">Đã khám xong</option>
                <option value="missed">Đã bỏ lỡ</option>
                <option value="cancelled">Đã hủy</option>
              </select>
            </div>

            {/* Nút reset */}
            <div className="flex items-end">
              <button
                type="button"
                onClick={handleResetFilter}
                className="w-full flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200 transition cursor-pointer"
              >
                <i className="fas fa-rotate-left text-slate-500"></i>
                <span>Đặt lại bộ lọc</span>
              </button>
            </div>
          </div>

          {/* Bảng danh sách lịch hẹn */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs divide-y divide-slate-100">
                <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200 tracking-wider">
                  <tr>
                    <th className="py-3 px-3.5 text-center w-24">Mã lịch</th>
                    <th className="py-3 px-3.5">Bác sĩ phụ trách</th>
                    <th className="py-3 px-3.5">Chuyên khoa</th>
                    <th className="py-3 px-3.5 text-center">Thời gian khám</th>
                    <th className="py-3 px-3.5">Lý do khám</th>
                    <th className="py-3 px-3.5 text-center">Trạng thái</th>
                    <th className="py-3 px-3.5 text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {currentAppointments.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="py-8 text-center text-slate-500 font-medium">
                        <div className="space-y-1">
                          <i className="fas fa-search text-slate-300 text-2xl"></i>
                          <p>Không tìm thấy lịch hẹn phù hợp với bộ lọc.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    currentAppointments.map((appt) => {
                      const doctor = getDoctorById(appt.doctorId);
                      const statusObj = getStatus(appt.status);

                      return (
                        <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                          {/* Mã lịch */}
                          <td className="py-3 px-3.5 text-center font-mono font-bold text-slate-800">
                            #{appt.appointmentCode || appt.id}
                          </td>

                          {/* Bác sĩ */}
                          <td className="py-3 px-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs shrink-0">
                                <i className="fas fa-user-doctor"></i>
                              </div>
                              <span className="font-bold text-slate-900">{doctor?.fullName || "Bác sĩ phụ trách"}</span>
                            </div>
                          </td>

                          {/* Chuyên khoa */}
                          <td className="py-3 px-3.5">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                              {doctor?.specialtyName || "Đa khoa"}
                            </span>
                          </td>

                          {/* Thời gian */}
                          <td className="py-3 px-3.5 text-center">
                            <div className="font-semibold text-slate-900">{formatDate(appt.date)}</div>
                            <div className="text-[11px] text-slate-500 font-mono flex items-center justify-center gap-1">
                              <i className="far fa-clock text-slate-400"></i>
                              <span>{appt.time} - {appt.endTime || "..."}</span>
                            </div>
                          </td>

                          {/* Lý do khám */}
                          <td className="py-3 px-3.5 max-w-xs truncate text-slate-700" title={appt.reason || "Không có"}>
                            {appt.reason || <span className="text-slate-400 italic">Không có ghi chú</span>}
                          </td>

                          {/* Trạng thái */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${statusObj.badgeClass}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${statusObj.dotClass}`}></span>
                              <span>{statusObj.label}</span>
                            </span>
                          </td>

                          {/* Nút Thao tác đồng bộ chuẩn UI */}
                          <td className="py-3 px-3.5 text-center whitespace-nowrap">
                            <div className="inline-flex items-center justify-center gap-1.5">
                              {/* Xem chi tiết */}
                              <button
                                type="button"
                                onClick={() => setSelectedAppt(appt)}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 hover:border-slate-300 transition shadow-2xs cursor-pointer"
                                title="Xem chi tiết lịch hẹn"
                              >
                                <i className="fas fa-eye text-slate-500"></i>
                                <span>Chi tiết</span>
                              </button>

                              {/* Xem Bệnh án */}
                              {appt.status === "completed" && (
                                <button
                                  type="button"
                                  onClick={() => handleViewMedicalRecord(appt)}
                                  disabled={recordLoading && selectedRecordAppt?.id === appt.id}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 hover:border-emerald-400 transition shadow-2xs cursor-pointer"
                                  title="Xem hồ sơ bệnh án & đơn thuốc"
                                >
                                  {recordLoading && selectedRecordAppt?.id === appt.id ? (
                                    <i className="fas fa-spinner fa-spin text-emerald-600"></i>
                                  ) : (
                                    <i className="fas fa-file-medical text-emerald-600"></i>
                                  )}
                                  <span>Bệnh án</span>
                                </button>
                              )}

                              {/* Dời lịch */}
                              {appt.status === "pending" && (
                                <button
                                  type="button"
                                  onClick={() => handleRescheduleClick(appt)}
                                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 hover:border-amber-400 transition shadow-2xs cursor-pointer"
                                  title="Dời lịch hẹn sang ngày/giờ khác"
                                >
                                  <i className="fas fa-calendar-alt text-amber-600"></i>
                                  <span>Dời lịch</span>
                                </button>
                              )}

                              {/* In phiếu khám */}
                              <button
                                type="button"
                                onClick={async () => {
                                  try {
                                    const blob = await reportService.downloadAppointment(appt.id);
                                    const url = window.URL.createObjectURL(blob);
                                    const a = document.createElement("a");
                                    a.href = url;
                                    a.download = `Phieu_Kham_${appt.appointmentCode || appt.id}.pdf`;
                                    a.click();
                                    window.URL.revokeObjectURL(url);
                                    showToastSuccess("Tải phiếu khám thành công", `Phiếu khám #${appt.appointmentCode || appt.id} đã được tải về máy.`);
                                  } catch (err) {
                                    console.error("Lỗi tải PDF:", err);
                                    showToastError("Không thể tải PDF", "Không thể tải phiếu hẹn PDF lúc này. Vui lòng thử lại sau.");
                                  }
                                }}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-lg text-xs bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 hover:border-slate-300 transition shadow-2xs cursor-pointer"
                                title="In phiếu xác nhận lịch hẹn (PDF)"
                              >
                                <i className="fas fa-print"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Phân trang */}
            {totalPages > 1 && (
              <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  Hiển thị <strong className="text-slate-800">{indexOfFirstItem + 1}</strong> - <strong className="text-slate-800">{Math.min(indexOfLastItem, filteredAppointments.length)}</strong> trong <strong className="text-slate-800">{filteredAppointments.length}</strong> kết quả
                </span>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Trước
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      className={`w-7 h-7 rounded-lg text-xs font-semibold cursor-pointer transition ${page === currentPage ? "bg-blue-600 text-white" : "border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Popup Chi Tiết Lịch Khám - Thiết kế đồng bộ chuẩn Y Tế */}
      {selectedAppt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200">
            {/* Header đồng bộ Slate-900 */}
            <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white text-lg shadow-md shadow-blue-500/20">
                  <i className="fas fa-calendar-check"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Chi Tiết Lịch Khám</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Mã lịch hẹn: <span className="text-blue-300 font-bold">#{selectedAppt.appointmentCode || selectedAppt.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Nội dung chi tiết */}
            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Thẻ bác sĩ */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">Bác sĩ khám</span>
                  <p className="text-sm font-bold text-slate-900">{getDoctorById(selectedAppt.doctorId)?.fullName || "Bác sĩ phụ trách"}</p>
                  <p className="text-xs text-blue-700 font-medium">{getDoctorById(selectedAppt.doctorId)?.specialtyName || "Chuyên khoa chung"}</p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-slate-500 block uppercase">Trạng thái lịch</span>
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatus(selectedAppt.status).badgeClass}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatus(selectedAppt.status).dotClass}`}></span>
                    <span>{getStatus(selectedAppt.status).label}</span>
                  </span>
                </div>
              </div>

              {/* Thông tin thời gian & chi phí */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Ngày khám</span>
                  <p className="text-xs font-bold text-slate-900">{formatDate(selectedAppt.date)}</p>
                  <p className="text-[11px] text-slate-500 font-mono">{selectedAppt.time} - {selectedAppt.endTime || "..."}</p>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-0.5">
                  <span className="text-[11px] text-slate-500 font-semibold block uppercase">Chi phí khám</span>
                  <p className="text-xs font-bold text-blue-700">
                    {(selectedAppt.price || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {selectedAppt.paymentMethod === "offline" ? "Thanh toán tại quầy" : "Thanh toán trực tuyến"}
                  </p>
                </div>
              </div>

              {/* Trạng thái thanh toán */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="font-semibold text-slate-700">Tình trạng thanh toán:</span>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${paymentStatusMap[selectedAppt.paymentStatus]?.badgeClass || "bg-slate-100 text-slate-700 border-slate-200"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${paymentStatusMap[selectedAppt.paymentStatus]?.dotClass || "bg-slate-400"}`}></span>
                  <span>{paymentStatusMap[selectedAppt.paymentStatus]?.text || "Chưa xác định"}</span>
                </span>
              </div>

              {/* Ghi chú triệu chứng */}
              <div className="space-y-1">
                <span className="font-bold text-slate-700 block">Lý do khám / Triệu chứng ban đầu:</span>
                <div className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-800 leading-relaxed max-h-24 overflow-y-auto">
                  {selectedAppt.note || selectedAppt.reason || "Không có thông tin mô tả chi tiết."}
                </div>
              </div>
            </div>

            {/* Nút hành động đồng bộ */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-wrap items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setSelectedAppt(null)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer"
              >
                Đóng
              </button>

              <button
                type="button"
                onClick={async () => {
                  try {
                    const blob = await reportService.downloadAppointment(selectedAppt.id);
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `Phieu_Kham_${selectedAppt.appointmentCode || selectedAppt.id}.pdf`;
                    a.click();
                    window.URL.revokeObjectURL(url);
                    showToastSuccess("Tải phiếu khám thành công", `Phiếu khám #${selectedAppt.appointmentCode || selectedAppt.id} đã được tải về máy.`);
                  } catch (err) {
                    console.error("Lỗi tải PDF:", err);
                    showToastError("Không thể tải PDF", "Không thể tải phiếu hẹn PDF lúc này. Vui lòng thử lại sau.");
                  }
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <i className="fas fa-print"></i>
                <span>In Phiếu Khám</span>
              </button>

              {selectedAppt.status === "pending" && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedAppt;
                    setSelectedAppt(null);
                    handleRescheduleClick(target);
                  }}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <i className="fas fa-calendar-alt"></i>
                  <span>Dời Lịch Hẹn</span>
                </button>
              )}

              {selectedAppt.status === "completed" && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedAppt;
                    setSelectedAppt(null);
                    handleViewMedicalRecord(target);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <i className="fas fa-file-medical"></i>
                  <span>Xem Bệnh Án & Toa Thuốc</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Popup Dời Lịch Hẹn - Chuẩn UI Y Tế */}
      {rescheduleAppt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200">
            {/* Header */}
            <div className="bg-slate-900 px-6 py-4.5 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-600 flex items-center justify-center text-white text-lg shadow-md shadow-amber-500/20">
                  <i className="fas fa-calendar-alt"></i>
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Dời Lịch Hẹn Khám</h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Lịch hẹn: <span className="text-amber-300 font-bold">#{rescheduleAppt.appointmentCode || rescheduleAppt.id}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseReschedule}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs text-slate-700">
              {/* Thông tin lịch trực của bác sĩ */}
              {rescheduleSummary && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex flex-wrap items-center gap-1.5 text-xs text-blue-900 font-bold">
                    <i className="fas fa-calendar-check text-blue-600"></i>
                    <span>Lịch trực cố định:</span>
                    {rescheduleSummary.workingDaysVi && rescheduleSummary.workingDaysVi.length > 0 ? (
                      rescheduleSummary.workingDaysVi.map((d, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-white border border-blue-200 text-blue-800 rounded-md font-semibold text-[11px]">
                          {d}
                        </span>
                      ))
                    ) : (
                      <span className="italic text-slate-500 font-normal">Chưa có lịch trực cố định</span>
                    )}
                  </div>

                  {suggestedRescheduleDates.length > 0 && (
                    <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center gap-1.5">
                      <span className="font-semibold text-slate-700">Gợi ý ngày trực:</span>
                      {suggestedRescheduleDates.map((item, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setNewDate(item.dateStr)}
                          className={`px-2 py-0.5 text-[11px] rounded-md font-bold border transition cursor-pointer ${newDate === item.dateStr ? 'bg-blue-600 text-white border-blue-600' : 'bg-white hover:bg-blue-100 text-blue-700 border-blue-200'}`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Chọn ngày mới */}
              <div>
                <label className="block mb-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Chọn ngày khám mới
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className={`w-full border px-3 py-2 rounded-xl text-xs text-slate-800 cursor-pointer transition ${rescheduleWarning ? 'border-amber-400 bg-amber-50/30' : 'border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500'}`}
                  min={new Date().toISOString().split("T")[0]}
                  max={(() => {
                    const d = new Date();
                    d.setDate(d.getDate() + 30);
                    return d.toISOString().split("T")[0];
                  })()}
                />
              </div>

              {/* Cảnh báo nếu chọn ngày không có slot */}
              {rescheduleWarning && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-start gap-2">
                  <i className="fas fa-exclamation-circle text-amber-600 mt-0.5 shrink-0"></i>
                  <div className="space-y-1">
                    <p className="font-semibold leading-relaxed">{rescheduleWarning}</p>
                    {suggestedRescheduleDates.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 pt-1">
                        <span className="font-bold text-slate-700">Chọn nhanh:</span>
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

              {/* Chọn khung giờ */}
              <div>
                <label className="block mb-1 text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                  Chọn khung giờ khám mới
                </label>
                {slotsLoading ? (
                  <div className="p-2.5 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-center gap-2">
                    <i className="fas fa-spinner fa-spin text-blue-600"></i>
                    <span>Đang tải danh sách khung giờ...</span>
                  </div>
                ) : (
                  <select
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-500 px-3 py-2 rounded-xl text-xs text-slate-800 cursor-pointer transition"
                    disabled={availableSlots.length === 0}
                  >
                    <option value="">-- Chọn khung giờ khám --</option>
                    {availableSlots.map((slot) => (
                      <option key={slot.id} value={slot.startTime}>
                        {slot.startTime} - {slot.endTime}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Footer hành động */}
            <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseReschedule}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold transition border border-slate-200 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleRescheduleSubmit}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-xs"
                disabled={!newDate || !newTime}
              >
                Xác nhận dời lịch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Xem Bệnh Án Điện Tử Chuẩn Y Khoa */}
      {showMedicalRecordModal && activeMedicalRecord && (
        <MedicalRecordModal
          isOpen={showMedicalRecordModal}
          onClose={() => setShowMedicalRecordModal(false)}
          record={activeMedicalRecord}
          appointment={selectedRecordAppt}
        />
      )}
    </div>
  );
}
