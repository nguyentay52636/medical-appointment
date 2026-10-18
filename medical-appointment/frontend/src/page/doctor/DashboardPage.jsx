import { Link } from 'react-router-dom';
import useFetch from '../../hook/useFetch';
import { getDashboardStats, getUpcomingAppointments, getMissedAppointments } from "../../service/dashboardService";


const fetchDashboardData = async () => {
    try {
        const [stats, appointments, missedAppointments] = await Promise.all([
            getDashboardStats(),
            getUpcomingAppointments(),
            getMissedAppointments(),
        ]);
        return { stats, appointments, missedAppointments };
    } catch (error) {
        console.error("Lỗi khi fetch dashboard:", error);
        throw error;
    }
};

function DoctorDashboard() {
    const { data, isLoading, error } = useFetch(fetchDashboardData, []);
    const PRIMARY_COLOR = 'indigo';

    if (isLoading) return <div className={`text-center p-8 text-xl font-semibold text-${PRIMARY_COLOR}-600 bg-white shadow-lg rounded-xl`}>Đang tải dữ liệu...</div>;
    if (error) return <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border rounded-xl shadow-md">Lỗi tải Dashboard: {error}</div>;

    const { stats, appointments, missedAppointments} = data;

    return (
        <div className="space-y-8">
            <h1 className={`text-4xl font-extrabold text-gray-900 border-b-4 border-black-600/30 pb-3 tracking-tight`}>
                Tổng Quan Công Việc Hôm Nay
            </h1>

            {/* Hàng 1: Stat Cards (Công việc Hôm nay) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Lịch Hẹn Hôm Nay" value={stats.totalAppointmentsToday} color="bg-indigo-600" icon="fas fa-calendar-day" />
                <StatCard title="Chờ Duyệt" value={stats.pendingAppointments} color="bg-amber-500" icon="fas fa-clock" />
                <StatCard title="Đã Xác Nhận" value={stats.confirmedAppointments} color="bg-emerald-600" icon="fas fa-check-circle" />
                <StatCard title="Tổng Bệnh Nhân" value={stats.totalUniquePatientsToday} color="bg-gray-700" icon="fas fa-users" />
            </div>

            {/* Hàng 2: Danh sách công việc (Ưu tiên hàng ngày) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Cột 1 & 2: Danh sách lịch hẹn */}
                <div className="lg:col-span-2 space-y-6">
                    <UpcomingAppointments appointments={appointments} primaryColor={PRIMARY_COLOR} />
                    <MissedAppointments appointments={missedAppointments} primaryColor={PRIMARY_COLOR} />
                </div>

                {/* Cột 3: Hành Động Nhanh */}
                <div className="lg:col-span-1 space-y-6">
                    <QuickActions primaryColor={PRIMARY_COLOR} />
                </div>
            </div>
        </div>
    );
}

// --- Component phụ trợ ---
const StatCard = ({ title, value, color, icon }) => (
    <div className={`p-6 rounded-xl shadow-xl transition-transform transform hover:scale-[1.02] ${color} text-white relative overflow-hidden`}>
        <i className={`${icon} absolute right-[-10px] bottom-[-10px] text-8xl opacity-10`}></i>

        <div className="flex flex-col justify-start relative z-10">
            <p className="text-3xl font-extrabold mb-1">{value}</p>
            <p className="text-sm font-medium uppercase tracking-wider opacity-80">{title}</p>
        </div>
        <div className="mt-4 pt-2 border-t border-white/20">
            <i className={`${icon} text-xl`}></i>
        </div>
    </div>
);

const UpcomingAppointments = ({ appointments, primaryColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-2">📋 Lịch Hẹn Sắp Tới</h2>
        <ul className="divide-y divide-gray-100">
            {appointments.length > 0 ? (
                appointments.slice(0, 5).map(appt => (
                    <li key={appt.id} className="py-3 flex items-center transition-colors hover:bg-blue-50/50 rounded-lg px-2 -mx-2">
                        <div className="mr-4 text-gray-400 text-lg flex-shrink-0">
                            <i className="far fa-clock"></i>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-800 text-base">{appt.patientName}</p>
                            <p className="text-sm text-gray-500 truncate">{appt.time} - {appt.endTime}</p>
                        </div>
                        <div className="w-auto text-right flex-shrink-0 mr-4">
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${getStatusStyles(appt.status)}`}>
                                {appt.status === 'confirmed' ? 'Đã xác nhận' : appt.status === 'pending' ? 'Chờ duyệt' : 'Đã khám'}
                            </span>
                        </div>
                        <div className="w-auto text-right flex-shrink-0">
                            <Link to={`/doctor/appointment/${appt.id}`} className={`text-${primaryColor}-600 hover:text-${primaryColor}-800 text-sm font-medium`}>
                                <i className="fas fa-arrow-right"></i>
                            </Link>
                        </div>
                    </li>
                ))
            ) : (
                <li className="py-2 text-center text-gray-500 italic ">
                    Không có lịch hẹn sắp tới 🕒
                </li>
            )}
        </ul>

    </div>
);
const MissedAppointments = ({ appointments, primaryColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-2">
            ⚠️ Lịch Hẹn Đã Quá Giờ
        </h2>
        <ul className="divide-y divide-gray-100">
            {appointments.length > 0 ? (
                appointments.map(appt => (
                    <li key={appt.id} className="py-3 flex items-center">
                        <div className="flex-1">
                            <p className="font-semibold text-gray-800">{appt.patientName}</p>
                            <p className="text-sm text-gray-500">Vào lúc {appt.time} giờ</p>
                        </div>
                        <span className="text-xs bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                            {appt.status === 'confirmed' ? 'Chưa khám' : 'Bỏ lỡ'}
                        </span>
                    </li>
                ))
            ) : (
                <li className="py-3 text-center text-gray-500 italic text-sm">
                    Không có lịch đã quá giờ 🕒
                </li>
            )}
        </ul>
    </div>

);



const QuickActions = ({ primaryColor }) => (
    <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b border-gray-100 pb-2">⚡ Hành Động Nhanh</h2>
        <div className="space-y-4 pt-2">
            <Link className={`block bg-${primaryColor}-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-${primaryColor}-700 shadow-md transition-all text-center text-base transform hover:scale-[1.01]`} to="/doctor/schedule">
                <i className="fas fa-calendar-alt mr-2"></i> Cập Nhật Lịch
            </Link>
            <Link className="block bg-emerald-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-emerald-700 shadow-md transition-all text-center text-base transform hover:scale-[1.01]" to="/doctor/appointment">
                <i className="fas fa-tasks mr-2"></i> Xem Tất Cả Lịch Hẹn
            </Link>
            <Link 
                className="block bg-yellow-600 text-white font-semibold px-4 py-3 rounded-xl hover:bg-yellow-700 shadow-md transition-all text-center text-base transform hover:scale-[1.01] " to="/doctor/reports">
                <i className="fas fa-chart-bar"></i> Báo Cáo & Phân Tích  
            </Link>
        </div>
    </div>
);

const getStatusStyles = (status) => {
    switch (status) {
        case 'confirmed':
            return 'bg-emerald-100 text-emerald-800';
        case 'pending':
            return 'bg-amber-100 text-amber-800';
        case 'completed':
            return 'bg-gray-200 text-gray-700';
        default:
            return 'bg-gray-100 text-gray-600';
    }
};

export default DoctorDashboard;