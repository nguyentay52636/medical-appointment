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

    const getStatusStyles = (status) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-100 text-emerald-800';
            case 'pending': return 'bg-amber-100 text-amber-800';
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

    // Lọc
    const handleResetFilter = () => {
        setFilterDate('');
        setFilterStatus('');
    };

    const filteredAppointments = appointments
        .filter(appt => !filterStatus || appt.status === filterStatus)
        .filter(appt => !filterDate || appt.date.slice(0, 10) === filterDate);

    return (
        <div className="space-y-6">
            {/* Bộ lọc */}
            <div className="bg-white p-4 rounded-xl shadow mb-4 grid grid-cols-1 md:grid-cols-4 gap-4">

                {/* Lọc theo ngày */}
                <div>
                    <label className="block font-semibold mb-1">Ngày khám:</label>
                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        className="w-full border px-3 py-2 rounded cursor-pointer"
                    />
                </div>

                {/* Lọc theo trạng thái */}
                <div>
                    <label className="block font-semibold mb-1">Trạng thái:</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="w-full border px-3 py-2 rounded cursor-pointer"
                    >
                        <option value="">Tất cả</option>
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
                        onClick={handleResetFilter}
                        className={`1w-full px-4 py-2 text-white text-base font-semibold bg-${PRIMARY_COLOR}-600 hover:bg-${PRIMARY_COLOR}-700 rounded hover:scale-[1.01] cursor-pointer`}
                    >
                        Xóa lọc
                    </button>
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
                                        <p className="text-xl font-bold text-gray-900 leading-snug">{appt.patientName}</p>
                                        <p className="text-sm text-gray-500 mt-1 truncate flex items-center">
                                            <i className={`fas fa-notes-medical mr-2 text-${PRIMARY_COLOR}-400 text-xs`}></i>
                                            Lý do: {appt.reason ? appt.reason : "Không có lý do"}
                                        </p>
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

                                    <div className="col-span-1 flex justify-end">
                                        <Link
                                            to={`/doctor/appointment/${appt.id}`}
                                            className={`text-white bg-${PRIMARY_COLOR}-600 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-${PRIMARY_COLOR}-700 transition-colors shadow-md flex items-center`}
                                        >
                                            Chi tiết <i className="fas fa-arrow-right ml-2 text-xs"></i>
                                        </Link>
                                    </div>
                                </li>
                            ))
                        ) : (
                            <div className="text-center py-10">
                                <i className="fas fa-file-alt text-6xl text-red-300 mb-4"></i>
                                <p className="text-xl text-gray-500 font-medium">Không có lịch hẹn nào được tìm thấy.</p>
                            </div>
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Appointments;
