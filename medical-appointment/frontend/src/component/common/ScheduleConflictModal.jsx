import React from 'react';
import { useNavigate } from 'react-router-dom';

/**
 * Hàm phân tích chuỗi lỗi xung đột từ backend thành cấu trúc dữ liệu rõ ràng
 */
export function parseScheduleConflict(errorMessage) {
    if (!errorMessage || typeof errorMessage !== 'string') return null;

    const clean = errorMessage.replace(/^Lỗi:\s*/i, '').trim();
    const marker = "vì đã có lịch hẹn trong khung giờ này:";
    const idx = clean.indexOf(marker);
    if (idx === -1) return null;

    const afterMarker = clean.substring(idx + marker.length);
    const endIdx = afterMarker.indexOf(". Bác sĩ không được xóa");
    const slotsPart = endIdx !== -1 ? afterMarker.substring(0, endIdx).trim() : afterMarker.trim();

    const rawSlots = slotsPart.split(";").map(s => s.trim()).filter(Boolean);
    const items = rawSlots.map(raw => {
        // Ví dụ: "27/11/2026 09:30-10:00 (đang chờ xác nhận)"
        const match = raw.match(/^(\d{2}\/\d{2}\/\d{4})\s+([\d:]+-[\d:]+)\s*\((.*?)\)$/);
        if (match) {
            return {
                date: match[1],
                time: match[2],
                status: match[3],
                raw
            };
        }
        return {
            date: "",
            time: "",
            status: "",
            raw
        };
    });

    return {
        title: "Không Thể Xóa Hoặc Thu Hẹp Lịch Làm Việc",
        description: "Khung giờ bạn vừa xóa hoặc thu hẹp đang có lịch hẹn của bệnh nhân đã đặt trước trên hệ thống.",
        items,
        totalConflicts: items.length
    };
}

export default function ScheduleConflictModal({
    isOpen,
    onClose,
    conflictData,
    onNavigateToAppointments
}) {
    const navigate = useNavigate();

    if (!isOpen || !conflictData) return null;

    const handleGoToAppointments = () => {
        if (onNavigateToAppointments) {
            onNavigateToAppointments();
        } else {
            navigate('/doctor/appointment');
        }
        onClose();
    };

    const items = conflictData.items || [];

    return (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fadeIn">
            <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp my-8">
                
                {/* Header Modal với Icon Cảnh Báo Sắc Nét */}
                <div className="px-6 py-5 bg-gradient-to-r from-rose-50 via-amber-50 to-white border-b border-rose-100 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center text-xl flex-shrink-0 shadow-inner">
                            <i className="fas fa-calendar-times"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                                    {conflictData.title || "Xung Đột Lịch Hẹn Đã Đặt"}
                                </h3>
                                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px] font-extrabold border border-rose-200">
                                    {conflictData.totalConflicts || items.length} ca bị ảnh hưởng
                                </span>
                            </div>
                            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                {conflictData.description || "Phát hiện lịch khám của bệnh nhân trong khung giờ bạn muốn chỉnh sửa."}
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-700 w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center transition cursor-pointer flex-shrink-0"
                    >
                        <i className="fas fa-times text-base"></i>
                    </button>
                </div>

                {/* Danh Sách Các Ca Khám Bị Xung Đột */}
                <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
                    <div>
                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                            <i className="fas fa-th-list text-rose-500"></i>
                            <span>Chi tiết các khung giờ đang có lịch hẹn:</span>
                        </div>

                        <div className="space-y-2.5">
                            {items.map((item, idx) => {
                                const isConfirmed = item.status?.toLowerCase().includes("đã xác nhận");
                                return (
                                    <div
                                        key={idx}
                                        className="p-3.5 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs hover:bg-white hover:border-slate-300 transition"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-white border border-slate-200 text-slate-600 flex items-center justify-center text-xs font-bold shadow-2xs">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 text-sm font-extrabold text-slate-900">
                                                    <i className="fas fa-calendar-day text-blue-600 text-xs"></i>
                                                    <span>{item.date || "Ngày khám"}</span>
                                                    <span className="text-slate-300">•</span>
                                                    <i className="fas fa-clock text-blue-600 text-xs"></i>
                                                    <span>{item.time || "Giờ khám"}</span>
                                                </div>
                                                <div className="text-[11px] text-slate-500 mt-0.5">
                                                    Khung giờ làm việc này đang có bệnh nhân đăng ký khám bệnh.
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex-shrink-0">
                                            {isConfirmed ? (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
                                                    <span>Đã xác nhận lịch</span>
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                                                    <span>Đang chờ duyệt</span>
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Hộp Hướng Dẫn & Khuyến Nghị */}
                    <div className="p-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/50 rounded-2xl border border-blue-100 text-xs text-blue-900 space-y-2">
                        <div className="font-bold flex items-center gap-1.5 text-blue-800">
                            <i className="fas fa-shield-alt text-blue-600"></i>
                            <span>Quy chế bảo vệ người bệnh & Giải pháp khắc phục:</span>
                        </div>
                        <p className="text-slate-600 leading-relaxed">
                            Để tránh ảnh hưởng tới bệnh nhân đã đăng ký khám, hệ thống không cho phép xóa các khung giờ đã có ca khám phát sinh.
                        </p>
                        <div className="space-y-1 text-slate-700 pt-1">
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-700">Cách 1:</span>
                                <span>Giữ lại khung giờ này trong danh sách lịch trực của bạn để tiếp tục phục vụ bệnh nhân.</span>
                            </div>
                            <div className="flex items-start gap-2">
                                <span className="font-bold text-blue-700">Cách 2:</span>
                                <span>Vào mục <strong>Quản lý Lịch hẹn</strong> để xử lý ca khám (liên hệ dời lịch khám hoặc từ chối lịch hẹn) trước khi xóa khung giờ này.</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Modal: Các nút thao tác */}
                <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full sm:w-auto px-5 py-2.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                        Đã Hiểu & Quay Lại Chỉnh Sửa
                    </button>

                    <button
                        onClick={handleGoToAppointments}
                        type="button"
                        className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <i className="fas fa-calendar-check"></i>
                        <span>Xem Quản Lý Lịch Hẹn</span>
                    </button>
                </div>

            </div>
        </div>
    );
}
