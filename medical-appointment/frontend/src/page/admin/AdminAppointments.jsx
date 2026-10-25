import React, { useState, useEffect } from 'react';
import { adminService } from '../../service/adminService';

export default function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
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

        fetchAppointments();
    }, []);

    const filteredAppointments = appointments.filter((appt) => {
        const matchesStatus = statusFilter === 'ALL' || appt.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch =
            (appt.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
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
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200">Đã hủy</span>;
            default:
                return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">{status}</span>;
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Lịch Hẹn Toàn Phòng Khám
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Theo dõi, rà soát mọi ca khám bệnh của tất cả các chuyên khoa trong phòng khám.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm bệnh nhân, bác sĩ, ghi chú..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
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
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-xs tracking-wider">
                            <tr>
                                <th className="px-5 py-4">Mã Ca</th>
                                <th className="px-5 py-4">Bệnh Nhân</th>
                                <th className="px-5 py-4">Bác Sĩ Phụ Trách</th>
                                <th className="px-5 py-4">Thời Gian Khám</th>
                                <th className="px-5 py-4">Ghi Chú / Triệu Chứng</th>
                                <th className="px-5 py-4 text-center">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        <i className="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                                        Đang tải lịch hẹn...
                                    </td>
                                </tr>
                            ) : filteredAppointments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        Không có lịch hẹn nào phù hợp bộ lọc.
                                    </td>
                                </tr>
                            ) : (
                                filteredAppointments.map((appt) => (
                                    <tr key={appt.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4 font-mono font-bold text-slate-700">
                                            #{appt.id}
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-bold text-slate-900">{appt.patientName || 'Bệnh nhân'}</p>
                                            <p className="text-xs text-slate-400">{appt.patientPhone || ''}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-blue-700">{appt.doctorName || 'Bác sĩ'}</p>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-semibold text-slate-800">{appt.date || ''}</p>
                                            <p className="text-xs text-slate-500">{appt.time || ''} {appt.endTime ? `- ${appt.endTime}` : ''}</p>
                                        </td>
                                        <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-500">
                                            {appt.notes || 'Khám tổng quát theo lịch'}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            {getStatusBadge(appt.status)}
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
