import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const PRIMARY_COLOR = 'blue';

function Appointments() {
    //nên dùng component để lấy doctor vì để dữ liệu luôn load đúng
    const [doctor, setDoctor] = useState(() => JSON.parse(sessionStorage.getItem("doctor")) || {});
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterDate, setFilterDate] = useState('');
    const [filterStatus, setFilterStatus] = useState('');

    // gọi API để lấy danh sách lịch hẹn theo doctor.id
    const fetchAppointments = async () => {
        if (!doctor.id) return setError('Không tìm thấy thông tin bác sĩ');
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`http://localhost:8080/api/appointment/doctor/${doctor.id}`);
            setAppointments(response.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    // Fetch khi component mount hoặc khi doctor thay đổi
    useEffect(() => {
        fetchAppointments();
    }, [doctor]);

    const [actionLoadingId, setActionLoadingId] = useState(null);

    // Xử lý xác nhận nhanh lịch hẹn trực tiếp từ danh sách
    const handleQuickConfirm = async (e, appointmentId) => {
        e.preventDefault();
        e.stopPropagation();
        if (!window.confirm("Bác sĩ có chắc chắn muốn xác nhận lịch khám này không?")) return;
        setActionLoadingId(appointmentId);
        try {
            await axios.post(`http://localhost:8080/api/doctor/${doctor.id}/appointments/${appointmentId}/action`, { action: 'confirm' });
            alert("Đã tiếp nhận và xác nhận lịch hẹn thành công!");
            fetchAppointments();
        } catch (err) {
            alert(`Lỗi xác nhận: ${err.response?.data?.message || err.message}`);
        } finally {
            setActionLoadingId(null);
        }
    };

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-800 border border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold animate-pulse';
            case 'completed': return 'bg-gray-100 text-gray-700';
            case 'missed': return 'bg-gray-100 text-gray-700 border-gray-300';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getStatusName = (status) => {
        switch (status) {
            case 'confirmed': return 'Đã xác nhận';
            case 'pending': return 'Chờ duyệt';
            case 'completed': return 'Đã khám';
            case 'missed': return 'Đã bỏ lỡ';
            case 'cancelled': return 'Đã hủy';
            default: return 'Khác';
        }
    };

    if (error) {
        return (
            <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border rounded-xl shadow-md">
                {error}.{' '}
                <button onClick={fetchAppointments} className="text-red-500 hover:underline font-semibold ml-2 cursor-pointer">
                    Thử lại
                </button>
            </div>
        );
    }

    // Lọc & Tìm kiếm
    const handleResetFilter = () => {
        setSearchTerm('');
        setFilterDate('');
        setFilterStatus('');
    };

    const filteredAppointments = appointments.filter(appt => {
        // Lọc theo trạng thái
        if (filterStatus && appt.status !== filterStatus) return false;
        // Lọc theo ngày
        if (filterDate && appt.date && appt.date.slice(0, 10) !== filterDate) return false;
        // Tìm kiếm theo tên, số điện thoại, mã lịch hẹn, lý do khám, email
        if (searchTerm.trim()) {
            const q = searchTerm.trim().toLowerCase();
            const matchName = appt.patientName?.toLowerCase().includes(q);
            const matchPhone = appt.patientPhone?.toLowerCase().includes(q);
            const matchCode = (appt.appointmentCode || String(appt.id))?.toLowerCase().includes(q);
            const matchReason = appt.reason?.toLowerCase().includes(q);
            const matchEmail = appt.patientEmail?.toLowerCase().includes(q);
            if (!matchName && !matchPhone && !matchCode && !matchReason && !matchEmail) {
                return false;
            }
        }
        return true;
    });

    return (
        <div className="space-y-6">
            {/* Bộ lọc & Tìm kiếm Người Bệnh */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 space-y-4">
                {/* Thanh tìm kiếm người bệnh chính */}
                <div className="relative">
                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1.5 flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                            <i className="fas fa-search text-blue-600"></i> Tìm kiếm người bệnh / Ca khám
                        </span>
                        {searchTerm && (
                            <span className="text-[11px] text-blue-600 font-semibold lowercase">
                                Đang lọc theo từ khóa: "{searchTerm}"
                            </span>
                        )}
                    </label>
                    <div className="relative flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                            <i className="fas fa-user-search text-sm"></i>
                        </div>
                        <input
                            type="text"
                            placeholder="Nhập họ tên người bệnh, số điện thoại, mã ca khám (#APT...), hoặc lý do khám..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 text-sm font-medium transition shadow-2xs"
                        />
                        {searchTerm && (
                            <button
                                type="button"
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                                title="Xóa từ khóa tìm kiếm"
                            >
                                <i className="fas fa-times-circle text-base"></i>
                            </button>
                        )}
                    </div>
                </div>

                {/* Hàng lọc phụ: Ngày khám & Trạng thái & Reset */}
                <div className="grid grid-cols-1 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-1">
                    {/* Lọc theo ngày */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                            <i className="far fa-calendar-alt text-gray-400"></i> Ngày khám:
                        </label>
                        <input
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-100 cursor-pointer bg-white"
                        />
                    </div>

                    {/* Lọc theo trạng thái */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-600 mb-1 flex items-center gap-1">
                            <i className="fas fa-tasks text-gray-400"></i> Trạng thái ca khám:
                        </label>
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="w-full border border-gray-300 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium focus:ring-2 focus:ring-blue-100 cursor-pointer bg-white"
                        >
                            <option value="">Tất cả trạng thái</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="confirmed">Đã xác nhận</option>
                            <option value="completed">Đã khám</option>
                            <option value="missed">Đã bỏ lỡ</option>
                            <option value="cancelled">Đã hủy</option>
                        </select>
                    </div>

                    {/* Nút reset */}
                    <div className="flex items-end">
                        <button
                            type="button"
                            onClick={handleResetFilter}
                            className="w-full px-4 py-2 text-gray-700 hover:text-red-600 text-xs sm:text-sm font-bold bg-gray-100 hover:bg-red-50 rounded-xl transition border border-gray-200 cursor-pointer flex items-center justify-center gap-1.5"
                        >
                            <i className="fas fa-undo text-xs"></i>
                            <span>Xóa tất cả lọc</span>
                        </button>
                    </div>

                    {/* Thống kê số lượng kết quả */}
                    <div className="flex items-end justify-start sm:justify-end text-xs text-gray-500 font-medium pb-1.5">
                        <span>
                            Tìm thấy <strong className="text-blue-700 font-bold">{filteredAppointments.length}</strong> / {appointments.length} ca khám
                        </span>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center pb-6 border-b border-gray-100">
                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center">
                    <i className={`fas fa-calendar-check text-${PRIMARY_COLOR}-600 mr-3`}></i> Danh Sách Lịch Hẹn
                </h2>
                <button
                    onClick={fetchAppointments}
                    className={`bg-${PRIMARY_COLOR}-600 text-white px-5 py-2.5 rounded-xl text-base font-semibold hover:bg-${PRIMARY_COLOR}-700 transition-all shadow-md transform hover:scale-[1.01] cursor-pointer`}
                >
                    <i className="fas fa-sync-alt mr-2"></i> Tải lại
                </button>
            </div>

            {/* Banner thông báo các ca khám mới chờ Bác sĩ xác nhận */}
            {appointments.filter(a => a.status === 'pending').length > 0 && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-950 text-xs shadow-2xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center text-base font-bold flex-shrink-0">
                            <i className="fas fa-bell animate-bounce"></i>
                        </div>
                        <div>
                            <div className="font-bold text-sm text-amber-900">
                                Có {appointments.filter(a => a.status === 'pending').length} lịch hẹn mới đang chờ Bác sĩ xác nhận!
                            </div>
                            <p className="text-slate-600 mt-0.5">
                                Bệnh nhân đã đăng ký khám (thanh toán tại quầy). Bác sĩ có thể bấm <strong>"Xác nhận"</strong> ngay trên danh sách hoặc xem chi tiết ca khám.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setFilterStatus('pending')}
                        className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition cursor-pointer self-start sm:self-auto flex-shrink-0 shadow-xs"
                    >
                        Lọc danh sách chờ duyệt ({appointments.filter(a => a.status === 'pending').length})
                    </button>
                </div>
            )}

            {loading ? (
                <div className="text-center py-10 text-gray-500">Đang tải...</div>
            ) : (
                <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-200">
                    <ul className="divide-y divide-gray-100">
                        {filteredAppointments.length > 0 ? (
                            filteredAppointments.map((appt) => (
                                <li
                                    key={appt.id}
                                    className={`py-5 grid grid-cols-5 items-center transition-all duration-300 hover:bg-${PRIMARY_COLOR}-50/50 rounded-lg px-4 -mx-4 cursor-pointer`}
                                >
                                    <div className="col-span-2 min-w-0 pr-4">
                                        <div className="flex items-center gap-2">
                                            <p className="text-xl font-bold text-gray-900 leading-snug">{appt.patientName}</p>
                                            <span className="text-xs px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-mono font-bold border border-blue-200">
                                                #{appt.appointmentCode || appt.id}
                                            </span>
                                        </div>
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                                            {appt.patientPhone && (
                                                <span className="flex items-center gap-1 font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded">
                                                    <i className="fas fa-phone text-blue-500 text-[10px]"></i> {appt.patientPhone}
                                                </span>
                                            )}
                                            <span className="truncate flex items-center">
                                                <i className={`fas fa-notes-medical mr-1.5 text-${PRIMARY_COLOR}-400 text-xs`}></i>
                                                Lý do: {appt.reason ? appt.reason : "Không có lý do"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="col-span-1 text-gray-700 font-medium flex items-center justify-start">
                                        <i className={`far fa-clock mr-2 text-lg text-${PRIMARY_COLOR}-500`}></i>
                                        <span className="text-base">{appt.time}</span>
                                    </div>

                                    <div className="col-span-1 flex items-center justify-start">
                                        <span className={`px-4 py-1.5 text-sm font-bold rounded-full ${getStatusStyles(appt.status)} shadow-sm flex-shrink-0`}>
                                            {getStatusName(appt.status)}
                                        </span>
                                    </div>

                                    <div className="col-span-1 flex items-center justify-end gap-2">
                                        {appt.status === 'pending' && (
                                            <button
                                                onClick={(e) => handleQuickConfirm(e, appt.id)}
                                                disabled={actionLoadingId === appt.id}
                                                className="text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                                title="Tiếp nhận và xác nhận lịch hẹn ngay"
                                            >
                                                <i className={`fas ${actionLoadingId === appt.id ? 'fa-spinner fa-spin' : 'fa-check'}`}></i>
                                                <span className="hidden sm:inline">{actionLoadingId === appt.id ? 'Đang duyệt...' : 'Xác nhận'}</span>
                                            </button>
                                        )}
                                        <Link
                                            to={`/doctor/appointment/${appt.id}`}
                                            className={`text-white bg-${PRIMARY_COLOR}-600 px-3.5 py-2 rounded-xl text-xs md:text-sm font-semibold hover:bg-${PRIMARY_COLOR}-700 transition-colors shadow-md flex items-center`}
                                        >
                                            Chi tiết <i className="fas fa-arrow-right ml-1.5 text-xs"></i>
                                        </Link>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="text-center py-12 space-y-3">
                                <i className="fas fa-user-slash text-5xl text-gray-300"></i>
                                <p className="text-lg text-gray-700 font-bold">Không tìm thấy ca khám nào phù hợp.</p>
                                <p className="text-xs text-gray-400">
                                    {searchTerm ? `Không có kết quả khớp với từ khóa "${searchTerm}".` : "Thử chọn ngày khác hoặc trạng thái khác."}
                                </p>
                                {(searchTerm || filterDate || filterStatus) && (
                                    <button
                                        type="button"
                                        onClick={handleResetFilter}
                                        className="mt-2 px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-xs transition cursor-pointer"
                                    >
                                        Xóa tất cả bộ lọc & tìm kiếm
                                    </button>
                                )}
                            </div>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Appointments;
