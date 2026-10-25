import React, { useState } from 'react';

export default function DoctorVoucherModal({ accountInfo, onClose, onResetForm }) {
    const [copySuccess, setCopySuccess] = useState(false);

    if (!accountInfo) return null;

    const handleCopy = () => {
        const text = `[KLINIK HEALTHCARE] THÔNG BÁO BÀN GIAO TÀI KHOẢN BÁC SĨ MỚI
──────────────────────────────────────
• Bác sĩ: ${accountInfo.fullName}
• Chuyên khoa phân công: ${accountInfo.specialtyName}
• Cổng đăng nhập Bác sĩ: ${accountInfo.loginUrl}
• Email đăng nhập: ${accountInfo.email}
• Mật khẩu khởi tạo: ${accountInfo.password}
──────────────────────────────────────
Ghi chú: Vui lòng đăng nhập và chủ động đổi lại mật khẩu cá nhân trong lần làm việc đầu tiên.`;

        navigator.clipboard.writeText(text).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        });
    };

    return (
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
                    <span className="font-bold text-slate-800">{accountInfo.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Chuyên khoa:</span>
                    <span className="font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">
                        {accountInfo.specialtyName}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Email đăng nhập:</span>
                    <span className="font-mono font-bold text-slate-900">{accountInfo.email}</span>
                </div>
                <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Mật khẩu ban đầu:</span>
                    <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                        {accountInfo.password}
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-semibold">Cổng đăng nhập:</span>
                    <span className="font-mono text-[11px] text-slate-600">{accountInfo.loginUrl}</span>
                </div>
            </div>

            <button
                type="button"
                onClick={handleCopy}
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
                    onClick={onResetForm}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer text-center"
                >
                    <i className="fas fa-plus mr-1"></i> Cấp thêm tài khoản khác
                </button>
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer text-center shadow-sm"
                >
                    Hoàn tất & Đóng dialog
                </button>
            </div>
        </div>
    );
}
