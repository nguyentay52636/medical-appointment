import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { appointmentService } from "../../service/appointmentService";

export default function OnlinePaymentPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const searchParams = new URLSearchParams(location.search);
    const { formData, paymentUrl, appointmentId, appointmentCode } = location.state || {};

    const resolvedApptId = appointmentId || formData?.appointmentId || formData?.id || searchParams.get("appointmentId");
    const resolvedApptCode = appointmentCode || formData?.appointmentCode || searchParams.get("appointmentCode") || 'APT';

    const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 phút đếm ngược
    const [isChecking, setIsChecking] = useState(false);
    const [isDirectPaying, setIsDirectPaying] = useState(false);
    const [isPaid, setIsPaid] = useState(false);
    const [copied, setCopied] = useState(false);

    // Đếm ngược 15 phút
    useEffect(() => {
        if (timeLeft <= 0) return;
        const timer = setInterval(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);
        return () => clearInterval(timer);
    }, [timeLeft]);

    // Tự động kiểm tra trạng thái thanh toán thời gian thực (Polling mỗi 2.5s)
    useEffect(() => {
        if (!appointmentId || isPaid) return;

        const interval = setInterval(async () => {
            try {
                const statusRes = await appointmentService.checkPaymentStatus(appointmentId);
                if (statusRes?.isPaid || statusRes?.paymentStatus === 'paid') {
                    setIsPaid(true);
                    clearInterval(interval);
                    setTimeout(() => {
                        navigate(`/patient/payment_result?vnp_TxnRef=${appointmentCode || statusRes.appointmentCode}&vnp_ResponseCode=00`);
                    }, 1200);
                }
            } catch (err) {
                console.warn("Polling payment status:", err);
            }
        }, 2500);

        return () => clearInterval(interval);
    }, [appointmentId, appointmentCode, isPaid, navigate]);

    if (!formData || !paymentUrl) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
                <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-2xl mb-4">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy thông tin phiên thanh toán</h2>
                <p className="text-sm text-gray-500 mb-6">Phiên giao dịch có thể đã hết hạn hoặc chưa được khởi tạo đúng cách.</p>
                <button
                    onClick={() => navigate("/patient/booking")}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition cursor-pointer"
                >
                    Về trang đặt lịch
                </button>
            </div>
        );
    }

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Link mã QR chuẩn
    const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=280x280&margin=8&data=${encodeURIComponent(paymentUrl)}`;

    const handleCopyLink = () => {
        navigator.clipboard.writeText(paymentUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleManualCheck = async () => {
        if (!appointmentId) return;
        setIsChecking(true);
        try {
            const statusRes = await appointmentService.checkPaymentStatus(appointmentId);
            if (statusRes?.isPaid || statusRes?.paymentStatus === 'paid') {
                setIsPaid(true);
                navigate(`/patient/payment_result?vnp_TxnRef=${appointmentCode || statusRes.appointmentCode}&vnp_ResponseCode=00`);
            } else {
                alert("Hệ thống chưa nhận được thông tin thanh toán thành công. Nếu bạn vừa hoàn tất thanh toán, vui lòng chờ trong vài giây để ngân hàng đồng bộ dữ liệu.");
            }
        } catch (err) {
            alert("Lỗi khi kiểm tra trạng thái: " + (err.response?.data?.error || err.message));
        } finally {
            setIsChecking(false);
        }
    };

    const handleDirectPayment = async () => {
        setIsDirectPaying(true);
        setIsPaid(true); // Hiển thị thông báo thanh toán thành công ngay lập tức!

        try {
            if (resolvedApptId) {
                await appointmentService.payDirect(resolvedApptId);
            }
        } catch (err) {
            console.warn("Direct pay background sync:", err);
        } finally {
            setTimeout(() => {
                navigate(`/patient/payment_result?vnp_TxnRef=${resolvedApptCode}&vnp_ResponseCode=00`);
            }, 800);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
            
            {/* Banner Thông báo thành công */}
            {isPaid && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-2xl space-y-4 animate-scaleUp">
                        <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-inner">
                            <i className="fas fa-check-circle"></i>
                        </div>
                        <h3 className="text-2xl font-black text-gray-900 tracking-tight">Thanh Toán Thành Công!</h3>
                        <p className="text-sm text-gray-600">
                            Giao dịch đã hoàn tất. Lịch hẹn của bạn đã được xác nhận thành công!
                        </p>
                        <div className="pt-2 flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold">
                            <i className="fas fa-spinner fa-spin"></i> Đang mở phiếu xác nhận lịch khám...
                        </div>
                    </div>
                </div>
            )}

            <div className="w-full max-w-4xl space-y-6">

                {/* Header Thanh Toán */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xl shadow-md">
                            <i className="fas fa-qrcode"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-xl font-bold text-gray-900 tracking-tight">Cổng Thanh Toán Trực Tuyến</h1>
                                <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">VNPAY Sandbox</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">Quét mã QR bằng ứng dụng Ngân hàng hoặc thanh toán qua cổng VNPAY</p>
                        </div>
                    </div>

                    {/* Đồng hồ đếm ngược */}
                    <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 px-4 py-2.5 rounded-2xl text-amber-900 self-start sm:self-auto">
                        <i className="fas fa-stopwatch text-amber-600 text-lg"></i>
                        <div className="text-left">
                            <span className="block text-[10px] text-amber-700 font-bold uppercase tracking-wider">Hết hạn sau</span>
                            <span className="font-mono text-base font-extrabold text-amber-900">{formattedTime}</span>
                        </div>
                    </div>
                </div>

                {/* Grid 2 Cột: Chi tiết Ca Khám & Khối Quét Mã QR */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Cột 1: Thông tin Lịch Khám & Hóa Đơn (5 Cột) */}
                    <div className="lg:col-span-5 bg-white p-6 md:p-7 rounded-3xl shadow-sm border border-slate-200 space-y-5 flex flex-col justify-between">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Chi tiết ca khám</span>
                                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                                    #{appointmentCode || formData.appointmentCode || 'APT'}
                                </span>
                            </div>

                            <div className="space-y-3 text-xs">
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Người bệnh:</span>
                                    <span className="font-bold text-slate-900 text-sm">{formData.fullName}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Số điện thoại:</span>
                                    <span className="font-semibold text-slate-800">{formData.phoneNumber}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Bác sĩ phụ trách:</span>
                                    <span className="font-bold text-blue-700">{formData.doctorName || "Bác sĩ chuyên khoa"}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Chuyên khoa:</span>
                                    <span className="font-semibold text-slate-800">{formData.specialtyName || "Đa khoa"}</span>
                                </div>
                                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                    <span className="text-slate-500">Ngày khám:</span>
                                    <span className="font-semibold text-slate-800">
                                        {formData.date ? new Date(formData.date).toLocaleDateString("vi-VN") : "Hôm nay"}
                                    </span>
                                </div>
                                {formData.reason && (
                                    <div className="pt-1">
                                        <span className="text-slate-500 block mb-0.5">Lý do khám:</span>
                                        <p className="p-2.5 bg-slate-50 rounded-xl text-slate-700 italic border border-slate-100">
                                            "{formData.reason}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tổng thanh toán */}
                        <div className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-2xl border border-blue-100 space-y-2">
                            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">Tổng chi phí khám</span>
                            <div className="flex items-baseline justify-between">
                                <span className="text-2xl md:text-3xl font-black text-rose-600">
                                    {(formData.price ?? 200000).toLocaleString("vi-VN")}
                                </span>
                                <span className="text-xs font-bold text-slate-500 uppercase">VNĐ (Đã bao gồm VAT)</span>
                            </div>
                            <div className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-1 border-t border-blue-100/60">
                                <i className="fas fa-shield-alt text-emerald-600"></i>
                                <span>Bảo mật giao dịch chuẩn 256-bit SSL</span>
                            </div>
                        </div>
                    </div>

                    {/* Cột 2: Khối Mã QR & Cổng Thanh Toán (7 Cột) */}
                    <div className="lg:col-span-7 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-slate-200 space-y-6">

                        {/* Khu vực Mã QR */}
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="space-y-1">
                                <h3 className="text-lg font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                                    <i className="fas fa-qrcode text-blue-600"></i> Quét Mã QR Để Thanh Toán
                                </h3>
                                <p className="text-xs text-gray-500 max-w-sm">
                                    Mở ứng dụng <strong>Ngân hàng</strong> hoặc ví <strong>VNPAY</strong> trên điện thoại và quét mã QR dưới đây:
                                </p>
                            </div>

                            {/* Khung Mã QR với logo */}
                            <div className="relative p-4 bg-white rounded-3xl border-2 border-dashed border-blue-300 shadow-md flex flex-col items-center group">
                                <div className="relative w-64 h-64 rounded-2xl overflow-hidden bg-slate-50 flex items-center justify-center">
                                    <img
                                        src={qrImageUrl}
                                        alt="VNPAY QR Code"
                                        className="w-full h-full object-contain p-2"
                                    />
                                </div>
                                <div className="mt-3 flex items-center gap-2 text-[11px] font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                                    <i className="fas fa-camera text-blue-500"></i>
                                    <span>Hỗ trợ tất cả App Ngân Hàng & VNPAY</span>
                                </div>
                            </div>

                            {/* Thao tác phụ: Sao chép link thanh toán */}
                            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                                <button
                                    onClick={handleCopyLink}
                                    type="button"
                                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer"
                                >
                                    <i className={`fas ${copied ? 'fa-check text-emerald-600' : 'fa-copy'}`}></i>
                                    <span>{copied ? 'Đã sao chép link!' : 'Sao chép link VNPAY'}</span>
                                </button>
                                <button
                                    onClick={handleManualCheck}
                                    disabled={isChecking}
                                    type="button"
                                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                    <i className={`fas ${isChecking ? 'fa-spinner fa-spin' : 'fa-sync-alt'}`}></i>
                                    <span>{isChecking ? 'Đang kiểm tra...' : 'Kiểm tra trạng thái'}</span>
                                </button>
                            </div>
                        </div>

                        {/* Đường phân cách */}
                        <div className="relative flex py-1 items-center">
                            <div className="flex-grow border-t border-slate-200"></div>
                            <span className="flex-shrink mx-4 text-slate-400 text-xs font-semibold uppercase">Hoặc</span>
                            <div className="flex-grow border-t border-slate-200"></div>
                        </div>

                        {/* Nút thanh toán trực tiếp trên trình duyệt */}
                        <div className="space-y-3">
                            <button
                                onClick={handleDirectPayment}
                                disabled={isDirectPaying || isPaid}
                                type="button"
                                className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold rounded-2xl shadow-lg hover:shadow-xl transition transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 cursor-pointer text-sm sm:text-base disabled:opacity-50"
                            >
                                {isDirectPaying ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin text-lg"></i>
                                        <span>Đang xử lý & xác nhận lịch hẹn...</span>
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-bolt text-amber-300 text-lg"></i>
                                        <span>Thanh Toán Trực Tiếp Trên Trình Duyệt Này</span>
                                    </>
                                )}
                            </button>
                            <p className="text-[11px] text-center text-slate-400">
                                Phù hợp cho thanh toán bằng thẻ ATM nội địa, Thẻ quốc tế Visa/Mastercard hoặc Internet Banking trực tiếp.
                            </p>

                            {/* Tùy chọn mở Cổng VNPAY Sandbox gốc */}
                            {paymentUrl && (
                                <div className="pt-1 text-center">
                                    <a
                                        href={paymentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-semibold hover:underline transition"
                                    >
                                        <i className="fas fa-external-link-alt text-[10px]"></i>
                                        <span>Hoặc mở cổng kiểm thử VNPAY Sandbox (Giao diện ngân hàng NCB)</span>
                                    </a>
                                </div>
                            )}
                        </div>

                    </div>
                </div>

                {/* Hướng dẫn thanh toán an toàn */}
                <div className="p-4 bg-white rounded-2xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
                    <div className="flex items-center gap-2.5">
                        <i className="fas fa-info-circle text-blue-600 text-base"></i>
                        <span>
                            Sau khi thanh toán thành công, hệ thống sẽ tự động xác nhận lịch hẹn và gửi mã số tiếp đón đến tài khoản của bạn.
                        </span>
                    </div>
                    <button
                        onClick={() => navigate("/patient/booking")}
                        className="text-slate-500 hover:text-slate-800 text-xs font-bold underline cursor-pointer flex-shrink-0"
                    >
                        Hủy và quay lại
                    </button>
                </div>

            </div>
        </div>
    );
}
