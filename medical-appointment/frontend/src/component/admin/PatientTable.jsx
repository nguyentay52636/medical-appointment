import React from 'react';

export default function PatientTable({
    patients = [],
    isLoading = false,
    deletingId = null,
    onDelete
}) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-xs tracking-wider">
                        <tr>
                            <th className="px-5 py-4">Mã BN</th>
                            <th className="px-5 py-4">Họ và Tên</th>
                            <th className="px-5 py-4">Email Liên Hệ</th>
                            <th className="px-5 py-4">Số Điện Thoại</th>
                            <th className="px-5 py-4">Địa Chỉ</th>
                            <th className="px-5 py-4 text-center">Trạng Thái</th>
                            <th className="px-5 py-4 text-center">Thao Tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="7" className="text-center py-12 text-slate-400">
                                    <i className="fas fa-spinner fa-spin text-2xl mb-2 block text-blue-600"></i>
                                    Đang tải dữ liệu bệnh nhân...
                                </td>
                            </tr>
                        ) : patients.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="text-center py-12 text-slate-400">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto mb-2">
                                        <i className="fas fa-hospital-user"></i>
                                    </div>
                                    <p className="text-base font-semibold text-slate-600">Không tìm thấy bệnh nhân nào</p>
                                    <p className="text-xs text-slate-400 mt-1">Hãy thử tìm với từ khóa khác.</p>
                                </td>
                            </tr>
                        ) : (
                            patients.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                    <td className="px-5 py-4 font-mono font-bold text-slate-700">
                                        #{p.id}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200/60 flex-shrink-0">
                                                {(p.fullName || 'B').charAt(0).toUpperCase()}
                                            </div>
                                            <span className="font-bold text-slate-900">{p.fullName}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-mono font-medium text-slate-800">
                                        {p.email}
                                    </td>
                                    <td className="px-5 py-4 text-xs font-medium text-slate-700">
                                        {p.phoneNumber || 'Chưa cung cấp'}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                                        {p.address || 'Chưa cập nhật'}
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Đã kích hoạt
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <button
                                            onClick={() => onDelete(p.id, p.fullName)}
                                            disabled={deletingId === p.id}
                                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                            title="Xóa hồ sơ bệnh nhân"
                                        >
                                            {deletingId === p.id ? (
                                                <i className="fas fa-spinner fa-spin text-xs"></i>
                                            ) : (
                                                <i className="fas fa-trash-alt"></i>
                                            )}
                                        </button>
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
