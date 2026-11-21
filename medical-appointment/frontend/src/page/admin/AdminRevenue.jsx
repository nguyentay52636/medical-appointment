import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../component/common/Pagination';

export default function AdminRevenue() {
    const { appointments, doctors, specialties, isLoading, refreshAll, updateAppointmentPaymentStatus } = useAdmin();

    // Bộ lọc
    const [methodFilter, setMethodFilter] = useState('ALL');       // ALL, online, offline
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('ALL'); // ALL, paid, pending, refunded
    const [apptStatusFilter, setApptStatusFilter] = useState('ALL');       // ALL, completed, confirmed, pending, cancelled
    const [doctorFilter, setDoctorFilter] = useState('ALL');       // doctorId
    const [dateRangeFilter, setDateRangeFilter] = useState('ALL'); // ALL, TODAY, THIS_MONTH, CUSTOM
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [updatingPaymentId, setUpdatingPaymentId] = useState(null);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    // 1. Phân loại & Tính toán số liệu thống kê toàn viện
    const revenueStats = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        let totalRevenue = 0;        // Tổng doanh thu thực thu (paid)
        let onlineRevenue = 0;       // Doanh thu qua cổng VNPAY / QR (online & paid)
        let offlineRevenue = 0;      // Doanh thu tại quầy (offline & paid)
        let pendingRevenue = 0;      // Doanh thu chờ thu (pending)
        let refundedRevenue = 0;     // Doanh thu đã hoàn trả (refunded)

        let totalPaidCount = 0;
        let onlinePaidCount = 0;
        let offlinePaidCount = 0;
        let pendingCount = 0;

        appointments.forEach(a => {
            const price = a.price || 200000;
            const isOnline = (a.paymentMethod || '').toLowerCase() === 'online';
            const isOffline = !isOnline;
            const pStatus = (a.paymentStatus || 'pending').toLowerCase();

            if (pStatus === 'paid') {
                totalRevenue += price;
                totalPaidCount++;
                if (isOnline) {
                    onlineRevenue += price;
                    onlinePaidCount++;
                } else {
                    offlineRevenue += price;
                    offlinePaidCount++;
                }
            } else if (pStatus === 'pending') {
                pendingRevenue += price;
                pendingCount++;
            } else if (pStatus === 'refunded') {
                refundedRevenue += price;
            }
        });

        const onlinePercent = totalRevenue > 0 ? Math.round((onlineRevenue / totalRevenue) * 100) : 0;
        const offlinePercent = totalRevenue > 0 ? (100 - onlinePercent) : 0;

        return {
            totalRevenue,
            onlineRevenue,
            offlineRevenue,
            pendingRevenue,
            refundedRevenue,
            totalPaidCount,
            onlinePaidCount,
            offlinePaidCount,
            pendingCount,
            onlinePercent,
            offlinePercent
        };
    }, [appointments]);

    // 2. Lọc danh sách lịch hẹn theo điều kiện
    const filteredAppointments = useMemo(() => {
        const todayStr = new Date().toISOString().slice(0, 10);
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);

        return appointments.filter(appt => {
            // Lọc theo hình thức thanh toán (online / offline)
            const isOnline = (appt.paymentMethod || '').toLowerCase() === 'online';
            if (methodFilter === 'online' && !isOnline) return false;
            if (methodFilter === 'offline' && isOnline) return false;

            // Lọc theo trạng thái thanh toán
            const pStatus = (appt.paymentStatus || 'pending').toLowerCase();
            if (paymentStatusFilter !== 'ALL' && pStatus !== paymentStatusFilter.toLowerCase()) return false;

            // Lọc theo trạng thái ca khám
            const aStatus = (appt.status || '').toLowerCase();
            if (apptStatusFilter !== 'ALL' && aStatus !== apptStatusFilter.toLowerCase()) return false;

            // Lọc theo bác sĩ
            if (doctorFilter !== 'ALL' && String(appt.doctorId) !== String(doctorFilter)) return false;

            // Lọc theo thời gian
            const slotDate = appt.date ? appt.date.slice(0, 10) : '';
            if (dateRangeFilter === 'TODAY' && slotDate !== todayStr) return false;
            if (dateRangeFilter === 'THIS_MONTH' && slotDate < startOfMonth) return false;
            if (dateRangeFilter === 'CUSTOM') {
                if (customStartDate && slotDate < customStartDate) return false;
                if (customEndDate && slotDate > customEndDate) return false;
            }

            // Lọc theo tìm kiếm từ khóa
            if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase().trim();
                const matchCode = (appt.appointmentCode || '').toLowerCase().includes(q);
                const matchPatient = (appt.patientName || '').toLowerCase().includes(q);
                const matchPhone = (appt.patientPhone || '').toLowerCase().includes(q);
                const matchDoctor = (appt.doctorName || '').toLowerCase().includes(q);
                if (!matchCode && !matchPatient && !matchPhone && !matchDoctor) return false;
            }

            return true;
        });
    }, [appointments, methodFilter, paymentStatusFilter, apptStatusFilter, doctorFilter, dateRangeFilter, customStartDate, customEndDate, searchQuery]);

    // 3. Phân trang
    const totalItems = filteredAppointments.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + pageSize);

    // 4. Xử lý xác nhận thu tiền tại quầy nhanh
    const handleQuickCollectPayment = async (apptId) => {
        if (!window.confirm("Xác nhận bệnh nhân đã thanh toán viện phí tại quầy?")) return;
        setUpdatingPaymentId(apptId);
        try {
            await updateAppointmentPaymentStatus(apptId, 'paid');
            alert("Đã cập nhật trạng thái: ĐÃ THANH TOÁN THÀNH CÔNG!");
        } catch (err) {
            alert("Lỗi cập nhật: " + (err.response?.data?.message || err.message));
        } finally {
            setUpdatingPaymentId(null);
        }
    };

    // 5. In / Xuất báo cáo nhanh
    const handlePrintReport = () => {
        window.print();
    };

    return (
        <div className="space-y-7 max-w-7xl mx-auto pb-10">
            {/* Header Title & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-3 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center text-lg shadow-md shadow-emerald-500/20">
                            <i className="fas fa-chart-line"></i>
                        </span>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight">
                                Quản Lý Doanh Thu & Dòng Tiền
                            </h1>
                            <p className="text-xs text-slate-500 mt-0.5">
                                Giám sát doanh thu phòng khám, phân loại chi tiết giữa Kênh Online (VNPAY/QR) và Tại quầy
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={refreshAll}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer"
                        title="Đồng bộ lại dữ liệu"
                    >
                        <i className={`fas fa-sync-alt text-emerald-600 ${isLoading ? 'fa-spin' : ''}`}></i>
                        <span>Đồng bộ</span>
                    </button>

                    <button
                        onClick={handlePrintReport}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-semibold text-xs shadow-sm transition cursor-pointer"
                    >
                        <i className="fas fa-print"></i>
                        <span>In báo cáo</span>
                    </button>

                    <Link
                        to="/admin/dashboard"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold text-xs transition cursor-pointer"
                    >
                        <i className="fas fa-arrow-left"></i>
                        <span>Về Dashboard</span>
                    </Link>
                </div>
            </div>

            {/* Khối KPI Thống Kê Tổng Quan Doanh Thu (5 Thẻ) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* 1. Tổng thực thu */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Tổng Thực Thu (Đã thanh toán)</span>
                        <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-base">
                            <i className="fas fa-money-bill-wave"></i>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-emerald-700 mb-1">
                        {formatCurrency(revenueStats.totalRevenue)}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">{revenueStats.totalPaidCount}</span> ca khám đã thanh toán
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-400"></div>
                </div>

                {/* 2. Doanh thu Online */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-indigo-500">Kênh Trực Tuyến (VNPAY / QR)</span>
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-base">
                            <i className="fas fa-qrcode"></i>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-indigo-700 mb-1">
                        {formatCurrency(revenueStats.onlineRevenue)}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span><strong className="text-slate-700">{revenueStats.onlinePaidCount}</strong> ca thanh toán</span>
                        <span className="px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-[10px]">
                            {revenueStats.onlinePercent}% tổng thu
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-blue-500"></div>
                </div>

                {/* 3. Doanh thu Tại quầy */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Thanh Toán Tại Quầy (Offline)</span>
                        <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center text-base">
                            <i className="fas fa-cash-register"></i>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-teal-700 mb-1">
                        {formatCurrency(revenueStats.offlineRevenue)}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center justify-between">
                        <span><strong className="text-slate-700">{revenueStats.offlinePaidCount}</strong> ca tại quầy</span>
                        <span className="px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 font-extrabold text-[10px]">
                            {revenueStats.offlinePercent}% tổng thu
                        </span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-teal-500 to-emerald-400"></div>
                </div>

                {/* 4. Doanh thu Chờ thu */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">Dự Thu (Chưa thanh toán)</span>
                        <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-base">
                            <i className="fas fa-clock"></i>
                        </div>
                    </div>
                    <div className="text-2xl font-black text-amber-700 mb-1">
                        {formatCurrency(revenueStats.pendingRevenue)}
                    </div>
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                        <span className="font-bold text-slate-700">{revenueStats.pendingCount}</span> ca chờ thu tiền khi đến khám
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 to-orange-400"></div>
                </div>
            </div>

            {/* Thanh So Sánh Tỷ Lệ Cơ Cấu Doanh Thu (Visual Progress Bar) */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                        <i className="fas fa-balance-scale text-blue-600"></i>
                        <span>Cơ cấu doanh thu theo phương thức thanh toán</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-semibold">
                        <span className="flex items-center gap-1.5 text-indigo-700">
                            <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block"></span>
                            <span>Trực tuyến (Online / QR): <strong>{revenueStats.onlinePercent}%</strong></span>
                        </span>
                        <span className="flex items-center gap-1.5 text-teal-700">
                            <span className="w-3 h-3 rounded-md bg-teal-500 inline-block"></span>
                            <span>Tại quầy (Offline): <strong>{revenueStats.offlinePercent}%</strong></span>
                        </span>
                    </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden flex">
                    <div
                        className="bg-indigo-600 h-full transition-all duration-700"
                        style={{ width: `${revenueStats.onlinePercent}%` }}
                        title={`Trực tuyến: ${revenueStats.onlinePercent}%`}
                    ></div>
                    <div
                        className="bg-teal-500 h-full transition-all duration-700"
                        style={{ width: `${revenueStats.offlinePercent}%` }}
                        title={`Tại quầy: ${revenueStats.offlinePercent}%`}
                    ></div>
                </div>
            </div>

            {/* Bộ Lọc & Tìm Kiếm Chuyên Sâu */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <i className="fas fa-filter text-blue-600"></i> Bộ Lọc Doanh Thu & Ca Khám
                    </span>
                    <button
                        onClick={() => {
                            setMethodFilter('ALL');
                            setPaymentStatusFilter('ALL');
                            setApptStatusFilter('ALL');
                            setDoctorFilter('ALL');
                            setDateRangeFilter('ALL');
                            setCustomStartDate('');
                            setCustomEndDate('');
                            setSearchQuery('');
                        }}
                        className="text-xs text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                    >
                        Đặt lại bộ lọc
                    </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                    {/* 1. Lọc theo hình thức thanh toán */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Phương thức</label>
                        <select
                            value={methodFilter}
                            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Tất cả phương thức</option>
                            <option value="online">🌐 Thanh toán Trực tuyến (VNPAY / QR)</option>
                            <option value="offline">💵 Thanh toán Tại quầy</option>
                        </select>
                    </div>

                    {/* 2. Lọc theo trạng thái thanh toán */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Trạng thái thanh toán</label>
                        <select
                            value={paymentStatusFilter}
                            onChange={(e) => { setPaymentStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Tất cả trạng thái tiền</option>
                            <option value="paid">✓ Đã thanh toán (Paid)</option>
                            <option value="pending">⏳ Chưa thanh toán (Pending)</option>
                            <option value="refunded">↩ Đã hoàn tiền (Refunded)</option>
                        </select>
                    </div>

                    {/* 3. Lọc theo trạng thái ca khám */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Trạng thái ca khám</label>
                        <select
                            value={apptStatusFilter}
                            onChange={(e) => { setApptStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Tất cả tiến trình</option>
                            <option value="completed">Đã hoàn tất khám</option>
                            <option value="confirmed">Đã xác nhận lịch</option>
                            <option value="pending">Chờ duyệt</option>
                            <option value="cancelled">Đã hủy ca</option>
                        </select>
                    </div>

                    {/* 4. Lọc theo Bác sĩ */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Bác sĩ phụ trách</label>
                        <select
                            value={doctorFilter}
                            onChange={(e) => { setDoctorFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Tất cả bác sĩ</option>
                            {doctors.map(d => (
                                <option key={d.id} value={d.id}>Bs. {d.fullName} ({d.specialtyName || 'Chuyên khoa'})</option>
                            ))}
                        </select>
                    </div>

                    {/* 5. Lọc theo thời gian */}
                    <div>
                        <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">Khoảng thời gian</label>
                        <select
                            value={dateRangeFilter}
                            onChange={(e) => { setDateRangeFilter(e.target.value); setCurrentPage(1); }}
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                        >
                            <option value="ALL">Toàn thời gian</option>
                            <option value="TODAY">Hôm nay</option>
                            <option value="THIS_MONTH">Tháng này</option>
                            <option value="CUSTOM">Tùy chọn ngày...</option>
                        </select>
                    </div>
                </div>

                {/* Nếu chọn CUSTOM date */}
                {dateRangeFilter === 'CUSTOM' && (
                    <div className="flex flex-wrap items-center gap-3 pt-2 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
                        <span className="font-bold text-slate-600">Từ ngày:</span>
                        <input
                            type="date"
                            value={customStartDate}
                            onChange={(e) => { setCustomStartDate(e.target.value); setCurrentPage(1); }}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                        <span className="font-bold text-slate-600">Đến ngày:</span>
                        <input
                            type="date"
                            value={customEndDate}
                            onChange={(e) => { setCustomEndDate(e.target.value); setCurrentPage(1); }}
                            className="px-2.5 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                    </div>
                )}

                {/* Ô tìm kiếm từ khóa */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <i className="fas fa-search text-xs"></i>
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo mã ca (#APT...), tên bệnh nhân, số điện thoại, tên bác sĩ..."
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Bảng Danh Sách Giao Dịch & Ca Khám */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                            Chi Tiết Lịch Hẹn & Doanh Thu
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold">
                            {filteredAppointments.length} bản ghi
                        </span>
                    </div>

                    <div className="text-xs text-slate-500">
                        Doanh thu theo bộ lọc: <strong className="text-emerald-700 text-sm font-black">
                            {formatCurrency(
                                filteredAppointments
                                    .filter(a => (a.paymentStatus || '').toLowerCase() === 'paid')
                                    .reduce((sum, a) => sum + (a.price || 200000), 0)
                            )}
                        </strong>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-[11px] tracking-wider">
                            <tr>
                                <th className="px-4 py-3.5">Mã Ca Khám</th>
                                <th className="px-4 py-3.5">Bệnh Nhân</th>
                                <th className="px-4 py-3.5">Bác Sĩ Phụ Trách</th>
                                <th className="px-4 py-3.5">Ngày & Giờ Khám</th>
                                <th className="px-4 py-3.5 text-right">Chi Phí</th>
                                <th className="px-4 py-3.5 text-center">Phương Thức</th>
                                <th className="px-4 py-3.5 text-center">Trạng Thái Tiền</th>
                                <th className="px-4 py-3.5 text-center">Tiến Trình</th>
                                <th className="px-4 py-3.5 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-slate-400">
                                        <i className="fas fa-spinner fa-spin text-2xl mb-2 block text-emerald-600"></i>
                                        Đang tổng hợp dữ liệu doanh thu...
                                    </td>
                                </tr>
                            ) : paginatedAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="9" className="text-center py-12 text-slate-400">
                                        <i className="fas fa-receipt text-3xl mb-2 block text-slate-300"></i>
                                        Không tìm thấy lịch hẹn hoặc hóa đơn phù hợp với điều kiện lọc.
                                    </td>
                                </tr>
                            ) : (
                                paginatedAppointments.map((appt) => {
                                    const isOnline = (appt.paymentMethod || '').toLowerCase() === 'online';
                                    const pStatus = (appt.paymentStatus || 'pending').toLowerCase();
                                    const aStatus = (appt.status || '').toLowerCase();
                                    const price = appt.price || 200000;

                                    return (
                                        <tr key={appt.id} className="hover:bg-slate-50/80 transition-colors">
                                            {/* Mã ca khám */}
                                            <td className="px-4 py-3.5">
                                                <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-1 rounded-lg">
                                                    #{appt.appointmentCode || `APT${appt.id}`}
                                                </span>
                                            </td>

                                            {/* Bệnh nhân */}
                                            <td className="px-4 py-3.5">
                                                <div className="font-bold text-slate-900">{appt.patientName || 'Bệnh nhân'}</div>
                                                <div className="text-[11px] text-slate-400">{appt.patientPhone || 'Chưa cập nhật SĐT'}</div>
                                            </td>

                                            {/* Bác sĩ */}
                                            <td className="px-4 py-3.5">
                                                <div className="font-semibold text-blue-700">{appt.doctorName || 'Bs. Chuyên khoa'}</div>
                                            </td>

                                            {/* Thời gian */}
                                            <td className="px-4 py-3.5">
                                                <div className="font-medium text-slate-800">
                                                    {appt.date ? new Date(appt.date).toLocaleDateString("vi-VN") : "Hôm nay"}
                                                </div>
                                                <div className="text-[11px] text-slate-400">{appt.time || 'Ca khám'}</div>
                                            </td>

                                            {/* Chi phí */}
                                            <td className="px-4 py-3.5 text-right font-black text-rose-600 text-sm">
                                                {formatCurrency(price)}
                                            </td>

                                            {/* Phương thức thanh toán */}
                                            <td className="px-4 py-3.5 text-center">
                                                {isOnline ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                                        <i className="fas fa-qrcode text-indigo-500"></i> Trực tuyến (VNPAY)
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
                                                        <i className="fas fa-money-bill-wave text-teal-500"></i> Tại quầy
                                                    </span>
                                                )}
                                            </td>

                                            {/* Trạng thái tiền */}
                                            <td className="px-4 py-3.5 text-center">
                                                {pStatus === 'paid' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                        <i className="fas fa-check-circle text-emerald-600"></i> Đã thanh toán
                                                    </span>
                                                ) : pStatus === 'refunded' ? (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-300">
                                                        <i className="fas fa-undo"></i> Đã hoàn tiền
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-300">
                                                        <i className="fas fa-hourglass-half text-amber-500"></i> Chưa thanh toán
                                                    </span>
                                                )}
                                            </td>

                                            {/* Tiến trình ca khám */}
                                            <td className="px-4 py-3.5 text-center">
                                                {aStatus === 'completed' ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px]">Đã khám</span>
                                                ) : aStatus === 'confirmed' ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold text-[10px]">Đã xác nhận</span>
                                                ) : aStatus === 'cancelled' ? (
                                                    <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold text-[10px]">Đã hủy</span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px]">Chờ duyệt</span>
                                                )}
                                            </td>

                                            {/* Thao tác */}
                                            <td className="px-4 py-3.5 text-center">
                                                {pStatus !== 'paid' ? (
                                                    <button
                                                        onClick={() => handleQuickCollectPayment(appt.id)}
                                                        disabled={updatingPaymentId === appt.id}
                                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] shadow-xs transition cursor-pointer disabled:opacity-50"
                                                        title="Bệnh nhân nộp tiền tại quầy phòng khám"
                                                    >
                                                        {updatingPaymentId === appt.id ? (
                                                            <i className="fas fa-spinner fa-spin"></i>
                                                        ) : (
                                                            <>
                                                                <i className="fas fa-check mr-1"></i> Thu tiền
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                                                        <i className="fas fa-check"></i> Đã thu
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Phân trang */}
                <div className="p-4 border-t border-slate-100">
                    <Pagination
                        currentPage={currentPage}
                        totalItems={totalItems}
                        pageSize={pageSize}
                        onPageChange={setCurrentPage}
                        onPageSizeChange={(newSize) => {
                            setPageSize(newSize);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
