import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { fetchDoctorById, fetchScheduleSummary } from '../../service/doctorService';
import { bookableSlotService } from '../../service/bookableSlotService';
import { PatientContext } from '../../context/PatientContext';
import { useToast } from '../../context/ToastContext';
import DEFAULT_DOCTOR_IMAGE from '../../assets/doctor.webp';

export default function DoctorDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { patient } = useContext(PatientContext);
  const { success, warning, error: showToastError } = useToast();

  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scheduleSummary, setScheduleSummary] = useState(null);

  // Chọn ngày khám & Slot
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Sinh danh sách 7 ngày tiếp theo để bệnh nhân chọn lịch nhanh
  const next7Days = (() => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const weekdayVi = i === 0 ? 'Hôm nay' : d.toLocaleDateString('vi-VN', { weekday: 'short' });
      const dayMonth = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
      days.push({ dateStr, weekdayVi, dayMonth, fullDate: d });
    }
    return days;
  })();

  // Nạp dữ liệu Bác Sĩ & Lịch trực
  useEffect(() => {
    if (!id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [docData, summary] = await Promise.all([
          fetchDoctorById(id),
          fetchScheduleSummary(id).catch(() => null),
        ]);
        setDoctor(docData);
        setScheduleSummary(summary);

        // Mặc định chọn ngày hôm nay
        const todayStr = new Date().toISOString().split('T')[0];
        setSelectedDate(todayStr);
      } catch (err) {
        console.error('Lỗi tải thông tin bác sĩ:', err);
        showToastError('Không tìm thấy bác sĩ', 'Thông tin bác sĩ không tồn tại hoặc đã ngừng công tác.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id]);

  // Nạp Slot khả dụng khi ngày được chọn thay đổi
  useEffect(() => {
    if (!id || !selectedDate) return;

    const loadSlots = async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const slots = await bookableSlotService.getAvailableSlots(id, selectedDate);
        const now = new Date();
        const selDateObj = new Date(selectedDate);

        // Lọc slot chưa qua giờ nếu là ngày hôm nay
        const valid = slots.filter((slot) => {
          if (slot.status !== 'available') return false;
          if (selDateObj.toDateString() === now.toDateString()) {
            return slot.startTime > now.toTimeString().slice(0, 5);
          }
          return true;
        });

        setAvailableSlots(valid);
      } catch (err) {
        console.error('Lỗi nạp slot:', err);
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };

    loadSlots();
  }, [id, selectedDate]);

  // Xử lý khi nhấn nút Đặt lịch
  const handleProceedBooking = () => {
    const token = sessionStorage.getItem('patient');
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    if (!selectedSlot) {
      warning('Vui lòng chọn khung giờ', 'Hãy chọn một khung giờ khám trước khi tiếp tục.');
      return;
    }

    // Điều hướng sang BookingPage kèm pre-fill Bác sĩ, Ngày & Slot
    navigate('/patient/booking', {
      state: {
        doctor: doctor,
        date: selectedDate,
        slotId: selectedSlot.id,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-12 h-12 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></div>
        <p className="text-sm font-semibold text-slate-600">Đang tải hồ sơ bác sĩ chuyên khoa...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="max-w-2xl mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 shadow-sm text-center space-y-4">
        <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-2xl mx-auto">
          <i className="fas fa-user-slash"></i>
        </div>
        <h2 className="text-xl font-bold text-slate-800">Không tìm thấy thông tin bác sĩ</h2>
        <p className="text-xs text-slate-500">Bác sĩ có thể đã chuyển công tác hoặc liên kết không chính xác.</p>
        <Link
          to="/patient/doctor_list"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
        >
          <i className="fas fa-arrow-left"></i>
          <span>Quay lại danh sách bác sĩ</span>
        </Link>
      </div>
    );
  }

  // Dữ liệu tiểu sử mẫu y khoa chuẩn hóa nếu DB còn trống
  const degree = doctor.experienceYears >= 10 ? 'ThS. BSCKII' : doctor.experienceYears >= 5 ? 'ThS. BSCKI' : 'Bác sĩ';
  const displayPrice = doctor.pricePerAppointment || 250000;
  const ratingScore = '4.9';
  const totalReviews = 120 + ((doctor.id * 17) % 80);
  const totalCompleted = 850 + ((doctor.id * 93) % 600);

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
            <Link to="/patient/doctor_list" className="hover:text-blue-600 transition">
              Đội ngũ bác sĩ
            </Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold truncate max-w-xs">{doctor.fullName}</span>
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        
        {/* ================= HERO PROFILE CARD ================= */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden p-6 md:p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
            
            {/* Ảnh đại diện Bác sĩ */}
            <div className="relative shrink-0">
              <img
                src={doctor.imageUrl || DEFAULT_DOCTOR_IMAGE}
                alt={doctor.fullName}
                className="w-40 h-40 md:w-52 md:h-52 object-cover rounded-2xl border-2 border-slate-100 shadow-md"
              />
              <span className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold text-center py-1 rounded-lg flex items-center justify-center gap-1.5 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Nhận lịch hôm nay</span>
              </span>
            </div>

            {/* Thông tin chính */}
            <div className="flex-1 text-center md:text-left space-y-3">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <i className="fas fa-stethoscope mr-1"></i> {doctor.specialtyName || 'Đa khoa'}
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <i className="fas fa-award mr-1"></i> {doctor.experienceYears} năm kinh nghiệm
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                  ⭐ {ratingScore} ({totalReviews} đánh giá)
                </span>
              </div>

              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {degree} {doctor.fullName}
                </h1>
                <p className="text-xs md:text-sm text-slate-500 mt-1 flex items-center justify-center md:justify-start gap-1.5">
                  <i className="fas fa-hospital text-blue-600"></i>
                  <span>Phòng khám Đa khoa Quốc tế Klinik | Chuyên gia {doctor.specialtyName}</span>
                </p>
              </div>

              {/* Thông số tín nhiệm */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Ca khám</span>
                  <p className="text-base font-bold text-slate-900 font-mono">{totalCompleted}+</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Hài lòng</span>
                  <p className="text-base font-bold text-emerald-600 font-mono">98.8%</p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Giá khám</span>
                  <p className="text-base font-bold text-blue-700 font-mono">
                    {displayPrice.toLocaleString('vi-VN')} đ
                  </p>
                </div>
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-center">
                  <span className="text-[11px] font-semibold text-slate-500 uppercase block">Phòng khám</span>
                  <p className="text-base font-bold text-slate-900">P.302 (Khu A)</p>
                </div>
              </div>

              {/* Mô tả ngắn */}
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                {doctor.bio || `Bác sĩ chuyên khoa ${doctor.specialtyName || ''} với hơn ${doctor.experienceYears} năm công tác tại các bệnh viện tuyến đầu, chuyên điều trị các bệnh lý phức tạp, tư vấn tận tâm và theo dõi sát sao phác đồ điều trị cho từng người bệnh.`}
              </p>
            </div>

          </div>
        </div>

        {/* ================= GRID 2 CỘT: LỊCH KHÁM & CHI TIẾT NĂNG LỰC ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* CỘT TRÁI (5/12): LỊCH KHÁM & CHỌN KHUNG GIỜ NHANH */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Thẻ đặt lịch khám trực tuyến */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center text-sm shadow-xs">
                    <i className="fas fa-calendar-check"></i>
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                      Lịch Khám Bệnh Trực Tuyến
                    </h2>
                    <p className="text-[11px] text-slate-500">Chọn ngày và giờ phù hợp để giữ chỗ</p>
                  </div>
                </div>
              </div>

              {/* Lịch trực của Bác sĩ trong tuần */}
              {scheduleSummary?.workingDaysVi && scheduleSummary.workingDaysVi.length > 0 && (
                <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl space-y-1.5 text-xs">
                  <span className="font-bold text-blue-950 flex items-center gap-1.5">
                    <i className="far fa-calendar-alt text-blue-600"></i> Ngày trực cố định trong tuần:
                  </span>
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {scheduleSummary.workingDaysVi.map((d, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-white text-blue-800 border border-blue-200 text-[11px] font-semibold">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Bộ chọn 7 ngày tiếp theo */}
              <div className="space-y-2">
                <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  1. Chọn ngày khám
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                  {next7Days.map((item) => {
                    const isSelected = selectedDate === item.dateStr;
                    return (
                      <button
                        key={item.dateStr}
                        type="button"
                        onClick={() => setSelectedDate(item.dateStr)}
                        className={`p-2 rounded-xl text-center border transition cursor-pointer flex flex-col items-center justify-center ${
                          isSelected
                            ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200'
                        }`}
                      >
                        <span className={`text-[10px] font-bold uppercase ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {item.weekdayVi}
                        </span>
                        <span className="text-xs font-extrabold mt-0.5 font-mono">
                          {item.dayMonth}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Danh sách khung giờ trống */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                    2. Chọn khung giờ khám
                  </label>
                  <span className="text-[11px] text-slate-500">
                    {availableSlots.length} khung giờ khả dụng
                  </span>
                </div>

                {slotsLoading ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <i className="fas fa-spinner fa-spin text-xl text-blue-600"></i>
                    <p className="text-xs text-slate-500">Đang tìm các khung giờ trống...</p>
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="p-6 text-center bg-amber-50/60 border border-amber-200 rounded-2xl text-amber-900 text-xs space-y-1">
                    <i className="fas fa-calendar-xmark text-lg text-amber-600"></i>
                    <p className="font-bold">Ngày này không có ca trực hoặc đã kín lịch</p>
                    <p className="text-[11px] text-amber-800">
                      Vui lòng chọn một ngày khác theo lịch trực của bác sĩ.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                    {availableSlots.map((slot) => {
                      const isPicked = selectedSlot?.id === slot.id;
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`py-2 px-2.5 rounded-xl text-xs font-mono font-bold border transition flex items-center justify-center gap-1.5 cursor-pointer ${
                            isPicked
                              ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                              : 'bg-white hover:bg-blue-50/60 text-slate-800 border-slate-200 hover:border-blue-300'
                          }`}
                        >
                          <i className={`far fa-clock text-[11px] ${isPicked ? 'text-blue-100' : 'text-slate-400'}`}></i>
                          <span>{slot.startTime} - {slot.endTime}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Nút Đặt lịch khi đã chọn slot */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                {selectedSlot && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-emerald-700 block font-semibold">Khung giờ đã chọn:</span>
                      <strong className="text-emerald-900 font-mono text-sm">
                        {selectedSlot.startTime} - {selectedSlot.endTime}
                      </strong>
                    </div>
                    <span className="px-2 py-1 rounded bg-white text-emerald-800 border border-emerald-300 font-bold text-[11px]">
                      Hợp lệ
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleProceedBooking}
                  className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider transition shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <i className="fas fa-calendar-check text-base"></i>
                  <span>Xác Nhận Đặt Lịch Khám Ngay</span>
                </button>

                <p className="text-[11px] text-center text-slate-500">
                  <i className="fas fa-shield-alt text-blue-600 mr-1"></i> Miễn phí đặt lịch - Thanh toán tại phòng khám hoặc trực tuyến
                </p>
              </div>
            </div>

            {/* Thông tin phòng khám & liên hệ */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 space-y-3.5 text-xs text-slate-700">
              <h3 className="font-bold text-slate-900 text-xs uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <i className="fas fa-location-dot text-rose-500"></i> Địa chỉ nơi khám bệnh
              </h3>
              <div className="space-y-1">
                <p className="font-bold text-slate-900 text-sm">Phòng Khám Đa Khoa Quốc Tế Klinik</p>
                <p className="text-slate-600 leading-relaxed">
                  {doctor.address || '273 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh'}
                </p>
                <p className="text-slate-500">Phòng khám chuyên khoa: Khu B - Tầng 3 (Phòng 302)</p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Hotline hỗ trợ 24/7:</span>
                <a href="tel:0846777901" className="font-bold text-blue-600 hover:underline">
                  (+84) 846 777 901
                </a>
              </div>
            </div>

          </div>

          {/* CỘT PHẢI (7/12): TIỂU SỬ, BẰNG CẤP & NĂNG LỰC CHUYÊN MÔN */}
          <div className="lg:col-span-7 space-y-6">

            {/* 1. Giới thiệu & Quá trình công tác */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-7 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-sm">
                  <i className="fas fa-user-md"></i>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Tiểu Sử & Quá Trình Đào Tạo
                </h3>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed space-y-3">
                <p className="whitespace-pre-line">
                  {doctor.bio || `${degree} ${doctor.fullName} là một trong những bác sĩ chuyên khoa ${doctor.specialtyName || ''} uy tín tại TP. Hồ Chí Minh. Bác sĩ đã có hơn ${doctor.experienceYears} năm kinh nghiệm thực hành lâm sàng, thường xuyên tham gia các hội nghị khoa học và cập nhật các phác đồ điều trị tiên tiến nhất của thế giới.`}
                </p>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-900">
                    Bằng cấp & Chứng chỉ chuyên môn:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5 shrink-0"></i>
                      <span>Tốt nghiệp Bác sĩ Đa khoa - Đại học Y Dược TP. Hồ Chí Minh.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5 shrink-0"></i>
                      <span>Tốt nghiệp Thạc sĩ Y khoa - Chuyên ngành {doctor.specialtyName || 'Nội khoa'}.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5 shrink-0"></i>
                      <span>Chứng chỉ Hành nghề Khám chữa bệnh do Sở Y Tế cấp phép.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-check-circle text-emerald-500 mt-0.5 shrink-0"></i>
                      <span>Chứng chỉ Đào tạo Y khoa liên tục (CME) & Siêu âm chẩn đoán can thiệp.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-2 pt-2">
                  <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider text-blue-900">
                    Kinh nghiệm công tác thực tế:
                  </h4>
                  <ul className="space-y-2">
                    <li className="flex items-start gap-2">
                      <i className="fas fa-hospital text-blue-600 mt-0.5 shrink-0"></i>
                      <span>Bác sĩ chuyên khoa điều trị tại Phòng khám Đa khoa Quốc tế Klinik (Hiện tại).</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-hospital text-blue-600 mt-0.5 shrink-0"></i>
                      <span>Nguyên Bác sĩ điều trị tại Khoa {doctor.specialtyName || 'Khám bệnh'} - Bệnh viện Chợ Rẫy.</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <i className="fas fa-hospital text-blue-600 mt-0.5 shrink-0"></i>
                      <span>Thành viên Hội Y Học Lâm Sàng TP. Hồ Chí Minh.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 2. Các bệnh lý chuyên sâu tiếp nhận */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-7 space-y-4">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm">
                  <i className="fas fa-stethoscope"></i>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Thế Mạnh Chuyên Môn & Dịch Vụ Tiếp Nhận
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block">Khám & Tầm soát chuyên sâu</span>
                  <p className="text-slate-600">Đánh giá các triệu chứng lâm sàng ban đầu và lập kế hoạch điều trị toàn diện.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block">Điều trị bệnh lý mạn tính</span>
                  <p className="text-slate-600">Kiểm soát và kê đơn thuốc cho các bệnh nhân có bệnh nền kéo dài.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block">Chẩn đoán hình ảnh & Cận lâm sàng</span>
                  <p className="text-slate-600">Đọc kết quả xét nghiệm máu, siêu âm, điện tim và chụp X-quang kỹ thuật số.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <span className="font-bold text-slate-900 block">Tư vấn dinh dưỡng & Lối sống</span>
                  <p className="text-slate-600">Hướng dẫn chế độ ăn uống, tập luyện để phục hồi sức khỏe bền vững.</p>
                </div>
              </div>
            </div>

            {/* 3. Lưu ý dành cho bệnh nhân */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-7 space-y-3.5">
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center text-sm">
                  <i className="fas fa-circle-info"></i>
                </div>
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                  Lưu Ý Quan Trọng Cho Người Bệnh Trước Khi Đến Khám
                </h3>
              </div>

              <div className="space-y-2 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2">
                  <i className="fas fa-clock text-amber-600 mt-0.5 shrink-0"></i>
                  <span>Vui lòng có mặt tại quầy lễ tân trước giờ khám <strong>10 - 15 phút</strong> để làm thủ tục tiếp nhận.</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-file-prescription text-amber-600 mt-0.5 shrink-0"></i>
                  <span>Mang theo toa thuốc đang uống, kết quả xét nghiệm hoặc phim chụp trong vòng 6 tháng gần nhất (nếu có).</span>
                </div>
                <div className="flex items-start gap-2">
                  <i className="fas fa-utensils text-amber-600 mt-0.5 shrink-0"></i>
                  <span>Nếu cần làm xét nghiệm máu tổng quát hoặc nội soi tiêu hóa, quý khách vui lòng <strong>nhịn ăn sáng từ 6 - 8 tiếng</strong>.</span>
                </div>
              </div>
            </div>

            {/* 4. Đánh giá của bệnh nhân */}
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 md:p-7 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center text-sm">
                    <i className="fas fa-star"></i>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Đánh Giá Từ Bệnh Nhân Đã Khám ({totalReviews})
                  </h3>
                </div>
                <span className="text-xs font-bold text-amber-600">⭐ {ratingScore} / 5.0</span>
              </div>

              <div className="space-y-3.5">
                {/* Review 1 */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
                        H
                      </div>
                      <span className="font-bold text-slate-900">Hoàng Thị Mai</span>
                      <span className="text-[10px] text-slate-400">Đã khám ngày 28/10/2026</span>
                    </div>
                    <span className="text-amber-500 text-[11px]">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Bác sĩ {doctor.fullName} khám rất tỉ mỉ và ân cần. Giải thích kỹ từng chỉ số xét nghiệm và giải đáp tận tình mọi câu hỏi của người bệnh. Uống thuốc theo toa 3 ngày là đỡ hẳn.
                  </p>
                </div>

                {/* Review 2 */}
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-bold">
                        T
                      </div>
                      <span className="font-bold text-slate-900">Trần Quốc Bảo</span>
                      <span className="text-[10px] text-slate-400">Đã khám ngày 24/10/2026</span>
                    </div>
                    <span className="text-amber-500 text-[11px]">⭐⭐⭐⭐⭐</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed">
                    Đặt lịch trực tuyến qua hệ thống Klinik rất tiện lợi, đến nơi có nhân viên điều dưỡng hướng dẫn vào phòng khám ngay. Bác sĩ chuyên môn rất giỏi, dặn dò chế độ kiêng cữ chu đáo.
                  </p>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Modal nhắc nhở Đăng nhập */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[9999] p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-sm w-full shadow-2xl text-center space-y-4 border border-slate-200">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-2xl mx-auto">
              <i className="fas fa-lock"></i>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Vui lòng đăng nhập</h3>
              <p className="text-xs text-slate-500 mt-1">
                Bạn cần đăng nhập tài khoản người bệnh để bảo lưu lịch khám và nhận hồ sơ bệnh án điện tử.
              </p>
            </div>
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/patient/login');
                }}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition cursor-pointer shadow-sm"
              >
                Đăng nhập ngay
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowAuthModal(false);
                  navigate('/patient/register');
                }}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition cursor-pointer"
              >
                Tạo tài khoản mới
              </button>
              <button
                type="button"
                onClick={() => setShowAuthModal(false)}
                className="text-xs text-slate-400 hover:text-slate-600 pt-1"
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
