import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../service/adminService';

export default function AdminDashboard() {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setIsLoading(true);
            try {
                const [docRes, specRes, apptRes, patRes] = await Promise.allSettled([
                    adminService.getAllDoctors(),
                    adminService.getAllSpecialties(),
                    adminService.getAllAppointments(),
                    adminService.getAllPatients()
                ]);

                if (docRes.status === 'fulfilled') setDoctors(docRes.value || []);
                if (specRes.status === 'fulfilled') setSpecialties(specRes.value || []);
                if (apptRes.status === 'fulfilled') setAppointments(apptRes.value || []);
                if (patRes.status === 'fulfilled') setPatients(patRes.value || []);
            } catch (err) {
                console.error("Lỗi tải dữ liệu admin dashboard:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    // Thống kê trạng thái lịch hẹn
    const pendingCount = appointments.filter(a => a.status === 'pending' || a.status === 'Chờ duyệt').length;
    const confirmedCount = appointments.filter(a => a.status === 'confirmed' || a.status === 'Đã xác nhận').length;
    const completedCount = appointments.filter(a => a.status === 'completed' || a.status === 'Đã khám').length;
    const rejectedCount = appointments.filter(a => a.status === 'rejected' || a.status === 'Đã hủy').length;

    // Ước tính doanh thu
    const estimatedRevenue = appointments
        .filter(a => a.status === 'completed' || a.status === 'confirmed')
        .reduce((sum, a) => sum + (a.price || 200000), 0);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    if (isLoading) {
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
                    <Link
                        to="/admin/doctors/create"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                    >
                        <i className="fas fa-user-plus"></i> Cấp Tài Khoản Bác Sĩ
                    </Link>
                    <Link
                        to="/admin/doctors"
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-sm transition cursor-pointer"
                    >
                        <i className="fas fa-list"></i> Danh Sách Bác Sĩ
                    </Link>
                </div>
            </div>

            {/* KPI Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {/* Tổng bác sĩ */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đội ngũ Bác sĩ</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{doctors.length}</h3>
                        <p className="text-xs text-blue-600 font-semibold mt-1">
                            <i className="fas fa-check-circle mr-1"></i> {specialties.length} Chuyên khoa
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center text-xl">
                        <i className="fas fa-user-md"></i>
                    </div>
                </div>

                {/* Tổng lịch hẹn */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Lịch hẹn toàn viện</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{appointments.length}</h3>
                        <p className="text-xs text-amber-600 font-semibold mt-1">
                            <i className="fas fa-clock mr-1"></i> {pendingCount} ca chờ duyệt
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center text-xl">
                        <i className="fas fa-calendar-check"></i>
                    </div>
                </div>

                {/* Tổng bệnh nhân */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hồ sơ Bệnh nhân</p>
                        <h3 className="text-3xl font-extrabold text-slate-900 mt-1">{patients.length}</h3>
                        <p className="text-xs text-emerald-600 font-semibold mt-1">
                            <i className="fas fa-user-shield mr-1"></i> Đã kích hoạt
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl">
                        <i className="fas fa-hospital-user"></i>
                    </div>
                </div>

                {/* Doanh thu ước tính */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh thu dự tính</p>
                        <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{formatCurrency(estimatedRevenue)}</h3>
                        <p className="text-xs text-indigo-600 font-semibold mt-1">
                            <i className="fas fa-chart-line mr-1"></i> Các ca đã xác nhận
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-xl">
                        <i className="fas fa-wallet"></i>
                    </div>
                </div>
            </div>

            {/* Trạng thái ca khám toàn viện & Bác sĩ nổi bật */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trạng thái ca khám */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
                    <h3 className="text-base font-bold text-slate-800 mb-4 flex items-center justify-between">
                        <span>Trạng Thái Ca Khám</span>
                        <span className="text-xs font-normal text-slate-400">Tổng {appointments.length} ca</span>
                    </h3>

                    <div className="space-y-4">
                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-amber-700">Chờ duyệt ({pendingCount})</span>
                                <span className="text-slate-500">{appointments.length ? Math.round((pendingCount / appointments.length) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${appointments.length ? (pendingCount / appointments.length) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-blue-700">Đã xác nhận ({confirmedCount})</span>
                                <span className="text-slate-500">{appointments.length ? Math.round((confirmedCount / appointments.length) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${appointments.length ? (confirmedCount / appointments.length) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-emerald-700">Đã hoàn thành khám ({completedCount})</span>
                                <span className="text-slate-500">{appointments.length ? Math.round((completedCount / appointments.length) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${appointments.length ? (completedCount / appointments.length) * 100 : 0}%` }}></div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between text-xs font-semibold mb-1">
                                <span className="text-red-700">Đã hủy / Bị từ chối ({rejectedCount})</span>
                                <span className="text-slate-500">{appointments.length ? Math.round((rejectedCount / appointments.length) * 100) : 0}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-red-500 h-2 rounded-full" style={{ width: `${appointments.length ? (rejectedCount / appointments.length) * 100 : 0}%` }}></div>
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
                                        src={doc.imageUrl || "https://i.pravatar.cc/150?img=1"}
                                        alt={doc.fullName}
                                        className="w-10 h-10 rounded-full object-cover border border-slate-200"
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
