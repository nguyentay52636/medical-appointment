import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../context/AdminContext';

function AdminLayoutInner() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const { stats, refreshAll, isLoading } = useAdmin();

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
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/30 flex-shrink-0">
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
                        className="text-slate-400 hover:text-white p-1 rounded-lg transition"
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
                                className="text-slate-500 hover:text-blue-400 transition"
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

                {/* Admin User Footer Card */}
                <div className="p-3 border-t border-slate-800 bg-slate-950/40">
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-800/50">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow">
                            AD
                        </div>
                        {isSidebarOpen && (
                            <div className="min-w-0 flex-1">
                                <p className="text-xs font-bold text-white truncate">Ban Quản Trị</p>
                                <p className="text-[10px] text-emerald-400 flex items-center gap-1 font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                    Trực ban 24/7
                                </p>
                            </div>
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

                    <div className="flex items-center gap-4">
                        <button
                            onClick={refreshAll}
                            disabled={isLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition cursor-pointer disabled:opacity-50"
                            title="Làm mới toàn bộ số liệu"
                        >
                            <i className={`fas fa-sync-alt ${isLoading ? 'fa-spin text-blue-600' : 'text-slate-500'}`}></i>
                            <span className="hidden md:inline">Đồng bộ</span>
                        </button>

                        <div className="text-right hidden md:block">
                            <p className="text-xs font-bold text-slate-800">Cơ sở An Dương Vương</p>
                            <p className="text-[11px] text-slate-500">273 An Dương Vương, P.4, Q.5, TP.HCM</p>
                        </div>

                        <Link
                            to="/patient/home"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
                        >
                            <i className="fas fa-globe text-slate-500"></i> Xem Website
                        </Link>
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
