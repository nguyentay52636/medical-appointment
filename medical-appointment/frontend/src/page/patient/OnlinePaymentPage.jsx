import { useLocation } from "react-router-dom";

export default function OnlinePaymentPage() {
    const location = useLocation();
    const { formData, paymentUrl } = location.state || {};

    if (!formData || !paymentUrl) {
        return <p className="text-center mt-10 text-red-500 font-semibold">Không có thông tin thanh toán</p>;
    }

    const handlePayment = () => {
        window.location.href = paymentUrl; // redirect sang VNPay
    };

    const infoItem = (label, value, color = "text-gray-600") => (
        <div className="flex justify-between border-b py-3">
            <span className={`font-semibold ${color}`}>{label}</span>
            <span className="text-gray-800 font-medium">{value}</span>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-100 flex items-center justify-center p-6">
            <div className="bg-white shadow-2xl rounded-3xl max-w-3xl w-full p-8 md:p-12">
                <h2 className="text-3xl font-extrabold text-blue-700 mb-6 text-center">
                    Xác nhận thông tin & Thanh toán
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-10">
                    {infoItem("Họ và tên:", formData.fullName)}
                    {infoItem("Email:", formData.email)}
                    {infoItem("SĐT:", formData.phoneNumber)}
                    {infoItem(
                        "Ngày khám:",
                        formData.date ? new Date(formData.date).toLocaleDateString("vi-VN") : ""
                    )}
                    {infoItem("Chuyên khoa:", formData.specialtyName || "Chưa có")}
                    {infoItem("Bác sĩ:", formData.doctorName || "Chưa có")}
                    {formData.reason && infoItem("Lý do khám:", formData.reason)}
                    {formData.note && infoItem("Ghi chú:", formData.note)}
                    {infoItem("Phương thức thanh toán:", formData.paymentMethod === "online" && "Trực tuyến")}
                    {infoItem(
                        "Giá khám:",
                        `${(formData.price ?? 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" })}`,
                        "text-red-600 text-xl"
                    )}
                </div>

                <button
                    onClick={handlePayment}
                    className="mt-8 w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold py-3 px-8 rounded-2xl shadow-xl transform hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                >
                    THANH TOÁN NGAY
                </button>
            </div>
        </div>
    );
}
