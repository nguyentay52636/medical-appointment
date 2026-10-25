import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { adminService } from '../../service/adminService';

// Ảnh đại diện mẫu mặc định nếu không tải ảnh
const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594824813681-424a6549c95d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=350&auto=format&fit=crop&q=80',
];

export default function AdminDoctors() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

    // ==========================================
    // STATE DIALOG CẤP TÀI KHOẢN BÁC SĨ MỚI
    // ==========================================
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreatePassword, setShowCreatePassword] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [createdAccountInfo, setCreatedAccountInfo] = useState(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const fileInputRef = useRef(null);

    const initialFormData = {
        fullName: '',
        email: '',
        password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000),
        phoneNumber: '',
        specialtyId: '',
        experienceYears: 5,
        pricePerAppointment: 250000,
        address: '273 An Dương Vương, Phường 4, Quận 5, TP. HCM',
        bio: '',
        imageUrl: DEFAULT_AVATARS[0]
    };
    const [createFormData, setCreateFormData] = useState(initialFormData);

    // ==========================================
    // STATE DIALOG CHỈNH SỬA & PHÂN KHOA
    // ==========================================
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [isUpdating, setIsUpdating] = useState(false);
    const [isEditUploading, setIsEditUploading] = useState(false);
    const editFileInputRef = useRef(null);

    // ==========================================
    // STATE DIALOG CẤP LẠI MẬT KHẨU (RESET PASS)
    // ==========================================
    const [resetPwDoctor, setResetPwDoctor] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccessMsg, setResetSuccessMsg] = useState('');

    // Load dữ liệu ban đầu
    const loadData = async () => {
        setIsLoading(true);
        try {
            const [docData, specData] = await Promise.all([
                adminService.getAllDoctors(),
                adminService.getAllSpecialties()
            ]);
            setDoctors(docData || []);
            setSpecialties(specData || []);
            if (specData && specData.length > 0 && !createFormData.specialtyId) {
                setCreateFormData(prev => ({ ...prev, specialtyId: specData[0].id }));
            }
        } catch (err) {
            console.error("Lỗi nạp dữ liệu bác sĩ:", err);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        // Tự động mở modal nếu query params có ?action=create
        if (searchParams.get('action') === 'create') {
            setShowCreateModal(true);
        }
    }, []);

    // Xử lý upload avatar từ thiết bị/máy tính cho Dialog Cấp tài khoản
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Giới hạn dung lượng ảnh < 10MB
        if (file.size > 10 * 1024 * 1024) {
            alert("Vui lòng chọn hình ảnh có dung lượng nhỏ hơn 10MB!");
            return;
        }

        // Tạo preview tạm thời trên giao diện
        const localPreview = URL.createObjectURL(file);
        setCreateFormData(prev => ({ ...prev, imageUrl: localPreview }));

        setIsUploadingAvatar(true);
        try {
            const res = await adminService.uploadAvatar(file);
            if (res && res.imageUrl) {
                setCreateFormData(prev => ({ ...prev, imageUrl: res.imageUrl }));
            }
        } catch (err) {
            console.warn("Không thể tải lên server, chuyển sang chế độ nạp trực tiếp:", err);
            // Fallback đọc dạng Base64 Data URL nếu server upload gặp trục trặc
            const reader = new FileReader();
            reader.onloadend = () => {
                setCreateFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    // Xử lý upload avatar cho Dialog Chỉnh sửa hồ sơ
    const handleEditFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert("Vui lòng chọn hình ảnh có dung lượng nhỏ hơn 10MB!");
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setEditForm(prev => ({ ...prev, imageUrl: localPreview }));

        setIsEditUploading(true);
        try {
            const res = await adminService.uploadAvatar(file);
            if (res && res.imageUrl) {
                setEditForm(prev => ({ ...prev, imageUrl: res.imageUrl }));
            }
        } catch (err) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setEditForm(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsEditUploading(false);
        }
    };

    // Submit Cấp tài khoản mới
    const handleCreateDoctorSubmit = async (e) => {
        e.preventDefault();

        if (!createFormData.fullName.trim()) {
            alert("Vui lòng nhập họ tên bác sĩ");
            return;
        }
        if (!createFormData.email.trim()) {
            alert("Vui lòng nhập email đăng nhập");
            return;
        }
        if (!createFormData.password || createFormData.password.length < 6) {
            alert("Mật khẩu khởi tạo phải từ 6 ký tự trở lên");
            return;
        }

        setIsCreating(true);
        try {
            await adminService.createDoctor(createFormData);
            const chosenSpec = specialties.find(s => s.id === Number(createFormData.specialtyId));

            // Hiển thị phiếu bàn giao tài khoản ngay trong dialog
            setCreatedAccountInfo({
                fullName: createFormData.fullName,
                email: createFormData.email,
                password: createFormData.password,
                specialtyName: chosenSpec?.specialtyName || 'Chuyên khoa chung',
                phoneNumber: createFormData.phoneNumber,
                loginUrl: window.location.origin + '/doctor/login'
            });

            // Tải lại danh sách bác sĩ ở trang chính
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Lỗi khi cấp tài khoản bác sĩ!");
        } finally {
            setIsCreating(false);
        }
    };

    // Sao chép thông tin bàn giao tài khoản
    const handleCopyCredentials = () => {
        if (!createdAccountInfo) return;
        const handoverText = `[KLINIK HEALTHCARE] THÔNG BÁO BÀN GIAO TÀI KHOẢN BÁC SĨ MỚI
──────────────────────────────────────
• Bác sĩ: ${createdAccountInfo.fullName}
• Chuyên khoa phân công: ${createdAccountInfo.specialtyName}
• Cổng đăng nhập Bác sĩ: ${createdAccountInfo.loginUrl}
• Email đăng nhập: ${createdAccountInfo.email}
• Mật khẩu khởi tạo: ${createdAccountInfo.password}
──────────────────────────────────────
Ghi chú: Vui lòng đăng nhập và chủ động đổi lại mật khẩu cá nhân trong lần làm việc đầu tiên.`;

        navigator.clipboard.writeText(handoverText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        });
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setCreatedAccountInfo(null);
        setCreateFormData({
            ...initialFormData,
            specialtyId: specialties[0]?.id || '',
            password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000)
        });
    };

    // Xử lý mở Dialog Chỉnh sửa
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
            imageUrl: doc.imageUrl || DEFAULT_AVATARS[0]
        });
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await adminService.updateDoctor(editingDoctor.id, editForm);
            alert("Cập nhật thông tin và điều chuyển chuyên khoa thành công!");
            setEditingDoctor(null);
            loadData();
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Lỗi khi cập nhật");
        } finally {
            setIsUpdating(false);
        }
    };

    // Xử lý mở Dialog Cấp lại mật khẩu
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

    // Xóa bác sĩ
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

                {/* NÚT BẤM MỞ DIALOG CẤP TÀI KHOẢN BÁC SĨ MỚI */}
                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer"
                    >
                        <i className="fas fa-user-plus"></i> Cấp Tài Khoản Bác Sĩ Mới
                    </button>
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
                                                {formatCurrency(doc.pricePerAppointment || 200000)}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <div className="inline-flex items-center gap-1.5">
                                                {/* Nút Sửa / Phân khoa */}
                                                <button
                                                    onClick={() => handleOpenEdit(doc)}
                                                    className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                                                    title="Chỉnh sửa hồ sơ & đổi ảnh avatar"
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

            {/* ========================================================= */}
            {/* 1. DIALOG CẤP TÀI KHOẢN BÁC SĨ MỚI (CHỌN ẢNH TỪ THIẾT BỊ)  */}
            {/* ========================================================= */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] animate-fadeIn border border-slate-100">
                        {/* Header Dialog */}
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center text-lg shadow-sm">
                                    <i className="fas fa-user-plus"></i>
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-slate-900">Cấp Tài Khoản Bác Sĩ Mới</h3>
                                    <p className="text-xs text-slate-500 mt-0.5">Khởi tạo tài khoản hệ thống, phân chuyên khoa và cấp quyền đăng nhập Cổng Bác sĩ</p>
                                </div>
                            </div>
                            <button
                                onClick={handleCloseCreateModal}
                                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Nếu đã tạo thành công -> Hiện phiếu bàn giao tài khoản ngay trong dialog */}
                        {createdAccountInfo ? (
                            <div className="py-6 space-y-6">
                                <div className="text-center space-y-2">
                                    <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md shadow-emerald-500/20">
                                        <i className="fas fa-check"></i>
                                    </div>
                                    <h3 className="text-2xl font-black text-slate-900">Cấp Tài Khoản Thành Công!</h3>
                                    <p className="text-xs text-slate-500">
                                        Bác sĩ đã được đưa lên hệ thống. Hãy gửi thông tin đăng nhập bên dưới cho Bác sĩ:
                                    </p>
                                </div>

                                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-sans">
                                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                        <span className="text-slate-500 font-semibold">Bác sĩ:</span>
                                        <span className="font-bold text-slate-800">{createdAccountInfo.fullName}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                        <span className="text-slate-500 font-semibold">Chuyên khoa:</span>
                                        <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                                            {createdAccountInfo.specialtyName}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                        <span className="text-slate-500 font-semibold">Email đăng nhập:</span>
                                        <span className="font-mono font-bold text-slate-900">{createdAccountInfo.email}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                        <span className="text-slate-500 font-semibold">Mật khẩu ban đầu:</span>
                                        <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                                            {createdAccountInfo.password}
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-semibold">Cổng đăng nhập:</span>
                                        <span className="font-mono text-[11px] text-slate-600">{createdAccountInfo.loginUrl}</span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleCopyCredentials}
                                    className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                                        copySuccess
                                            ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                                            : 'bg-slate-900 hover:bg-black text-white shadow-slate-900/20'
                                    }`}
                                >
                                    <i className={`fas ${copySuccess ? 'fa-check' : 'fa-copy'}`}></i>
                                    {copySuccess ? 'Đã sao chép vào bộ nhớ tạm!' : 'Sao chép thông tin để gửi Bác sĩ'}
                                </button>

                                <div className="flex items-center gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setCreatedAccountInfo(null);
                                            setCreateFormData({
                                                ...initialFormData,
                                                specialtyId: specialties[0]?.id || '',
                                                password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000)
                                            });
                                        }}
                                        className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer text-center"
                                    >
                                        <i className="fas fa-plus mr-1"></i> Cấp thêm tài khoản khác
                                    </button>
                                    <button
                                        type="button"
                                        onClick={handleCloseCreateModal}
                                        className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer text-center shadow-sm"
                                    >
                                        Hoàn tất & Đóng dialog
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Form điền thông tin cấp tài khoản */
                            <form onSubmit={handleCreateDoctorSubmit} className="mt-5 space-y-5">
                                {/* KHU VỰC CHỌN ẢNH AVATAR TỪ MÁY TÍNH / THIẾT BỊ */}
                                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                        Ảnh Đại Diện Bác Sĩ (Tải lên từ thiết bị)
                                    </label>
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <div className="relative">
                                            <img
                                                src={createFormData.imageUrl || DEFAULT_AVATARS[0]}
                                                alt="Avatar Preview"
                                                className="w-20 h-20 rounded-2xl object-cover border-2 border-white shadow-md ring-2 ring-blue-500/20"
                                                onError={(e) => { e.target.src = DEFAULT_AVATARS[0]; }}
                                            />
                                            {isUploadingAvatar && (
                                                <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex items-center justify-center text-white text-xs">
                                                    <i className="fas fa-spinner fa-spin"></i>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-1.5 text-center sm:text-left flex-1">
                                            {/* Input file ẩn, kích hoạt qua nút bấm */}
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handleFileSelect}
                                                className="hidden"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploadingAvatar}
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
                                            >
                                                <i className="fas fa-upload text-blue-600"></i>
                                                {isUploadingAvatar ? 'Đang tải ảnh lên...' : 'Chọn ảnh từ máy tính / thiết bị'}
                                            </button>
                                            <p className="text-[11px] text-slate-400">
                                                Hỗ trợ file ảnh JPG, PNG, WEBP dung lượng tối đa 10MB.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin đăng nhập */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Email Đăng Nhập <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            placeholder="ví dụ: bs.long@klinik.vn"
                                            value={createFormData.email}
                                            onChange={(e) => setCreateFormData({ ...createFormData, email: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <label className="text-xs font-bold text-slate-700 uppercase">
                                                Mật Khẩu Khởi Tạo <span className="text-rose-500">*</span>
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => setCreateFormData(prev => ({ ...prev, password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000) }))}
                                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                            >
                                                <i className="fas fa-random mr-1"></i> Sinh mật khẩu
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <input
                                                type={showCreatePassword ? 'text' : 'password'}
                                                required
                                                value={createFormData.password}
                                                onChange={(e) => setCreateFormData({ ...createFormData, password: e.target.value })}
                                                className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowCreatePassword(!showCreatePassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                            >
                                                <i className={`fas ${showCreatePassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Thông tin định danh & Phân chuyên khoa */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Họ và Tên Bác Sĩ <span className="text-rose-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="VD: BS.CKII Lê Hoàng Long"
                                            value={createFormData.fullName}
                                            onChange={(e) => setCreateFormData({ ...createFormData, fullName: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Phân Chuyên Khoa <span className="text-rose-500">*</span>
                                        </label>
                                        <select
                                            value={createFormData.specialtyId}
                                            onChange={(e) => setCreateFormData({ ...createFormData, specialtyId: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        >
                                            {specialties.map(s => (
                                                <option key={s.id} value={s.id}>{s.specialtyName}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* Kinh nghiệm & Giá khám */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Số Điện Thoại
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="0901234567"
                                            value={createFormData.phoneNumber}
                                            onChange={(e) => setCreateFormData({ ...createFormData, phoneNumber: e.target.value })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Kinh Nghiệm (Năm)
                                        </label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="60"
                                            value={createFormData.experienceYears}
                                            onChange={(e) => setCreateFormData({ ...createFormData, experienceYears: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                            Giá Khám Mỗi Lượt (VND)
                                        </label>
                                        <input
                                            type="number"
                                            step="10000"
                                            min="0"
                                            value={createFormData.pricePerAppointment}
                                            onChange={(e) => setCreateFormData({ ...createFormData, pricePerAppointment: Number(e.target.value) })}
                                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                {/* Địa chỉ nơi khám */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Địa Chỉ Nơi Khám / Phòng Khám
                                    </label>
                                    <input
                                        type="text"
                                        value={createFormData.address}
                                        onChange={(e) => setCreateFormData({ ...createFormData, address: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    />
                                </div>

                                {/* Tiểu sử & Giới thiệu */}
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                        Tiểu Sử & Giới Thiệu Chuyên Môn
                                    </label>
                                    <textarea
                                        rows="2"
                                        placeholder="Tóm tắt quá trình đào tạo, chuyên môn sâu..."
                                        value={createFormData.bio}
                                        onChange={(e) => setCreateFormData({ ...createFormData, bio: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                    ></textarea>
                                </div>

                                {/* Nút bấm Submit form */}
                                <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={handleCloseCreateModal}
                                        className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isCreating}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition cursor-pointer disabled:opacity-50 flex items-center gap-2"
                                    >
                                        {isCreating ? (
                                            <>
                                                <i className="fas fa-spinner fa-spin"></i> Đang lưu...
                                            </>
                                        ) : (
                                            <>
                                                <i className="fas fa-check-circle"></i> Cấp Tài Khoản Bác Sĩ
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* ========================================================= */}
            {/* 2. DIALOG CHỈNH SỬA & ĐỔI CHUYÊN KHOA (CÓ UPLOAD ẢNH MỚI) */}
            {/* ========================================================= */}
            {editingDoctor && (
                <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] animate-fadeIn border border-slate-100">
                        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-bold text-slate-900">
                                    Chỉnh Sửa Hồ Sơ & Điều Chuyển Chuyên Khoa
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
                            {/* Đổi ảnh avatar từ thiết bị */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                                <img
                                    src={editForm.imageUrl || DEFAULT_AVATARS[0]}
                                    alt="Doctor Avatar"
                                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-blue-500/20"
                                    onError={(e) => { e.target.src = DEFAULT_AVATARS[0]; }}
                                />
                                <div className="space-y-1">
                                    <input
                                        type="file"
                                        ref={editFileInputRef}
                                        accept="image/*"
                                        onChange={handleEditFileSelect}
                                        className="hidden"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => editFileInputRef.current?.click()}
                                        disabled={isEditUploading}
                                        className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                                    >
                                        <i className="fas fa-camera text-blue-600"></i>
                                        {isEditUploading ? 'Đang tải...' : 'Đổi ảnh từ máy tính'}
                                    </button>
                                    <p className="text-[11px] text-slate-400">Chọn ảnh mới để cập nhật hồ sơ bác sĩ.</p>
                                </div>
                            </div>

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
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Điều Chuyển Chuyên Khoa *</label>
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
                                    rows="2"
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

            {/* ========================================================= */}
            {/* 3. DIALOG CẤP LẠI MẬT KHẨU (RESET PASSWORD)               */}
            {/* ========================================================= */}
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
