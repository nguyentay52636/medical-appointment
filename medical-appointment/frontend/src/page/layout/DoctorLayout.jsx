import { useContext, useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { DoctorContext } from '../../context/DoctorContext';
import { getUnreadNotificationCount, getAllNotifications, markAllNotificationsAsRead } from '../../service/notificationService';

const navItems = [
    { name: 'Tổng quan', path: '/doctor/dashboard', icon: 'fas fa-chart-line' },
    { name: 'Lịch hẹn', path: '/doctor/appointment', icon: 'fas fa-calendar-check' },
    { name: 'Lịch làm việc', path: '/doctor/schedule', icon: 'fas fa-calendar-alt' },
    { 
        name: 'Báo cáo và phân tích', 
        path: '/doctor/reports', 
        icon: 'fas fa-chart-bar'   // hoặc dùng 'fas fa-file-invoice-dollar', 'fas fa-analytics', tùy thư viện icon bạn đang dùng
    },
    { name: 'Hồ sơ cá nhân', path: '/doctor/profile', icon: 'fas fa-user-circle' },
    { name: 'Đổi mật khẩu', path: '/doctor/change_password', icon: 'fa-solid fa-key' },

];

const PRIMARY_COLOR = 'blue';

// ================= DashboardHeader =================
function DashboardHeader({ avatarUrl }) {
    const { doctor } = useContext(DoctorContext);
    const storedDoctor = JSON.parse(sessionStorage.getItem('doctor'));
    const finalAvatar = avatarUrl || doctor?.imageUrl || storedDoctor?.imageUrl || "https://i.pravatar.cc/150?img=5";

    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [showNotifDropdown, setShowNotifDropdown] = useState(false);

    const fetchNotifications = async () => {
        try {
            if (!doctor?.id) return;
            const count = await getUnreadNotificationCount(doctor.id);
            setUnreadCount(count);

            const notifs = await getAllNotifications(doctor.id);
            setNotifications(notifs);
        } catch (err) {
            console.error("Lỗi fetch thông báo:", err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            const success = await markAllNotificationsAsRead(doctor.id);
            if (success) {
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            }
        } catch (err) {
            console.error("Lỗi đánh dấu tất cả đã đọc:", err);
        }
    };

    useEffect(() => {
        fetchNotifications();

        // Tạo một interval để tự động gọi fetchNotifications mỗi 5 phút
        // Giúp cập nhật số thông báo mới liên tục mà không cần reload trang
        const interval = setInterval(fetchNotifications, 5 * 60 * 1000); // 5 phút = 5 * 60 * 1000 ms

        // Cleanup function: khi component unmount hoặc doctor?.id thay đổi,
        // interval sẽ được xóa để tránh gọi fetch không cần thiết và rò rỉ bộ nhớ
        return () => clearInterval(interval);
    }, [doctor?.id]); // Dependency array: mỗi khi doctor?.id thay đổi, effect sẽ chạy lại

    return (
        <header className="bg-white shadow-md p-5 flex justify-between items-center sticky top-0 z-10 border-b border-gray-200">
            <div className="text-xl lg:text-2xl font-semibold text-gray-700">
                Xin chào, <span className={`text-${PRIMARY_COLOR}-600 font-bold`}>{doctor?.fullName || 'Bác sĩ'}</span>!
            </div>

            <div className="flex items-center space-x-8 relative">
                {/* Thông báo */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                        className={`relative text-gray-500 hover:text-${PRIMARY_COLOR}-600 transition duration-200 cursor-pointer`}
                    >
                        <i className="fas fa-bell text-2xl"></i>
                        {Number(unreadCount) > 0 && (
                            <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                                {unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotifDropdown && (
                        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-xl shadow-lg overflow-hidden z-50">
                            <div className="p-3 font-bold border-b">Thông báo</div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.length === 0 && <div className="p-3 text-gray-500">Không có thông báo</div>}
                                {notifications.map((n) => (
                                    <div key={n.id} className={`p-3 border-b cursor-pointer ${!n.isRead ? 'bg-blue-50 font-semibold' : ''}`}>
                                        <div className="text-gray-800">{n.title} {n.patientName ? `- ${n.patientName}` : ''}</div>
                                        <div className="text-gray-500 text-sm">{n.message}</div>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={handleMarkAllRead}
                                className={`w-full text-center py-2 font-bold text-${PRIMARY_COLOR}-600 hover:bg-${PRIMARY_COLOR}-50 cursor-pointer`}
                            >
                                Đánh dấu tất cả đã đọc
                            </button>
                        </div>
                    )}
                </div>

                {/* Avatar */}
                <img
                    className={`w-12 h-12 rounded-full object-cover border-2 border-${PRIMARY_COLOR}-400 shadow-md`}
                    src={finalAvatar}
                    alt={doctor?.fullName || 'Bác sĩ'}
                />
            </div>
        </header>
    );
}

// ================= DoctorLayout =================
function DoctorLayout({ avatarUrl }) {
    const location = useLocation();
    const { doctor, logout } = useContext(DoctorContext);
    const storedDoctor = JSON.parse(sessionStorage.getItem('doctor'));
    const finalAvatar = avatarUrl || doctor?.imageUrl || storedDoctor?.imageUrl || "https://i.pravatar.cc/150?img=5";
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/doctor");
    };

    return (
        <div className="flex h-screen bg-gradient-to-r from-white via-blue-50 to-gray-100 font-sans">
            <aside className="w-72 bg-white shadow-xl z-20 flex flex-col transition-all duration-300 border-r border-gray-100">
                <div className="p-6 border-b border-blue-600">
                    <h1 className={`text-3xl font-extrabold text-${PRIMARY_COLOR}-600 text-center tracking-wide py-2`}>
                        KLINIK
                    </h1>
                </div>

                <nav className="flex-grow p-4 space-y-2 mt-4">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <NavLink
                                key={item.path}
                                to={item.path}
                                end={false}
                                className={({ isActive }) => `
                                    flex items-center space-x-4 px-5 py-3 rounded-xl 
                                    font-bold text-lg transition-all duration-200
                                    ${isActive
                                        ? `bg-${PRIMARY_COLOR}-600 text-white shadow-lg shadow-${PRIMARY_COLOR}-200`
                                        : `text-gray-700 hover:bg-${PRIMARY_COLOR}-50 hover:text-${PRIMARY_COLOR}-600`
                                    }
                                `}
                            >
                                <i className={`${item.icon} text-xl w-6`}></i>
                                <span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="mt-auto p-4 border-t border-blue-600">
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-4 text-lg font-bold text-red-500 hover:text-white hover:bg-red-600 w-full px-5 py-3 rounded-xl transition-colors duration-200 cursor-pointer"
                    >
                        <i className="fas fa-sign-out-alt text-2xl w-6"></i>
                        <span>Đăng xuất</span>
                    </button>
                </div>
            </aside>

            <div className="flex-1 flex flex-col overflow-hidden">
                <DashboardHeader avatarUrl={finalAvatar} />
                <main className="flex-1 overflow-y-auto p-10">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default DoctorLayout;
