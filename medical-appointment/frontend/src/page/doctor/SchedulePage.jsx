// src/pages/doctor/Schedule.jsx
import React, { useCallback } from 'react';
import { Link } from 'react-router-dom';
import useFetch from '../../hook/useFetch';
import { fetchDoctorSchedule } from '../../service/doctorService';

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
        <div className={`p-6 rounded-xl shadow-lg border-2 ${isOff ? "bg-gray-50 border-gray-200" : "bg-blue-50 border-blue-300"}`}>
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
                    <span className="text-red-600 italic flex items-center font-medium">
                        <i className="fas fa-info-circle mr-2"></i>
                        Không có lịch làm việc
                    </span>
                ) : (
                    times.map((item, idx) => (
                        <div
                            key={idx}
                            className="inline-flex w-fit items-center bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full font-semibold border border-emerald-300">
                            <i className="fas fa-clock mr-2"></i>
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

    const fetchScheduleStable = useCallback(
        () => fetchDoctorSchedule(DOCTOR_ID),
        [DOCTOR_ID]
    );

    const { data: schedule, error, isLoading } = useFetch(fetchScheduleStable, []);

    console.log(">>> BACKEND SCHEDULE:", schedule);

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

    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-extrabold text-gray-900 border-b-4 border-black-600/30 pb-3 tracking-tight flex items-center">
                <i className="fas fa-calendar-alt text-blue-600 mr-4"></i>
                Quản Lý Lịch Làm Việc Cố Định
            </h1>

            <div className="bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 space-y-6">
                <h2 className="text-2xl font-bold text-blue-700 border-b border-blue-100 pb-3 mb-4">
                    <i className="fas fa-list-alt mr-2"></i>
                    Lịch Trình Hàng Tuần
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {Object.entries(DAYS).map(([key, dayName]) => (
                        <ScheduleItem
                            key={key}
                            dayKey={key}
                            dayName={dayName}
                            times={schedule?.[key] ?? []}   // <-- Lấy dữ liệu đúng
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Schedule;
