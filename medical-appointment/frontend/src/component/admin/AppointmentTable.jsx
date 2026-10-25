import React from 'react';

export default function AppointmentTable({
    appointments = [],
    isLoading = false,
    updatingId = null,
    onUpdateStatus
}) {
    const getStatusBadge = (status) => {
        switch (status?.toLowerCase()) {
            case 'pending':
            case 'chờ duyệt':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Chờ duyệt
                    </span>
                );
            case 'confirmed':
            case 'đã xác nhận':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span> Đã xác nhận
                    </span>
                );
            case 'completed':
            case 'đã khám':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đã khám
                    </span>
                );
            case 'rejected':
            case 'cancelled':
            case 'đã hủy':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Đã hủy
                    </span>
                );
            default:
                return (
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700">
                        {status}
                    </span>
                );
        }
    };

    return (
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
                                    <i className="fas fa-spinner fa-spin text-2xl mb-2 block text-blue-600"></i>
                                    Đang tải dữ liệu lịch hẹn...
                                </td>
                            </tr>
                        ) : appointments.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-12 text-slate-400">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto mb-2">
                                        <i className="fas fa-calendar-times"></i>
                                    </div>
                                    <p className="text-base font-semibold text-slate-600">Không có lịch hẹn nào</p>
                                    <p className="text-xs text-slate-400 mt-1">Không tìm thấy lịch hẹn phù hợp với bộ lọc hiện tại.</p>
                                </td>
                            </tr>
                        ) : (
                            appointments.map((appt) => (
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
                                        <p className="text-xs text-slate-500 font-mono">
                                            {appt.time || ''} {appt.endTime ? `- ${appt.endTime}` : ''}
                                        </p>
                                    </td>
                                    <td className="px-5 py-4 max-w-xs truncate text-xs text-slate-600">
                                        {appt.reason || appt.notes || 'Khám tổng quát theo lịch'}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {getStatusBadge(appt.status)}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="inline-flex items-center gap-2">
                                            {updatingId === appt.id && (
                                                <i className="fas fa-spinner fa-spin text-blue-600 text-xs"></i>
                                            )}
                                            <select
                                                value={appt.status?.toLowerCase() || 'pending'}
                                                disabled={updatingId === appt.id}
                                                onChange={(e) => onUpdateStatus(appt.id, e.target.value)}
                                                className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer disabled:opacity-50 shadow-sm hover:border-slate-300 transition"
                                            >
                                                <option value="pending">Chờ duyệt</option>
                                                <option value="confirmed">Đã xác nhận</option>
                                                <option value="completed">Đã khám</option>
                                                <option value="rejected">Đã hủy</option>
                                            </select>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
