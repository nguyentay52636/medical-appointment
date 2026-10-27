import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { reportService } from '../../service/reportService';

export default function BookingSuccessModal({ isOpen, appointment, onClose }) {
    const navigate = useNavigate();
    const [copied, setCopied] = useState(false);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

    if (!isOpen || !appointment) return null;

    const handleCopyCode = () => {
        if (appointment.appointmentCode) {
            navigator.clipboard.writeText(appointment.appointmentCode);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleDownloadPdf = async () => {
        const id = appointment.appointmentId || appointment.id;
        if (!id) {
            alert('Không tìm thấy ID lịch hẹn để in phiếu');
            return;
        }

        setIsDownloadingPdf(true);
        try {
            const blob = await reportService.downloadAppointment(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `Phieu_Kham_${appointment.appointmentCode || id}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Lỗi tải PDF:', err);
            alert('Không thể tạo file PDF lúc này. Bạn có thể in phiếu tại mục Lịch sử đặt lịch.');
        } finally {
            setIsDownloadingPdf(false);
        }
    };

    const handleGoToHistory = () => {
        onClose();
        navigate('/patient/booking-history');
    };

    const formatDateVi = (dateStr) => {
        if (!dateStr) return '';
        try {
            const d = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
            return d.toLocaleDateString('vi-VN', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-100 transform transition-all animate-scale-up">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6 text-white text-center relative">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
                        title="Đóng"
                    >
                        ✕
                    </button>
                    
                    <div className="w-16 h-16 mx-auto rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-3xl mb-3 shadow-inner border border-white/30">
                        <i className="fas fa-check"></i>
                    </div>

                    <h3 className="text-2xl font-black tracking-tight uppercase">
                        Đặt Lịch Khám Thành Công!
                    </h3>
                    <p className="text-xs text-emerald-100 mt-1 max-w-sm mx-auto">
                        Hệ thống Klinik đã ghi nhận và chuyển thông tin lịch hẹn đến Bác sĩ phụ trách.
                    </p>
                </div>

                {/* Content Body */}
                <div className="p-6 space-y-4">
                    {/* Appointment Code Card */}
                    <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
                        <div>
                            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 block">
                                Mã Lịch Hẹn
                            </span>
                            <span className="font-mono text-2xl font-black text-emerald-900 tracking-wide">
                                {appointment.appointmentCode || 'APT---'}
                            </span>
                        </div>

                        <button
                            type="button"
                            onClick={handleCopyCode}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                copied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-100'
                            }`}
                        >
                            <i className={`fas ${copied ? 'fa-check' : 'fa-copy'}`}></i>
                            {copied ? 'Đã chép mã!' : 'Sao chép mã'}
                        </button>
                    </div>

                    {/* Appointment Details Grid */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-700">
                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <i className="fas fa-user-md text-blue-600"></i> Bác sĩ phụ trách:
                            </span>
                            <span className="font-bold text-slate-900 text-sm">
                                {appointment.doctorName || 'Bác sĩ chuyên khoa'}
                            </span>
                        </div>

                        {appointment.specialtyName && (
                            <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                                <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                    <i className="fas fa-stethoscope text-indigo-600"></i> Chuyên khoa:
                                </span>
                                <span className="font-bold text-slate-800">
                                    {appointment.specialtyName}
                                </span>
                            </div>
                        )}

                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <i className="fas fa-calendar-alt text-amber-600"></i> Ngày khám:
                            </span>
                            <span className="font-bold text-slate-900">
                                {formatDateVi(appointment.slotDate)}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <i className="fas fa-clock text-teal-600"></i> Giờ khám:
                            </span>
                            <span className="font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded-md">
                                {appointment.startTime} — {appointment.endTime}
                            </span>
                        </div>

                        <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <i className="fas fa-credit-card text-purple-600"></i> Hình thức thanh toán:
                            </span>
                            <span className="font-bold text-slate-800">
                                {appointment.paymentMethod === 'online' ? 'Trực tuyến VNPay' : 'Thanh toán tại quầy lễ tân'}
                            </span>
                        </div>

                        <div className="flex justify-between items-center pt-1">
                            <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                                <i className="fas fa-money-bill-wave text-emerald-600"></i> Giá khám:
                            </span>
                            <span className="font-black text-rose-600 text-sm">
                                {Number(appointment.price || 0).toLocaleString('vi-VN')} đ
                            </span>
                        </div>
                    </div>

                    {/* Notice */}
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-900">
                        <i className="fas fa-info-circle text-amber-600 mt-0.5 shrink-0"></i>
                        <p>
                            Quý khách vui lòng có mặt tại <strong>Phòng khám Klinik (273 An Dương Vương, P.4, Q.5, TP.HCM)</strong> trước giờ khám 15 phút và cung cấp mã <strong>{appointment.appointmentCode}</strong> tại quầy lễ tân.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
                        <button
                            type="button"
                            onClick={handleGoToHistory}
                            className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 cursor-pointer"
                        >
                            <i className="fas fa-history"></i> Xem Lịch Sử Hẹn
                        </button>

                        <button
                            type="button"
                            onClick={handleDownloadPdf}
                            disabled={isDownloadingPdf}
                            className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            <i className={`fas ${isDownloadingPdf ? 'fa-spinner fa-spin' : 'fa-file-pdf'}`}></i>
                            {isDownloadingPdf ? 'Đang in...' : 'In Phiếu (PDF)'}
                        </button>

                        <button
                            type="button"
                            onClick={onClose}
                            className="py-2.5 px-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs transition cursor-pointer"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
