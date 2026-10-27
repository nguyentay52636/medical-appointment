import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../hook/useFetch';
import { fetchDoctorSchedule, updateDoctorSchedule } from '../../service/doctorService';

const PRIMARY_COLOR = 'blue';
const SECONDARY_COLOR = 'emerald';

const DAYS_MAP = {
    monday: 'Thứ Hai', tuesday: 'Thứ Ba', wednesday: 'Thứ Tư',
    thursday: 'Thứ Năm', friday: 'Thứ Sáu', saturday: 'Thứ Bảy', sunday: 'Chủ Nhật'
};

const TimeTag = ({ time, duration, onRemove }) => (
    <span className={`inline-flex items-center bg-${SECONDARY_COLOR}-100 text-${SECONDARY_COLOR}-800 text-base px-4 py-2 rounded-full font-semibold transition-all shadow-md hover:shadow-lg`}>
        <i className={`fas fa-clock text-${SECONDARY_COLOR}-600 mr-2 text-sm`}></i>
        <span className="font-bold">{time}</span>
        <span className="ml-1 text-sm text-gray-600">(Thời lượng: {duration} phút)</span>
        <button
            onClick={onRemove}
            className="ml-3 text-red-600 hover:text-red-800 text-lg font-bold leading-none"
        >
            ×
        </button>
    </span>
);

