// src/pages/doctor/Schedule.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hook/useFetch';
import { fetchDoctorSchedule, fetchScheduleSummary, initDefaultDoctorSchedule } from '../../service/doctorService';

const DAYS = {
    monday: 'Thứ Hai', tuesday: 'Thứ Ba', wednesday: 'Thứ Tư',
    thursday: 'Thứ Năm', friday: 'Thứ Sáu', saturday: 'Thứ Bảy', sunday: 'Chủ Nhật'
};

// -------------------------------
// COMPONENT ITEM
// -------------------------------
const ScheduleItem = React.memo(({ dayKey, dayName, times }) => {
    const isOff = !times || times.length === 0;

    return (
        <div className={`p-6 rounded-xl shadow-lg border-2 transition-all hover:shadow-xl ${isOff ? "bg-gray-50 border-gray-200" : "bg-blue-50/60 border-blue-300"}`}>
            <div className="flex justify-between items-start mb-3 border-b border-dashed border-gray-300 pb-3">
                <h3 className={`text-xl font-bold ${isOff ? "text-gray-600" : "text-blue-700"}`}>
                    {dayName}
                </h3>

                <Link
                    to={`/doctor/schedule/edit/${dayKey}`}
                    className="text-xs font-bold py-2 px-3 rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-all"
                >
                    <i className="fas fa-edit mr-1"></i> Chỉnh sửa
                </Link>
            </div>

            <div className="min-h-[80px] flex flex-col gap-2">
                {isOff ? (
                    <span className="text-red-500 italic flex items-center font-medium text-sm">
                        <i className="fas fa-info-circle mr-2"></i>
                        Nghỉ trực / Không có ca
                    </span>
                ) : (
                    times.map((item, idx) => (
                        <div
                            key={idx}
                            className="inline-flex w-fit items-center bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-full font-semibold border border-emerald-300 text-sm">
                            <i className="fas fa-clock mr-1.5 text-xs text-emerald-600"></i>
                            {item.timeRange.replace("-", " — ")}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
});

// -------------------------------
// PAGE CHÍNH
// -------------------------------
function Schedule() {
    const doctor = JSON.parse(sessionStorage.getItem('doctor'));

    if (!doctor) {
        return (
            <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border rounded-xl shadow-md">
                Không tìm thấy thông tin bác sĩ.
            </div>
        );
    }
    
    const DOCTOR_ID = doctor?.id || 1;

    const [summary, setSummary] = useState(null);
    const [isResetting, setIsResetting] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const fetchScheduleStable = useCallback(
        () => fetchDoctorSchedule(DOCTOR_ID),
        [DOCTOR_ID, refreshKey]
    );

    const { data: schedule, error, isLoading } = useFetch(fetchScheduleStable, [refreshKey]);

    const loadSummary = useCallback(async () => {
        try {
            const data = await fetchScheduleSummary(DOCTOR_ID);
            setSummary(data);
        } catch (err) {
            console.error("Lỗi lấy tóm tắt định mức làm việc:", err);
        }
    }, [DOCTOR_ID]);

    useEffect(() => {
        loadSummary();
    }, [loadSummary, refreshKey]);

    const handleApplyDefaultSchedule = async () => {
        if (!window.confirm("Bạn có chắc muốn áp dụng Lịch làm việc chuẩn (Thứ 2 đến Thứ 6: 08:00 - 11:30 & 13:30 - 17:00, 35 giờ/tuần)? Các ca khám cũ sẽ được làm mới.")) {
            return;
        }

        setIsResetting(true);
        try {
            await initDefaultDoctorSchedule(DOCTOR_ID);
            alert("Đã áp dụng Lịch làm việc chuẩn (Thứ 2 - Thứ 6) thành công!");
            setRefreshKey(prev => prev + 1);
        } catch (err) {
            alert(err.response?.data || err.message || "Lỗi khi áp dụng lịch chuẩn");
        } finally {
            setIsResetting(false);
        }
    };

    if (isLoading)
        return (
            <div className="text-center p-8 text-xl font-semibold text-blue-600 bg-white shadow-lg rounded-xl">
                Đang tải lịch làm việc...
            </div>
        );

    if (error)
        return (
            <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border rounded-xl shadow-md">
                Lỗi tải lịch: {error.message}
            </div>
        );

    const totalHours = summary?.totalWeeklyHours ?? 0;
    const minHours = summary?.minRequiredHours ?? 20;
    const activeDays = summary?.activeDaysCount ?? 0;
    const minDays = summary?.minRequiredDays ?? 3;
    const isCompliant = summary?.isCompliant ?? false;
    const hoursPercent = Math.min(100, Math.round((totalHours / minHours) * 100));

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-4">
                <div>
                    <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                        <i className="fas fa-calendar-alt text-blue-600 mr-3.5"></i>
                        Quản Lý Lịch Làm Việc Cố Định
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">
                        Cấu hình ca trực hàng tuần, đảm bảo định mức thời gian tối thiểu theo quy chế phòng khám.
                    </p>
                </div>

                <button
                    onClick={handleApplyDefaultSchedule}
                    disabled={isResetting}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition cursor-pointer self-start sm:self-auto disabled:opacity-50"
                    title="Khôi phục ca trực chuẩn 35h/tuần (Thứ 2 đến Thứ 6)"
                >
                    <i className={`fas fa-magic ${isResetting ? 'fa-spin' : ''}`}></i>
                    {isResetting ? 'Đang cập nhật...' : 'Áp Dụng Lịch Chuẩn (Thứ 2 - Thứ 6)'}
                </button>
            </div>

            {/* Compliance Banner */}
            <div className={`p-6 rounded-2xl border shadow-sm transition ${isCompliant ? 'bg-gradient-to-r from-emerald-50 via-teal-50 to-white border-emerald-200' : 'bg-gradient-to-r from-amber-50 via-orange-50 to-white border-amber-200'}`}>
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2.5">
                            <span className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide flex items-center gap-1.5 ${isCompliant ? 'bg-emerald-600 text-white shadow-sm' : 'bg-amber-600 text-white shadow-sm'}`}>
                                <i className={`fas ${isCompliant ? 'fa-check-circle' : 'fa-exclamation-triangle'}`}></i>
                                {isCompliant ? 'Đạt Chuẩn Quy Chế Phòng Khám' : 'Chưa Đạt Định Mức Tối Thiểu'}
                            </span>
                            <span className="text-xs text-gray-500">
                                Quy chế: Tối thiểu {minHours} giờ/tuần & {minDays} ngày trực
                            </span>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {summary?.complianceMessage || 'Đang kiểm tra tuân thủ quy chế...'}
                        </h2>
                        <p className="text-xs text-gray-600 max-w-2xl">
                            {isCompliant
                                ? 'Hệ thống đã tự động mở đầy đủ các khung giờ khám khả dụng để bệnh nhân có thể tìm kiếm và đặt lịch với bạn.'
                                : 'Lưu ý: Bác sĩ cần đăng ký đủ định mức tối thiểu để hồ sơ hiển thị đầy đủ trên hệ thống đặt lịch khám trực tuyến của phòng khám.'}
                        </p>
                    </div>

                    {/* Progress indicators */}
                    <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-gray-200/80 shadow-sm shrink-0">
                        <div className="text-center">
                            <div className="text-xs font-bold uppercase text-gray-400 mb-0.5">Tổng Giờ Trực</div>
                            <div className="text-2xl font-black text-blue-700">
                                {totalHours} <span className="text-xs text-gray-500 font-semibold">/ {minHours}h</span>
                            </div>
                            <div className="w-24 bg-gray-200 h-2 rounded-full mt-1.5 overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-500 ${isCompliant ? 'bg-emerald-500' : 'bg-amber-500'}`}
                                    style={{ width: `${hoursPercent}%` }}
                                ></div>
                            </div>
                        </div>

                        <div className="h-10 w-[1px] bg-gray-200"></div>

                        <div className="text-center">
                            <div className="text-xs font-bold uppercase text-gray-400 mb-0.5">Số Ngày Trực</div>
                            <div className="text-2xl font-black text-indigo-700">
                                {activeDays} <span className="text-xs text-gray-500 font-semibold">/ {minDays} ngày</span>
                            </div>
                            <div className="text-[11px] font-semibold text-gray-500 mt-1">
                                {activeDays >= minDays ? 'Đủ số ngày' : `Thiếu ${minDays - activeDays} ngày`}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Schedule Grid */}
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <i className="fas fa-list-alt text-blue-600"></i>
                        Thời Khóa Biểu Chi Tiết Theo Thứ
                    </h2>
                    <span className="text-xs font-semibold text-gray-500">
                        Bấm "Chỉnh sửa" tại từng ngày để cập nhật khung giờ
                    </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Object.entries(DAYS).map(([key, dayName]) => (
                        <ScheduleItem
                            key={key}
                            dayKey={key}
                            dayName={dayName}
                            times={schedule?.[key] ?? []}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Schedule;
