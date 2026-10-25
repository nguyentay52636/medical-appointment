import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../service/adminService';

export default function AdminDoctors() {
    const navigate = useNavigate();
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

    // State cho Modal Cập nhật / Phân lại chuyên khoa
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);

    // State cho Modal Cấp lại mật khẩu (Reset Password)
    const [resetPwDoctor, setResetPwDoctor] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccessMsg, setResetSuccessMsg] = useState('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [docData, specData] = await Promise.all([
                adminService.getAllDoctors(),
                adminService.getAllSpecialties()
            ]);
            setDoctors(docData || []);
            setSpecialties(specData || []);
        } catch (err) {
            console.error("Lỗi nạp dữ liệu bác sĩ:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    // Xử lý mở Modal Cập nhật
    const handleOpenEdit = (doc) => {
        setEditingDoctor(doc);
        setEditForm({
            fullName: doc.fullName || '',
            specialtyId: doc.specialtyId || (specialties[0]?.id || ''),
            phoneNumber: doc.phoneNumber || '',
            experienceYears: doc.experienceYears || 1,
            pricePerAppointment: doc.pricePerAppointment || 200000,
            address: doc.address || '',
            bio: doc.bio || '',
            imageUrl: doc.imageUrl || ''
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await adminService.updateDoctor(editingDoctor.id, editForm);
            alert("Cập nhật thông tin và phân khoa bác sĩ thành công!");
            setEditingDoctor(null);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Lỗi khi cập nhật");
        } finally {
            setIsUpdating(false);
        }
    };

    // Xử lý mở Modal Cấp lại mật khẩu
    const handleOpenResetPassword = (doc) => {
        setResetPwDoctor(doc);
        setNewPassword('Klinik@' + Math.floor(100000 + Math.random() * 900000));
        setResetSuccessMsg('');
    };

    const handleConfirmResetPassword = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert("Mật khẩu mới phải từ 6 ký tự trở lên");
            return;
        }
        setIsResetting(true);
        try {
            await adminService.resetDoctorPassword(resetPwDoctor.id, newPassword);
            setResetSuccessMsg(`Đã đổi mật khẩu thành công sang: "${newPassword}". Vui lòng bàn giao cho bác sĩ!`);
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Lỗi khi cấp lại mật khẩu");
        } finally {
            setIsResetting(false);
        }
    };

    // Xử lý Xóa Bác sĩ
    const handleDeleteDoctor = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa bác sĩ "${name}" khỏi phòng khám?`)) {
            return;
        }
        try {
            await adminService.deleteDoctor(id);
            alert("Đã xóa bác sĩ thành công!");
            setDoctors(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Không thể xóa bác sĩ vì đã có dữ liệu lịch hẹn liên quan!");
        }
    };

    // Lọc danh sách bác sĩ
    const filteredDoctors = doctors.filter((doc) => {
        const matchesName = (doc.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (doc.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpec = selectedSpecialty === 'ALL' || doc.specialtyId === Number(selectedSpecialty) || doc.specialtyName === selectedSpecialty;
        return matchesName && matchesSpec;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header & Primary Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-user-md"></i>
                        </span>
                        Quản Lý Danh Sách & Cấp Tài Khoản Bác Sĩ
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Hồ sơ chuyên môn, phân bổ chuyên khoa công tác, cấp quyền và quản lý tài khoản Bác sĩ toàn phòng khám.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        to="/admin/doctors/create"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                    >
                        <i className="fas fa-user-plus"></i> Cấp Tài Khoản Bác Sĩ Mới
                    </Link>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm theo tên bác sĩ hoặc email đăng nhập..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Lọc chuyên khoa:</span>
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                    >
                        <option value="ALL">Tất cả chuyên khoa ({doctors.length})</option>
                        {specialties.map((s) => (
                            <option key={s.id} value={s.id}>{s.specialtyName}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctor Table */}
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
                                        <i className="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                                        Đang tải danh sách bác sĩ...
                                    </td>
                                </tr>
                            ) : filteredDoctors.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        <p className="text-base font-semibold text-slate-600">Không tìm thấy bác sĩ nào</p>
                                        <p className="text-xs text-slate-400 mt-1">Hãy thử tìm với từ khóa khác hoặc bấm nút Cấp tài khoản mới.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={doc.imageUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"}
                                                    alt={doc.fullName}
                                                    className="w-12 h-12 rounded-xl object-cover border border-slate-200 shadow-sm flex-shrink-0"
                                                    onError={(e) => { e.target.src = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150"; }}
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
                                                {formatCurrency(doc.pricePerAppointment || 200000)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* Nút Sửa / Phân khoa */}
                                                <button
                                                    onClick={() => handleOpenEdit(doc)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                                    title="Chỉnh sửa hồ sơ & phân khoa"
                                                >
                                                    <i className="fas fa-edit"></i>
                                                </button>

                                                {/* Nút Cấp lại mật khẩu */}
                                                <button
                                                    onClick={() => handleOpenResetPassword(doc)}
                                                    className="p-2 text-amber-600 hover:text-amber-800 hover:bg-amber-50 rounded-lg transition cursor-pointer"
                                                    title="Cấp lại mật khẩu tài khoản"
                                                >
                                                    <i className="fas fa-key"></i>
                                                </button>

                                                {/* Nút Xóa */}
                                                <button
                                                    onClick={() => handleDeleteDoctor(doc.id, doc.fullName)}
                                                    className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                                                    title="Xóa bác sĩ khỏi hệ thống"
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

            {/* MODAL CHỈNH SỬA & PHÂN LẠI CHUYÊN KHOA */}
            {editingDoctor && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-fadeIn border border-slate-100">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Chỉnh Sửa Hồ Sơ & Phân Khoa Bác Sĩ
                                </h3>
                                <p className="text-xs text-slate-500 mt-0.5">Tài khoản: {editingDoctor.email}</p>
                            </div>
                            <button
                                onClick={() => setEditingDoctor(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleSaveEdit} className="mt-5 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Họ và tên bác sĩ *</label>
                                    <input
                                        type="text"
                                        required
                                        value={editForm.fullName}
                                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Phân Chuyên Khoa *</label>
                                    <select
                                        value={editForm.specialtyId}
                                        onChange={(e) => setEditForm({ ...editForm, specialtyId: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {specialties.map(s => (
                                            <option key={s.id} value={s.id}>{s.specialtyName}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={editForm.phoneNumber}
                                        onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kinh nghiệm (Năm)</label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={editForm.experienceYears}
                                        onChange={(e) => setEditForm({ ...editForm, experienceYears: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá khám (VND)</label>
                                    <input
                                        type="number"
                                        step="10000"
                                        value={editForm.pricePerAppointment}
                                        onChange={(e) => setEditForm({ ...editForm, pricePerAppointment: Number(e.target.value) })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa chỉ phòng khám</label>
                                <input
                                    type="text"
                                    value={editForm.address}
                                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiểu sử & Giới thiệu chuyên môn</label>
                                <textarea
                                    rows="3"
                                    value={editForm.bio}
                                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setEditingDoctor(null)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isUpdating}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                                >
                                    {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL CẤP LẠI MẬT KHẨU (RESET PASSWORD) */}
            {resetPwDoctor && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 animate-fadeIn border border-slate-100">
                        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                            <div className="flex items-center gap-2.5">
                                <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                                    <i className="fas fa-key"></i>
                                </span>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-900">Cấp Lại Mật Khẩu</h3>
                                    <p className="text-xs text-slate-500">{resetPwDoctor.fullName}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setResetPwDoctor(null)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {resetSuccessMsg ? (
                            <div className="space-y-4">
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-xs space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                                        <i className="fas fa-check-circle"></i> Thành công!
                                    </div>
                                    <p>{resetSuccessMsg}</p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setResetPwDoctor(null)}
                                    className="w-full py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-black transition cursor-pointer"
                                >
                                    Đóng cửa sổ
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Mật Khẩu Mới Khởi Tạo
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setNewPassword('Klinik@' + Math.floor(100000 + Math.random() * 900000))}
                                            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer"
                                            title="Tạo chuỗi ngẫu nhiên"
                                        >
                                            <i className="fas fa-random"></i>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Mật khẩu mới sẽ thay thế mật khẩu cũ ngay lập tức.</p>
                                </div>

                                <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                                    <button
                                        type="button"
                                        onClick={() => setResetPwDoctor(null)}
                                        className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="button"
                                        disabled={isResetting}
                                        onClick={handleConfirmResetPassword}
                                        className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                                    >
                                        {isResetting ? 'Đang đổi...' : 'Xác Nhận Đổi Mật Khẩu'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
