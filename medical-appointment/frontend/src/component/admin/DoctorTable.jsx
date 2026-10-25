import React from 'react';

const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594824813681-424a6549c95d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=350&auto=format&fit=crop&q=80',
];

export default function DoctorTable({
    doctors = [],
    isLoading = false,
    onEdit,
    onResetPassword,
    onDelete,
    formatCurrency
}) {
    const defaultFormatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const currencyFormatter = formatCurrency || defaultFormatCurrency;

    return (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-xs tracking-wider">
                        <tr>
                            <th className="px-5 py-4">Bác Sĩ</th>
                            <th className="px-5 py-4">Chuyên Khoa</th>
                            <th className="px-5 py-4">Tài Khoản & Liên Hệ</th>
                            <th className="px-5 py-4">Kinh Nghiệm</th>
                            <th className="px-5 py-4">Giá Khám</th>
                            <th className="px-5 py-4 text-center">Thao Tác Quản Trị</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {isLoading ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-slate-400">
                                    <i className="fas fa-spinner fa-spin text-2xl mb-2 block text-blue-600"></i>
                                    Đang tải danh sách bác sĩ...
                                </td>
                            </tr>
                        ) : doctors.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="text-center py-12 text-slate-400">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center text-xl mx-auto mb-2">
                                        <i className="fas fa-user-md"></i>
                                    </div>
                                    <p className="text-base font-semibold text-slate-600">Không tìm thấy bác sĩ nào</p>
                                    <p className="text-xs text-slate-400 mt-1">
                                        Hãy thử tìm với từ khóa khác hoặc bấm nút Cấp tài khoản mới.
                                    </p>
                                </td>
                            </tr>
                        ) : (
                            doctors.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <img
                                                src={doc.imageUrl || DEFAULT_AVATARS[0]}
                                                alt={doc.fullName}
                                                className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                                                onError={(e) => { e.target.src = DEFAULT_AVATARS[0]; }}
                                            />
                                            <div>
                                                <p className="font-bold text-slate-900 text-sm">{doc.fullName}</p>
                                                <p className="text-xs text-slate-400 truncate max-w-[220px]">
                                                    <i className="fas fa-map-marker-alt text-[10px] mr-1 text-slate-400"></i>
                                                    {doc.address || 'TP. Hồ Chí Minh'}
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                                            <i className="fas fa-stethoscope text-[10px] mr-1"></i>
                                            {doc.specialtyName || 'Đa khoa'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="space-y-0.5">
                                            <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-800">
                                                <i className="fas fa-envelope text-slate-400 text-[10px]"></i>
                                                <span>{doc.email}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                                <i className="fas fa-phone-alt text-slate-400 text-[10px]"></i>
                                                <span>{doc.phoneNumber || 'Chưa cập nhật'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-slate-700">{doc.experienceYears || 1} năm</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-bold text-emerald-600">
                                            {currencyFormatter(doc.pricePerAppointment || 200000)}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        <div className="inline-flex items-center gap-1.5">
                                            <button
                                                onClick={() => onEdit(doc)}
                                                className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                                title="Chỉnh sửa hồ sơ & chuyên khoa"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>

                                            <button
                                                onClick={() => onResetPassword(doc)}
                                                className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                                title="Cấp lại mật khẩu tài khoản"
                                            >
                                                <i className="fas fa-key"></i>
                                            </button>

                                            <button
                                                onClick={() => onDelete(doc.id, doc.fullName)}
                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                title="Xóa hồ sơ bác sĩ"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
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
