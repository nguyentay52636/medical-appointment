import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';

export default function DoctorResetPasswordModal({ doctor, onClose }) {
    const { resetDoctorPassword } = useAdmin();
    const [newPassword, setNewPassword] = useState('');
    const [isResetting, setIsResetting] = useState(false);
    const [resetSuccessMsg, setResetSuccessMsg] = useState('');

    useEffect(() => {
        if (doctor) {
            setNewPassword('Klinik@' + Math.floor(100000 + Math.random() * 900000));
            setResetSuccessMsg('');
        }
    }, [doctor]);

    if (!doctor) return null;

    const handleConfirm = async () => {
        if (!newPassword || newPassword.length < 6) {
            alert('Mật khẩu mới phải từ 6 ký tự trở lên');
            return;
        }

        setIsResetting(true);
        try {
            await resetDoctorPassword(doctor.id, newPassword);
            setResetSuccessMsg(`Đã đổi mật khẩu thành công sang: "${newPassword}". Vui lòng bàn giao cho bác sĩ!`);
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Lỗi khi cấp lại mật khẩu');
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5 animate-fadeIn border border-slate-100">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                        <span className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center text-sm">
                            <i className="fas fa-key"></i>
                        </span>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Cấp Lại Mật Khẩu</h3>
                            <p className="text-xs text-slate-500">{doctor.fullName}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
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
                            onClick={onClose}
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
                                onClick={onClose}
                                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer"
                            >
                                Hủy
                            </button>
                            <button
                                type="button"
                                disabled={isResetting}
                                onClick={handleConfirm}
                                className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs shadow-md transition cursor-pointer disabled:opacity-50"
                            >
                                {isResetting ? 'Đang đổi...' : 'Xác Nhận Đổi Mật Khẩu'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
