import React, { useState, useEffect } from 'react';
import { adminService } from '../../service/adminService';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    const fetchAppointments = async () => {
        setIsLoading(true);
        try {
            const data = await adminService.getAllAppointments();
            setAppointments(data || []);
        } catch (err) {
            console.error("Lỗi tải danh sách lịch hẹn toàn viện:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        setUpdatingId(appointmentId);
        try {
            await adminService.updateAppointmentStatus(appointmentId, newStatus);
            setAppointments(prev =>
                prev.map(a => a.id === appointmentId ? { ...a, status: newStatus } : a)
            );
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Lỗi khi cập nhật trạng thái");
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredAppointments = appointments.filter((appt) => {
        const matchesStatus = statusFilter === 'ALL' || appt.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch =
            (appt.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.appointmentCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">Chờ duyệt</span>;
            case 'confirmed':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Đã xác nhận</span>;
            case 'completed':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Đã khám</span>;
            case 'rejected':
            case 'cancelled':
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Đã hủy</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-calendar-check"></i>
                        </span>
                        Lịch Hẹn Toàn Phòng Khám
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Theo dõi, rà soát và điều phối mọi ca khám bệnh của tất cả các chuyên khoa.
                    </p>
                </div>

                <button
                    onClick={fetchAppointments}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                    <i className="fas fa-sync-alt text-blue-600"></i> Làm mới dữ liệu
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm bệnh nhân, bác sĩ, mã lịch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {['ALL', 'pending', 'confirmed', 'completed', 'rejected'].map((st) => (
                        <button
                            key={st}
                            onClick={() => setStatusFilter(st)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                statusFilter === st
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st === 'ALL' ? 'Tất cả' : st === 'pending' ? 'Chờ duyệt' : st === 'confirmed' ? 'Đã duyệt' : st === 'completed' ? 'Đã khám' : 'Đã hủy'}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-5 py-4">Mã Ca</th>
                                <th className="px-5 py-4">Bệnh Nhân</th>
                                <th className="px-5 py-4">Bác Sĩ Phụ Trách</th>
                                <th className="px-5 py-4">Thời Gian Khám</th>
                                <th className="px-5 py-4">Lý Do / Triệu Chứng</th>
                                <th className="px-5 py-4 text-center">Trạng Thái</th>
                                <th className="px-5 py-4 text-center">Cập Nhật Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        <i className="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                                        Đang tải dữ liệu lịch hẹn...
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        Không có lịch hẹn nào phù hợp bộ lọc.
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4 font-mono font-bold text-slate-700">
                                            #{appt.id}
                                            {appt.appointmentCode && (
                                                <span className="block text-[10px] text-slate-400 font-normal">
                                                    {appt.appointmentCode}
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-slate-900">{appt.patientName || 'Bệnh nhân'}</p>
                                            <p className="text-xs text-slate-400">{appt.patientPhone || ''}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-blue-700">{appt.doctorName || 'Bác sĩ'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800 text-xs">{appt.date || ''}</p>
                                            <p className="text-xs text-slate-500 font-mono">{appt.time || ''} {appt.endTime ? `- ${appt.endTime}` : ''}</p>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-600">
                                            {appt.reason || appt.notes || 'Khám tổng quát theo lịch'}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {getStatusBadge(appt.status)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <select
                                                value={appt.status?.toLowerCase() || 'pending'}
                                                disabled={updatingId === appt.id}
                                                onChange={(e) => handleUpdateStatus(appt.id, e.target.value)}
                                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
                                            >
                                                <option value="pending">Chờ duyệt</option>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="completed">Đã khám</option>
                                                <option value="rejected">Đã hủy</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