function EditSchedule() {
    const { dayKey } = useParams();
    const dayName = DAYS_MAP[dayKey] || "Ngày";
    const navigate = useNavigate();
    const doctor = JSON.parse(sessionStorage.getItem("doctor"));
    const DOCTOR_ID = doctor?.id || null;

    const fetcher = useCallback(() => fetchDoctorSchedule(DOCTOR_ID), [DOCTOR_ID]);
    const { data: fullSchedule, error } = useFetch(fetcher, []);

    // currentTimes giờ là mảng object: { timeRange: "08:00-11:00", slotDurationMinutes: 15 }
    const [currentTimes, setCurrentTimes] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [newDuration, setNewDuration] = useState(15);

    // Load dữ liệu từ API → chuyển thành object
    useEffect(() => {
        if (fullSchedule && fullSchedule[dayKey]) {
            const loaded = fullSchedule[dayKey]
                .sort((a, b) => a.timeRange.localeCompare(b.timeRange));
            setCurrentTimes(loaded);

            
        }
    }, [fullSchedule, dayKey]);

    const handleAddSlot = () => {
        const timeRegex = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;
        const start = startTime.trim();
        const end = endTime.trim();

        if (!start) return alert("Giờ bắt đầu không được để trống");
        if (!end) return alert("Giờ kết thúc không được để trống");
        if (!timeRegex.test(start)) return alert("Giờ bắt đầu phải đúng định dạng HH:MM (ví dụ 09:00)");
        if (!timeRegex.test(end)) return alert("Giờ kết thúc phải đúng định dạng HH:MM (ví dụ 11:00)");
        if (start >= end) return alert("Giờ kết thúc phải lớn hơn giờ bắt đầu!");

        const timeRange = `${start}-${end}`;
        const slot = { timeRange, slotDurationMinutes: newDuration };

        // Kiểm tra trùng
        if (currentTimes.some(t => t.timeRange === timeRange)) {
            return alert("Khung giờ này đã tồn tại!");
        }

        // Kiểm tra chồng lấp
        for (const t of currentTimes) {
            const [oldStart, oldEnd] = t.timeRange.split("-");
            if (start < oldEnd && end > oldStart) {
                return alert("Khung giờ mới bị trùng với khung giờ đã tồn tại!");
            }
        }

        setCurrentTimes([...currentTimes, slot].sort((a, b) => a.timeRange.localeCompare(b.timeRange)));
        setStartTime('');
        setEndTime('');
    };

    const handleRemoveTime = (timeRangeToRemove) => {
        setCurrentTimes(currentTimes.filter(t => t.timeRange !== timeRangeToRemove));
    };

    // Tính toán dự kiến tổng giờ và số ngày làm việc sau khi lưu
    const projectedStats = (() => {
        if (!fullSchedule) return { totalHours: 0, activeDays: 0, isCompliant: false };

        let totalMins = 0;
        let activeDays = 0;

        const DAYS_LIST = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        for (const d of DAYS_LIST) {
            const slots = (d === dayKey) ? currentTimes : (fullSchedule[d] || []);
            if (slots.length > 0) {
                activeDays += 1;
                for (const s of slots) {
                    if (!s.timeRange || !s.timeRange.includes("-")) continue;
                    const [start, end] = s.timeRange.split("-");
                    const [sh, sm] = start.split(":").map(Number);
                    const [eh, em] = end.split(":").map(Number);
                    const diff = (eh * 60 + em) - (sh * 60 + sm);
                    if (diff > 0) totalMins += diff;
                }
            }
        }

        const totalHours = Math.round((totalMins / 60) * 10) / 10;
        const isCompliant = totalHours >= 20 && activeDays >= 3;
        return { totalHours, activeDays, isCompliant };
    })();

    const handleSave = async () => {
        const doctorId = JSON.parse(sessionStorage.getItem("doctor"))?.id;
        if (!doctorId) return alert("Không tìm thấy ID bác sĩ!");

        const oldTimes = (fullSchedule?.[dayKey] || []).map(t => ({
            timeRange: t.timeRange,
            slotDurationMinutes: t.slotDurationMinutes
        }));
        
        const newTimes = currentTimes.map(t => ({
            timeRange: t.timeRange,
            slotDurationMinutes: t.slotDurationMinutes
        }));
        
        if (JSON.stringify(oldTimes) === JSON.stringify(newTimes)) {
            return alert("Không có thay đổi nào để lưu!");
        }

        // Cảnh báo quy chế nếu chưa đạt định mức tối thiểu
        if (!projectedStats.isCompliant) {
            const confirmSave = window.confirm(
                `CẢNH BÁO QUY CHẾ PHÒNG KHÁM:\n\n` +
                `Sau khi lưu ngày này, tổng thời gian trực trong tuần của bạn là ${projectedStats.totalHours} giờ và ${projectedStats.activeDays} ngày làm việc.\n` +
                `(Quy chế yêu cầu tối thiểu 20 giờ và 3 ngày trực/tuần để đảm bảo nhận lịch khám).\n\n` +
                `Bạn có chắc chắn vẫn muốn lưu cấu hình này?`
            );
            if (!confirmSave) return;
        }

        setIsSaving(true);

        try {
            // Gửi đúng format: mảng object có timeRange + duration
            const payload = {
                dayOfWeek: dayKey.toLowerCase(),  
                slots: currentTimes.map(t => {
                    const [startTime, endTime] = t.timeRange.split("-");
                    return {
                        startTime,
                        endTime,
                        slotDurationMinutes: t.slotDurationMinutes
                    };
                })
            };
            console.log("PAYLOAD GỬI LÊN:", JSON.stringify(payload, null, 2));
            await updateDoctorSchedule(doctorId, payload);
            alert("Lưu lịch thành công!");
            navigate('/doctor/schedule');
        } catch (err) {
            console.error("Lỗi lưu lịch:", err);
            const errorMsg = err.response?.data || err.message || "Lỗi không xác định";
            alert("Lỗi lưu lịch: " + errorMsg);
        } finally {
            setIsSaving(false);
        }
    };

    if (error) return (
        <div className="text-center p-6 text-xl font-medium text-red-600 bg-red-50 border rounded-md shadow-lg">
            Lỗi tải lịch: {error.message}
        </div>
    );

    return (
        <div className="space-y-4">
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center border-b border-gray-200 pb-4">
                <i className={`fas fa-calendar-alt text-${PRIMARY_COLOR}-600 mr-4`}></i>
                Chỉnh Sửa Lịch Làm Việc Cố Định
            </h1>

            <div className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 space-y-8">
                <h2 className={`text-3xl font-bold text-${PRIMARY_COLOR}-700 border-b border-${PRIMARY_COLOR}-100 pb-4`}>
                    Ngày: <span className={`text-${PRIMARY_COLOR}-500`}>{dayName}</span>
                </h2>

                {/* KHUNG GIỜ HIỆN TẠI */}
                <div className="space-y-4">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center">
                        <i className={`fas fa-th-list mr-2 text-${PRIMARY_COLOR}-500`}></i>
                        Khung Giờ Đã Thiết Lập ({currentTimes.length})
                    </h3>
                    <div className={`flex flex-wrap gap-4 p-6 border-4 border-dashed border-${PRIMARY_COLOR}-200 rounded-xl min-h-[100px] bg-white transition-all`}>
                        {currentTimes.length > 0 ? (
                            currentTimes.map(slot => (
                                <TimeTag
                                    key={slot.timeRange}
                                    time={slot.timeRange}
                                    duration={slot.slotDurationMinutes}
                                    onRemove={() => handleRemoveTime(slot.timeRange)}
                                />
                            ))
                        ) : (
                            <p className="text-gray-500 italic text-base flex items-center">
                                <i className="fas fa-info-circle mr-2"></i>
                                Ngày này hiện tại không có khung giờ làm việc nào.
                            </p>
                        )}
                    </div>
                </div>

                {/* THÊM KHUNG GIỜ MỚI */}
                <div className="pt-6 border-t border-gray-100 space-y-6">
                    <h3 className="text-xl font-bold text-gray-700 flex items-center">
                        <i className={`fas fa-plus-circle mr-2 text-${PRIMARY_COLOR}-500`}></i>
                        Thêm Khung Giờ Mới
                    </h3>

                    <div className="flex flex-col sm:flex-row gap-4 items-end">
                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ bắt đầu</label>
                            <input
                                type="text"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                placeholder="08:00"
                                className={`w-full p-3 border-2 border-gray-300 rounded-xl shadow-inner text-base focus:border-${PRIMARY_COLOR}-500 focus:ring-${PRIMARY_COLOR}-500 transition-all`}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Giờ kết thúc</label>
                            <input
                                type="text"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                placeholder="11:00"
                                className={`w-full p-3 border-2 border-gray-300 rounded-xl shadow-inner text-base focus:border-${PRIMARY_COLOR}-500 focus:ring-${PRIMARY_COLOR}-500 transition-all`}
                            />
                        </div>

                        <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thời lượng khám</label>
                            <select
                                value={newDuration}
                                onChange={(e) => setNewDuration(Number(e.target.value))}
                                className={`w-full p-3 border-2 border-gray-300 rounded-xl shadow-inner text-base bg-white focus:border-${PRIMARY_COLOR}-500 focus:ring-${PRIMARY_COLOR}-500 transition-all`}
                            >
                                <option value={10}>10 phút</option>
                                <option value={15}>15 phút</option>
                                <option value={20}>20 phút</option>
                                <option value={30}>30 phút</option>
                                <option value={45}>45 phút</option>
                                <option value={60}>60 phút</option>
                            </select>
                        </div>

                        <button
                            onClick={handleAddSlot}
                            className={`bg-${PRIMARY_COLOR}-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-${PRIMARY_COLOR}-700 transition-all shadow-lg transform hover:scale-[1.03] flex items-center sm:ml-4 cursor-pointer`}
                        >
                            <i className="fas fa-plus mr-2"></i> Thêm khung
                        </button>
                    </div>

                    <p className="text-sm text-gray-500">
                        Nhập giờ theo định dạng 24h (HH:MM). Ví dụ: 08:00 - 11:00
                    </p>
                </div>
            </div>

            {/* Projected Weekly Compliance Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${projectedStats.isCompliant ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                <div className="flex items-center gap-2.5 text-sm font-semibold">
                    <i className={`fas ${projectedStats.isCompliant ? 'fa-check-circle text-emerald-600 text-base' : 'fa-exclamation-triangle text-amber-600 text-base'}`}></i>
                    <span>
                        Tổng giờ trực dự kiến cả tuần: <strong className="text-base">{projectedStats.totalHours}h / 20h</strong> ({projectedStats.activeDays} / 3 ngày)
                    </span>
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full self-start sm:self-auto ${projectedStats.isCompliant ? 'bg-emerald-200 text-emerald-900' : 'bg-amber-200 text-amber-900'}`}>
                    {projectedStats.isCompliant ? '✓ Đạt định mức tối thiểu' : '⚠ Dưới định mức tối thiểu (Cần ≥ 20h, ≥ 3 ngày)'}
                </span>
            </div>

            <div className="flex justify-between pt-2">
                <button
                    onClick={() => navigate('/doctor/schedule')}
                    className="bg-red-500 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-red-600 transition-all shadow-xl transform hover:scale-[1.01] flex items-center cursor-pointer"
                >
                    <i className="fas fa-arrow-left mr-3"></i> Quay Lại
                </button>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className={`bg-${SECONDARY_COLOR}-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-${SECONDARY_COLOR}-700 transition-all shadow-xl transform hover:scale-[1.01] flex items-center cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed`}
                >
                    {isSaving ? <>Đang Lưu...</> : <>Lưu Lịch Làm Việc</>}
                </button>
            </div>
        </div>
    );
}

export default EditSchedule;