import React, { useState, useEffect } from 'react';
import { adminService } from '../../service/adminService';

export default function AdminDoctors() {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

    // State Modal Thêm Bác sĩ
    const [showAddModal, setShowAddModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '123456',
        phoneNumber: '',
        specialtyId: '',
        experienceYears: 5,
        pricePerAppointment: 250000,
        address: '273 An Dương Vương, Phường 4, Quận 5, TP. HCM',
        bio: '',
        imageUrl: 'https://i.pravatar.cc/350?img=11'
    });

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [docData, specData] = await Promise.all([
                adminService.getAllDoctors(),
                adminService.getAllSpecialties()
            ]);
            setDoctors(docData || []);
            setSpecialties(specData || []);
            if (specData && specData.length > 0) {
                setFormData(prev => ({ ...prev, specialtyId: specData[0].id }));
            }
        } catch (err) {
            console.error("Lỗi nạp dữ liệu bác sĩ:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleCreateDoctor = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await adminService.createDoctor(formData);
            alert("Thêm bác sĩ thành công!");
            setShowAddModal(false);
            setFormData({
                fullName: '',
                email: '',
                password: '123456',
                phoneNumber: '',
                specialtyId: specialties[0]?.id || '',
                experienceYears: 5,
                pricePerAppointment: 250000,
                address: '273 An Dương Vương, Phường 4, Quận 5, TP. HCM',
                bio: '',
                imageUrl: `https://i.pravatar.cc/350?img=${Math.floor(Math.random() * 60) + 1}`
            });
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Lỗi khi thêm bác sĩ");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteDoctor = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa bác sĩ "${name}" khỏi phòng khám?`)) {
            return;
        }
        try {
            await adminService.deleteDoctor(id);
            alert("Đã xóa bác sĩ thành công!");
            setDoctors(prev => prev.filter(d => d.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || "Không thể xóa bác sĩ do có liên kết lịch hẹn");
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
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Title & Add Button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Quản Lý Danh Sách Bác Sĩ
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản lý hồ sơ, cấp tài khoản và cấu hình giá khám cho các bác sĩ trong phòng khám.
                    </p>
                </div>

                <button
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                >
                    <i className="fas fa-plus"></i> Thêm Bác Sĩ Mới
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email bác sĩ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Chuyên khoa:</span>
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto"
                    >
                        <option value="ALL">Tất cả chuyên khoa</option>
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
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-xs tracking-wider">
                            <tr>
                                <th className="px-5 py-4">Bác Sĩ</th>
                                <th className="px-5 py-4">Chuyên Khoa</th>
                                <th className="px-5 py-4">Liên Hệ</th>
                                <th className="px-5 py-4">Kinh Nghiệm</th>
                                <th className="px-5 py-4">Giá Khám</th>
                                <th className="px-5 py-4 text-center">Thao Tác</th>
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
                                        Không tìm thấy bác sĩ nào phù hợp.
                                    </td>
                                </tr>
                            ) : (
                                filteredDoctors.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-3">
                                                <img
                                                    src={doc.imageUrl || "https://i.pravatar.cc/150?img=1"}
                                                    alt={doc.fullName}
                                                    className="w-11 h-11 rounded-full object-cover border border-slate-200 shadow-sm"
                                                />
                                                <div>
                                                    <p className="font-bold text-slate-900">{doc.fullName}</p>
                                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{doc.address || 'TP. HCM'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4">
                                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/60">
                                                {doc.specialtyName || 'Chung'}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4">
                                            <p className="font-medium text-slate-800 text-xs">{doc.email}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{doc.phoneNumber || 'Chưa cập nhật'}</p>
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
                                            <button
                                                onClick={() => handleDeleteDoctor(doc.id, doc.fullName)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                                                title="Xóa bác sĩ"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Thêm Bác Sĩ Mới */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[90vh] animate-fadeIn">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">Thêm Bác Sĩ Mới Vào Phòng Khám</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Cấp tài khoản và đưa bác sĩ lên hệ thống đặt lịch</p>
                            </div>
                            <button
                                onClick={() => setShowAddModal(false)}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateDoctor} className="mt-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Họ và tên bác sĩ *</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        required
                                        placeholder="Ví dụ: BS.CKII Nguyễn Hoàng Long"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Email đăng nhập *</label>
                                    <input
                                        type="email"
                                        name="email"
                                        required
                                        placeholder="bs.long@klinik.vn"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Mật khẩu đăng nhập *</label>
                                    <input
                                        type="text"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Số điện thoại *</label>
                                    <input
                                        type="text"
                                        name="phoneNumber"
                                        required
                                        placeholder="0901234567"
                                        value={formData.phoneNumber}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Chuyên khoa *</label>
                                    <select
                                        name="specialtyId"
                                        value={formData.specialtyId}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        {specialties.map((s) => (
                                            <option key={s.id} value={s.id}>{s.specialtyName}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kinh nghiệm (Năm)</label>
                                    <input
                                        type="number"
                                        name="experienceYears"
                                        min="1"
                                        value={formData.experienceYears}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá khám (VND)</label>
                                    <input
                                        type="number"
                                        name="pricePerAppointment"
                                        step="10000"
                                        value={formData.pricePerAppointment}
                                        onChange={handleChange}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa chỉ phòng khám</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiểu sử & Giới thiệu chuyên môn</label>
                                <textarea
                                    name="bio"
                                    rows="3"
                                    placeholder="Chuyên gia đầu ngành về điều trị..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                                >
                                    Hủy bỏ
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Thêm Bác Sĩ'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
