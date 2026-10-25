import React, { useState, useRef, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';

const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594824813681-424a6549c95d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=350&auto=format&fit=crop&q=80',
];

export default function DoctorEditModal({ doctor, onClose }) {
    const { specialties, updateDoctor, uploadAvatar } = useAdmin();
    const editFileInputRef = useRef(null);

    const [form, setForm] = useState({
        fullName: '',
        specialtyId: '',
        phoneNumber: '',
        experienceYears: 1,
        pricePerAppointment: 200000,
        address: '',
        bio: '',
        imageUrl: DEFAULT_AVATARS[0]
    });

    const [isUpdating, setIsUpdating] = useState(false);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        if (doctor) {
            setForm({
                fullName: doctor.fullName || '',
                specialtyId: doctor.specialtyId || (specialties[0]?.id || ''),
                phoneNumber: doctor.phoneNumber || '',
                experienceYears: doctor.experienceYears || 1,
                pricePerAppointment: doctor.pricePerAppointment || 200000,
                address: doctor.address || '',
                bio: doctor.bio || '',
                imageUrl: doctor.imageUrl || DEFAULT_AVATARS[0]
            });
        }
    }, [doctor, specialties]);

    if (!doctor) return null;

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            alert('Vui lòng chọn hình ảnh có dung lượng nhỏ hơn 10MB!');
            return;
        }

        const localPreview = URL.createObjectURL(file);
        setForm(prev => ({ ...prev, imageUrl: localPreview }));

        setIsUploading(true);
        try {
            const res = await uploadAvatar(file);
            if (res && res.imageUrl) {
                setForm(prev => ({ ...prev, imageUrl: res.imageUrl }));
            }
        } catch (err) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setForm(prev => ({ ...prev, imageUrl: reader.result }));
            };
            reader.readAsDataURL(file);
        } finally {
            setIsUploading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsUpdating(true);
        try {
            await updateDoctor(doctor.id, form);
            alert('Cập nhật thông tin và điều chuyển chuyên khoa thành công!');
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Lỗi khi cập nhật hồ sơ');
        } finally {
            setIsUpdating(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl overflow-y-auto max-h-[92vh] animate-fadeIn border border-slate-100">
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                    <div>
                        <h3 className="text-xl font-bold text-slate-900">
                            Chỉnh Sửa Hồ Sơ & Điều Chuyển Chuyên Khoa
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">Tài khoản: {doctor.email}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="mt-5 space-y-4">
                    {/* Avatar Upload */}
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-4">
                        <img
                            src={form.imageUrl || DEFAULT_AVATARS[0]}
                            alt="Doctor Avatar"
                            className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-sm ring-2 ring-blue-500/20"
                            onError={(e) => { e.target.src = DEFAULT_AVATARS[0]; }}
                        />
                        <div className="space-y-1">
                            <input
                                type="file"
                                ref={editFileInputRef}
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                            />
                            <button
                                type="button"
                                onClick={() => editFileInputRef.current?.click()}
                                disabled={isUploading}
                                className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer disabled:opacity-50"
                            >
                                <i className="fas fa-camera text-blue-600"></i>
                                {isUploading ? 'Đang tải ảnh...' : 'Đổi ảnh từ máy tính'}
                            </button>
                            <p className="text-[11px] text-slate-400">Chọn ảnh mới để cập nhật hồ sơ bác sĩ.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Họ và tên bác sĩ <span className="text-rose-500">*</span>
                            </label>
                            <input
                                type="text"
                                required
                                value={form.fullName}
                                onChange={(e) => setForm({ ...form, fullName: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
                                Điều Chuyển Chuyên Khoa <span className="text-rose-500">*</span>
                            </label>
                            <select
                                value={form.specialtyId}
                                onChange={(e) => setForm({ ...form, specialtyId: Number(e.target.value) })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                {specialties?.map(s => (
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
                                value={form.phoneNumber}
                                onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Kinh nghiệm (Năm)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.experienceYears}
                                onChange={(e) => setForm({ ...form, experienceYears: Number(e.target.value) })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Giá khám (VND)</label>
                            <input
                                type="number"
                                step="10000"
                                value={form.pricePerAppointment}
                                onChange={(e) => setForm({ ...form, pricePerAppointment: Number(e.target.value) })}
                                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Địa chỉ phòng khám</label>
                        <input
                            type="text"
                            value={form.address}
                            onChange={(e) => setForm({ ...form, address: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tiểu sử & Giới thiệu chuyên môn</label>
                        <textarea
                            rows="2"
                            value={form.bio}
                            onChange={(e) => setForm({ ...form, bio: e.target.value })}
                            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        ></textarea>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isUpdating || isUploading}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md transition cursor-pointer disabled:opacity-50"
                        >
                            {isUpdating ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
