import React from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import StatCard from '../../component/admin/StatCard';

export default function AdminDashboard() {
    const { stats, doctors, appointments, isLoading, refreshAll } = useAdmin();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (isLoading && doctors.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-600 font-semibold">Đang tổng hợp số liệu phòng khám...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Tổng Quan Vận Hành Phòng Khám
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Dữ liệu giám sát toàn bộ hoạt động bác sĩ, chuyên khoa và lịch hẹn hôm nay.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={refreshAll}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer"
                        title="Đồng bộ số liệu"
                    >
                        <i className={`fas fa-sync-alt text-blue-600 ${isLoading ? 'fa-spin' : ''}`}></i>
                        <span>Làm mới</span>
                    </button>

                    <Link
                        to="/admin/doctors?action=create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
                    >
                        <i className="fas fa-user-plus"></i> Cấp Tài Khoản Bác Sĩ
                    </Link>
                </div>
            </div>

            {/* KPI Stat Cards with Reusable Component */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                    title="Đội ngũ Bác sĩ"
                    value={stats.totalDoctors}
                    subText={`${stats.totalSpecialties} chuyên khoa phân bổ`}
                    icon="fas fa-user-md"
                    gradient="from-blue-500 to-indigo-600"
                    iconBg="bg-blue-50 text-blue-600"
                    badgeText="Hoạt động"
                    badgeColor="bg-blue-50 text-blue-700"
                />

                <StatCard
                    title="Lịch hẹn toàn viện"
                    value={stats.totalAppointments}
                    subText={`${stats.pendingAppointments} ca đang chờ duyệt`}
                    icon="fas fa-calendar-check"
                    gradient="from-amber-400 to-orange-500"
                    iconBg="bg-amber-50 text-amber-600"
                    badgeText={stats.pendingAppointments > 0 ? `${stats.pendingAppointments} chờ` : 'Đã duyệt hết'}
                    badgeColor={stats.pendingAppointments > 0 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-50 text-emerald-700'}
                />

                <StatCard
                    title="Hồ sơ Bệnh nhân"
                    value={stats.totalPatients}
                    subText="Tài khoản trên hệ thống"
                    icon="fas fa-hospital-user"
                    gradient="from-emerald-400 to-teal-500"
                    iconBg="bg-emerald-50 text-emerald-600"
                    badgeText="Đã kích hoạt"
                    badgeColor="bg-emerald-50 text-emerald-700"
                />

                <StatCard
                    title="Doanh thu dự tính"
                    value={formatCurrency(stats.estimatedRevenue)}
                    subText="Tính trên ca xác nhận & đã khám"
                    icon="fas fa-wallet"
                    gradient="from-indigo-500 to-purple-600"
                    iconBg="bg-indigo-50 text-indigo-600"
                    badgeText="Ước tính"
                    badgeColor="bg-indigo-50 text-indigo-700"
                />
            </div>

            {/* Trạng thái ca khám toàn viện & Bác sĩ nổi bật */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trạng thái ca khám */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
                        <span>Trạng Thái Ca Khám</span>
                        <span className="text-xs font-normal text-slate-400">Tổng {stats.totalAppointments} ca</span>
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-amber-700">Chờ duyệt ({stats.pendingAppointments})</span>
                                <span className="text-slate-500">
                                    {stats.totalAppointments ? Math.round((stats.pendingAppointments / stats.totalAppointments) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${stats.totalAppointments ? (stats.pendingAppointments / stats.totalAppointments) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-blue-700">Đã xác nhận ({stats.confirmedAppointments})</span>
                                <span className="text-slate-500">
                                    {stats.totalAppointments ? Math.round((stats.confirmedAppointments / stats.totalAppointments) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${stats.totalAppointments ? (stats.confirmedAppointments / stats.totalAppointments) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-emerald-700">Đã hoàn thành khám ({stats.completedAppointments})</span>
                                <span className="text-slate-500">
                                    {stats.totalAppointments ? Math.round((stats.completedAppointments / stats.totalAppointments) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${stats.totalAppointments ? (stats.completedAppointments / stats.totalAppointments) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-rose-700">Đã hủy / Bị từ chối ({stats.rejectedAppointments})</span>
                                <span className="text-slate-500">
                                    {stats.totalAppointments ? Math.round((stats.rejectedAppointments / stats.totalAppointments) * 100) : 0}%
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div
                                    className="bg-rose-500 h-2 rounded-full transition-all duration-500"
                                    style={{
                                        width: `${stats.totalAppointments ? (stats.rejectedAppointments / stats.totalAppointments) * 100 : 0}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-slate-100">
                        <Link
                            to="/admin/appointments"
                            className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center justify-between"
                        >
                            <span>Xem tất cả danh sách lịch hẹn</span>
                            <i className="fas fa-arrow-right"></i>
                        </Link>
                    </div>
                </div>

                {/* Danh sách Bác sĩ phòng khám */}
                <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-base font-bold text-slate-800">
                            Bác Sĩ Thuộc Phòng Khám ({doctors.length})
                        </h3>
                        <Link to="/admin/doctors" className="text-xs font-semibold text-blue-600 hover:underline">
                            Quản lý & Thêm mới
                        </Link>
                    </div>

                    <div className="divide-y divide-slate-100 overflow-hidden">
                        {doctors.slice(0, 5).map((doc) => (
                            <div key={doc.id} className="py-3 flex items-center justify-between hover:bg-slate-50/60 px-2 rounded-xl transition">
                                <div className="flex items-center gap-3">
                                    <img
                                        src={doc.imageUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150'}
                                        alt={doc.fullName}
                                        className="w-10 h-10 rounded-xl object-cover border border-slate-200 shadow-sm"
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150';
                                        }}
                                    />
                                    <div>
                                        <p className="font-bold text-sm text-slate-800">{doc.fullName}</p>
                                        <p className="text-xs text-slate-500">
                                            {doc.specialtyName || 'Đa khoa'} • {doc.experienceYears || 1} năm kinh nghiệm
                                        </p>
                                    </div>
                                </div>

                                <div className="text-right">
                                    <p className="text-xs font-bold text-blue-600">
                                        {formatCurrency(doc.pricePerAppointment || 200000)}
                                    </p>
                                    <span className="inline-block mt-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                                        Đang hoạt động
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
