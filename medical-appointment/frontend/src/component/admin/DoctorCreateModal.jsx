import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import DoctorVoucherModal from './DoctorVoucherModal';

const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594824813681-424a6549c95d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=350&auto=format&fit=crop&q=80',
];

export default function DoctorCreateModal({ isOpen, onClose }) {
    const { specialties, createDoctor, uploadAvatar } = useAdmin();
    const fileInputRef = useRef(null);

    const [isCreating, setIsCreating] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
    const [createdAccountInfo, setCreatedAccountInfo] = useState(null);

    const initialFormData = {
        fullName: '',
        email: '',
        password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000),
        phoneNumber: '',
        specialtyId: specialties?.[0]?.id || '',
        experienceYears: 5,
        pricePerAppointment: 250000,
        address: '273 An Dương Vương, Phường 4, Quận 5, TP. HCM',
        bio: '',
        imageUrl: DEFAULT_AVATARS[0]
    };

    const [formData, setFormData] = useState(initialFormData);

    // Sync default specialty when specialties load
    useEffect(() => {
        if (specialties && specialties.length > 0 && !formData.specialtyId) {
            setFormData(prev => ({ ...prev, specialtyId: specialties[0].id }));
        }
    }, [specialties]);

    if (!isOpen) return null;

    // Handle local image upload from device
    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('Vui lòng chọn hình ảnh có dung lượng nhỏ hơn 10MB!');
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setFormData(prev => ({ ...prev, imageUrl: localPreview }));

        setIsUploadingAvatar(true);
        try {
            const res = await uploadAvatar(file);
            if (res && res.imageUrl) {
                setFormData(prev => ({ ...prev, imageUrl: res.imageUrl }));
            }
        } catch (err) {
            console.warn('Fallback sang đọc Base64 data URL:', err);
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploadingAvatar(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            alert('Vui lòng nhập họ tên bác sĩ');
            return;
        }
        if (!formData.email.trim()) {
            alert('Vui lòng nhập email đăng nhập');
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            alert('Mật khẩu khởi tạo phải từ 6 ký tự trở lên');
            return;
        }

        setIsCreating(true);
        try {
            await createDoctor(formData);
            const chosenSpec = specialties.find(s => s.id === Number(formData.specialtyId));

            setCreatedAccountInfo({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                specialtyName: chosenSpec?.specialtyName || 'Chuyên khoa chung',
                phoneNumber: formData.phoneNumber,
                loginUrl: window.location.origin + '/doctor/login'
            });
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Lỗi khi cấp tài khoản bác sĩ!');
        } finally {
            setIsCreating(false);
        }
    };

    const handleCloseModal = () => {
        setCreatedAccountInfo(null);
        setFormData({
            ...initialFormData,
            specialtyId: specialties?.[0]?.id || '',
            password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000)
        });
        onClose();
    };

    const handleResetForAnother = () => {
        setCreatedAccountInfo(null);
        setFormData({
            ...initialFormData,
            specialtyId: specialties?.[0]?.id || '',
            password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000)
        });
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] animate-fadeIn border border-slate-100">
                {/* Header Modal */}
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-user-plus"></i>
                        </span>
                        <div>
                            <h3 className="text-xl font-bold text-slate-900">Cấp Tài Khoản Bác Sĩ Mới</h3>
                            <p className="text-xs text-slate-500">Khởi tạo thông tin, chuyên khoa & tài khoản đăng nhập</p>
                        </div>
                    </div>
                    <button
                        onClick={handleCloseModal}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Body Content */}
                {createdAccountInfo ? (
                    <DoctorVoucherModal
                        accountInfo={createdAccountInfo}
                        onClose={handleCloseModal}
                        onResetForm={handleResetForAnother}
                    />
                ) : (
                    <form onSubmit={handleSubmit} className="mt-5 space-y-5">
                        {/* Avatar upload from device */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                                Ảnh Đại Diện Bác Sĩ (Tải lên từ thiết bị)
                            </label>
                            <div className="flex flex-col sm:flex-row items-center gap-4">
                                <div className="relative">
                                    <img
                                        src={formData.imageUrl || DEFAULT_AVATARS[0]}
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

                        {/* Account Credentials */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Email Đăng Nhập <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    required
                                    placeholder="ví dụ: bs.long@klinik.vn"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                                        onClick={() => setFormData(prev => ({
                                            ...prev,
                                            password: 'Klinik@' + Math.floor(100000 + Math.random() * 900000)
                                        }))}
                                        className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                                    >
                                        <i className="fas fa-random mr-1"></i> Sinh mật khẩu
                                    </button>
                                </div>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                                    >
                                        <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Họ và Tên Bác Sĩ <span className="text-rose-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="ví dụ: BS. CKII Nguyễn Văn Long"
                                    value={formData.fullName}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Phân Công Chuyên Khoa <span className="text-rose-500">*</span>
                                </label>
                                <select
                                    required
                                    value={formData.specialtyId}
                                    onChange={(e) => setFormData({ ...formData, specialtyId: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                >
                                    {specialties?.map((s) => (
                                        <option key={s.id} value={s.id}>
                                            {s.specialtyName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Số Điện Thoại
                                </label>
                                <input
                                    type="tel"
                                    placeholder="0901234567"
                                    value={formData.phoneNumber}
                                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
                                    max="50"
                                    value={formData.experienceYears}
                                    onChange={(e) => setFormData({ ...formData, experienceYears: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                    Giá Khám (VND)
                                </label>
                                <input
                                    type="number"
                                    min="50000"
                                    step="10000"
                                    value={formData.pricePerAppointment}
                                    onChange={(e) => setFormData({ ...formData, pricePerAppointment: Number(e.target.value) })}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Địa Chỉ Phòng Khám / Cơ Sở
                            </label>
                            <input
                                type="text"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Giới Thiệu Chuyên Môn / Học Vị
                            </label>
                            <textarea
                                rows="2"
                                placeholder="Tóm tắt quá trình công tác, thành tựu hoặc các chứng chỉ chuyên khoa..."
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                            ></textarea>
                        </div>

                        {/* Schedule Auto-Provisioning Notice */}
                        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-start gap-3">
                            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                                <i className="fas fa-calendar-check text-sm"></i>
                            </div>
                            <div className="text-xs text-emerald-800 leading-relaxed">
                                <span className="font-bold">Tự động cấu hình lịch khám chuẩn:</span> Khi cấp tài khoản, hệ thống sẽ kích hoạt ngay lịch làm việc chuẩn (Thứ 2 - Thứ 6: 08:00-11:30 & 13:30-17:00, 35h/tuần) để bệnh nhân có thể đặt lịch ngay. Bác sĩ có thể tự điều chỉnh lại trong cổng cá nhân.
                            </div>
                        </div>

                        {/* Modal Action Buttons */}
                        <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                            <button
                                type="button"
                                onClick={handleCloseModal}
                                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                            >
                                Hủy bỏ
                            </button>
                            <button
                                type="submit"
                                disabled={isCreating || isUploadingAvatar}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-500/20 transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
                            >
                                {isCreating ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Đang khởi tạo...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check"></i> Hoàn tất cấp tài khoản
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
