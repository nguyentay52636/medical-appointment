import React, { useState } from 'react';
import { NavLink, Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../context/AdminContext';
import { useToast } from '../../context/ToastContext';

function AdminLayoutInner() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { stats, refreshAll, isLoading } = useAdmin();
    const navigate = useNavigate();
    const location = useLocation();
    const { confirm, logoutSuccess } = useToast();

    // Lấy thông tin tài khoản Admin từ sessionStorage
    const storedAdmin = sessionStorage.getItem('admin');
    let currentAdmin = null;
    try {
        currentAdmin = storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch {
        currentAdmin = null;
    }

    // YÊU CẦU ĐĂNG NHẬP VÀ KIỂM TRA ROLE ADMIN:
    // Nếu chưa đăng nhập hoặc role khác 'admin', điều hướng ngay về /admin/login
    if (!currentAdmin || !currentAdmin.role || currentAdmin.role.toLowerCase() !== 'admin') {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    // Xử lý Đăng xuất Admin
    const handleLogout = () => {
        confirm({
            title: 'Đăng xuất khỏi hệ thống Quản trị?',
            message: `Bạn đang đăng nhập với tư cách Quản trị viên (${currentAdmin.fullName || currentAdmin.username}). Bạn có chắc chắn muốn đăng xuất?`,
            confirmText: 'Đăng xuất ngay',
            cancelText: 'Hủy bỏ',
            type: 'warning',
            onConfirm: () => {
                sessionStorage.removeItem('admin');
                sessionStorage.removeItem('token');
                logoutSuccess('admin');
                navigate('/admin/login', { replace: true });
            }
        });
    };

    // Chữ cái đại diện avatar
    const adminInitials = currentAdmin.fullName
        ? currentAdmin.fullName.split(' ').map(w => w[0]).filter(Boolean).slice(-2).join('').toUpperCase()
        : 'AD';

    const navItems = [
        {
            name: 'Tổng quan phòng khám',
            path: '/admin/dashboard',
            icon: 'fas fa-chart-pie',
            badge: null
        },
        {
            name: 'Quản lý Bác sĩ',
            path: '/admin/doctors',
            icon: 'fas fa-user-md',
            badge: stats.totalDoctors > 0 ? `${stats.totalDoctors}` : null,
            badgeColor: 'bg-blue-900/80 text-blue-300 border border-blue-700/50'
        },
        {
            name: 'Lịch hẹn toàn viện',
            path: '/admin/appointments',
            icon: 'fas fa-calendar-check',
            badge: stats.pendingAppointments > 0 ? `${stats.pendingAppointments} chờ` : `${stats.totalAppointments}`,
            badgeColor: stats.pendingAppointments > 0
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold animate-pulse'
                : 'bg-slate-800 text-slate-400'
        },
        {
            name: 'Danh sách Bệnh nhân',
            path: '/admin/patients',
            icon: 'fas fa-hospital-user',
            badge: stats.totalPatients > 0 ? `${stats.totalPatients}` : null,
            badgeColor: 'bg-slate-800 text-slate-400'
        },
        {
            name: 'Quản lý Doanh thu',
            path: '/admin/revenue',
            icon: 'fas fa-chart-line',
            badge: 'Dòng tiền',
            badgeColor: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold'
        },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
            {/* Sidebar */}
            <aside
                className={`${
                    isSidebarOpen ? 'w-64' : 'w-20'
                } bg-slate-900 text-white flex flex-col transition-all duration-300 shadow-2xl z-30 flex-shrink-0`}
            >
                {/* Brand / Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800 bg-slate-950/60">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/30 flex-shrink-0">
                            K
                        </div>
                        {isSidebarOpen && (
                            <div className="leading-tight">
                                <h1 className="font-extrabold text-lg tracking-wide text-white">KLINIK</h1>
                                <span className="text-[10px] font-semibold text-blue-400 uppercase tracking-widest block">
                                    Quản trị phòng khám
                                </span>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition cursor-pointer"
                        title={isSidebarOpen ? 'Thu gọn menu' : 'Mở rộng menu'}
                    >
                        <i className={`fas ${isSidebarOpen ? 'fa-angle-left' : 'fa-angle-right'} text-lg`}></i>
                    </button>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
                    <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                        <span>{isSidebarOpen ? 'Quản lý chính' : '•••'}</span>
                        {isSidebarOpen && (
                            <button
                                onClick={refreshAll}
                                title="Đồng bộ lại toàn bộ dữ liệu"
                                className="text-slate-500 hover:text-blue-400 transition cursor-pointer"
                            >
                                <i className={`fas fa-sync-alt text-[10px] ${isLoading ? 'fa-spin text-blue-400' : ''}`}></i>
                            </button>
                        )}
                    </div>

                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center justify-between px-3.5 py-3 rounded-xl font-medium text-sm transition-all duration-200 group
                                ${
                                    isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold'
                                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                                }
                            `}
                        >
                            <div className="flex items-center gap-3.5 truncate">
                                <i className={`${item.icon} text-lg w-5 text-center flex-shrink-0`}></i>
                                {isSidebarOpen && <span className="truncate">{item.name}</span>}
                            </div>
                            {isSidebarOpen && item.badge && (
                                <span className={`text-[10px] px-2 py-0.5 rounded-full ${item.badgeColor}`}>
                                    {item.badge}
                                </span>
                            )}
                        </NavLink>
                    ))}

                    <div className="pt-4 px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                        {isSidebarOpen ? 'Chuyển cổng nhanh' : '•••'}
                    </div>

                    <Link
                        to="/doctor/dashboard"
                        className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-blue-300 hover:bg-slate-800/60 transition text-sm"
                        title="Vào Cổng Bác sĩ"
                    >
                        <i className="fas fa-stethoscope text-lg w-5 text-center flex-shrink-0 text-cyan-400"></i>
                        {isSidebarOpen && <span className="truncate">Cổng Bác sĩ (Portal)</span>}
                    </Link>

                    <Link
                        to="/patient/home"
                        className="flex items-center gap-3.5 px-3.5 py-2.5 rounded-xl text-slate-400 hover:text-emerald-300 hover:bg-slate-800/60 transition text-sm"
                        title="Về Website Phòng khám"
                    >
                        <i className="fas fa-external-link-alt text-lg w-5 text-center flex-shrink-0 text-emerald-400"></i>
                        {isSidebarOpen && <span className="truncate">Website Phòng khám</span>}
                    </Link>
                </nav>

                {/* Admin User Footer Card with Role & Logout */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/60">
                    <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow flex-shrink-0">
                                {adminInitials}
                            </div>
                            {isSidebarOpen && (
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-white truncate" title={currentAdmin.fullName || currentAdmin.username}>
                                        {currentAdmin.fullName || currentAdmin.username}
                                    </p>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold uppercase tracking-wider">
                                            {currentAdmin.role}
                                        </span>
                                        <span className="text-[10px] text-slate-400 truncate">
                                            {currentAdmin.email || currentAdmin.username}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Nút Đăng Xuất Admin */}
                        {isSidebarOpen ? (
                            <button
                                onClick={handleLogout}
                                className="w-full mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-center gap-2 text-xs font-semibold text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 py-1.5 rounded-lg transition cursor-pointer"
                                title="Đăng xuất tài khoản Admin"
                            >
                                <i className="fas fa-sign-out-alt text-sm"></i>
                                <span>Đăng xuất Quản trị</span>
                            </button>
                        ) : (
                            <button
                                onClick={handleLogout}
                                className="w-full mt-2 flex items-center justify-center text-rose-400 hover:text-rose-300 py-1 transition cursor-pointer"
                                title="Đăng xuất"
                            >
                                <i className="fas fa-sign-out-alt text-sm"></i>
                            </button>
                        )}
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header Topbar */}
                <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-sm z-10 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                            <i className="fas fa-shield-alt mr-1.5 text-blue-600"></i> Clinic Admin Panel
                        </span>
                        <h2 className="text-slate-700 font-bold text-base hidden sm:block">
                            Hệ thống Quản trị Phòng khám Đa khoa Klinik
                        </h2>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Admin Badge */}
                        <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg border border-slate-200 text-xs">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="font-semibold text-slate-700">{currentAdmin.fullName || currentAdmin.username}</span>
                            <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-mono text-[10px] font-bold">
                                {currentAdmin.role}
                            </span>
                        </div>

                        <button
                            onClick={refreshAll}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                            title="Làm mới toàn bộ số liệu"
                        >
                            <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin text-blue-600' : 'text-slate-500'}`}></i>
                            <span className="hidden md:inline">Đồng bộ</span>
                        </button>

                        <Link
                            to="/patient/home"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <i className="fas fa-globe text-slate-500"></i> Xem Website
                        </Link>

                        {/* Nút Đăng xuất trên topbar */}
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 transition cursor-pointer"
                            title="Đăng xuất tài khoản quản trị"
                        >
                            <i className="fas fa-sign-out-alt"></i>
                            <span className="hidden sm:inline">Đăng xuất</span>
                        </button>
                    </div>
                </header>

                {/* Main View Container */}
                <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default function AdminLayout() {
    return (
        <AdminProvider>
            <AdminLayoutInner />
        </AdminProvider>
    );
}
