import React, { useState, useEffect, useCallback } from 'react';
import { statisticService } from '../../service/statisticService';

// Định dạng tiền tệ VNĐ (ví dụ: 1.650.000 ₫)
const formatCurrency = (amount) => {
    if (amount === 0 || amount === null) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        minimumFractionDigits: 0,
    }).format(amount);
};

// Lấy văn bản và màu sắc cho trạng thái
const getStatusTextAndColor = (status) => {
    switch (status) {
        case 'completed':
            return { text: 'Đã khám', color: 'bg-gray-100 text-gray-700' };
        case 'cancelled':
            return { text: 'Đã hủy', color: 'bg-red-100 text-red-800' };
        case 'missed':
            return { text: 'Bỏ lỡ', color: 'bg-gray-100 text-gray-700 border-gray-300' };
        case 'pending':
            return { text: 'Chờ duyệt', color: 'bg-amber-100 text-amber-800' };
        case 'confirmed':
            return { text: 'Đã xác nhận', color: 'bg-emerald-100 text-emerald-800' };
        default:
            return { text: status, color: 'bg-gray-100 text-gray-600' };
    }
};

// ----------------------------------------------------------------------
//COMPONENT CHÍNH
// ----------------------------------------------------------------------

const DetailedReportTable = ({ primaryColor = 'blue' }) => { // Mặc định primaryColor là blue nếu không truyền

    // Lấy ngày hiện tại ở định dạng YYYY-MM-DD
    const today = new Date().toISOString().slice(0, 10);

    // Mặc định cả startDate và endDate là ngày hiện tại theo yêu cầu
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);

    // State cho dữ liệu API
    const [reportData, setReportData] = useState({ totalRevenue: 0, appointments: [] });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [doctor] = useState(() => JSON.parse(sessionStorage.getItem("doctor")) || {});
    // Lấy ID từ đối tượng doctor
    const doctorId = doctor.id ? parseInt(doctor.id) : null;


    //Hàm gọi API(Được bọc trong useCallback) 
    const fetchData = useCallback(async (start, end) => {
        if (!doctorId) {
            setError("Không thể tìm thấy ID bác sĩ.");
            setLoading(false);
            return; 
        }
        setLoading(true);
        setError(null);
        try {
            if (start > end) {
                setError("Ngày bắt đầu không thể lớn hơn ngày kết thúc.");
                setReportData({ totalRevenue: 0, appointments: [] });
                setLoading(false);
                return;
            }
            const data = await statisticService.getDetailedAppointmentReport(start, end,doctorId );
            setReportData(data); 
        } catch (err) {
            console.error("Lỗi khi tải báo cáo chi tiết:", err);
            setError("Không thể tải báo cáo chi tiết từ máy chủ.");
            setReportData({ totalRevenue: 0, appointments: [] });
        } finally {
            setLoading(false);
        }
    }, []);

    //useEffect: Gọi API khi ngày thay đổi
    useEffect(() => {
        fetchData(startDate, endDate);
    }, [startDate, endDate, fetchData]);

    //Hàm xử lý lọc ngày tháng
    const handleDateChange = (type, value) => {
        if (type === 'start') {
            setStartDate(value);
        } else {
            setEndDate(value);
        }
    };

    //Dữ liệu và Tổng Doanh Thu
    const data = reportData.appointments;
    const totalRevenue = reportData.totalRevenue;

    //Render chính
    return (
        <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100">
            {/*Header của Bảng Chi tiết: Chứa Tiêu đề và Bộ lọc*/}
            <div className="flex flex-wrap justify-between items-center border-b pb-2 mb-4">
                <h2 className="text-2xl font-bold text-gray-800 flex-shrink-0 mb-2 md:mb-0">
                    Bảng Dữ Liệu Chi Tiết Lịch Hẹn
                </h2>
                
                {/*Bộ lọc ngày(sử dụng statecuar component) */}
                <div className="flex items-center space-x-3 text-base">
                    <span className="font-semibold text-gray-700 flex-shrink-0">Từ ngày:</span>
                    <input
                        type="date"
                        value={startDate}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className={`p-2 border border-gray-300 rounded-lg font-semibold focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 transition duration-150 shadow-sm appearance-none cursor-pointer`}
                    />
                    <span className="font-semibold text-gray-700 flex-shrink-0">Đến ngày:</span>
                    <input
                        type="date"
                        value={endDate}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className={`p-2 border border-gray-300 rounded-lg font-semibold focus:ring-${primaryColor}-500 focus:border-${primaryColor}-500 transition duration-150 shadow-sm appearance-none cursor-pointer`}
                    />
                </div>
            </div>

            <p className="text-sm text-gray-500 mb-4">
                Hiển thị chi tiết các lịch hẹn trong khoảng thời gian đã chọn.
            </p>

            {/*Bảng và nội dung */}
            <div className="overflow-x-auto max-h-[600px] border-b border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MÃ LỊCH</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BỆNH NHÂN</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">NGÀY & GIỜ</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">CHI PHÍ (VNĐ)</th>
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">TRẠNG THÁI</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {/*Xử lý khi loading, error, dữ liệu rỗng*/}
                        {loading ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-12 text-center text-blue-600 font-semibold">Đang tải dữ liệu báo cáo...</td>
                            </tr>
                        ) : error ? (
                            <tr className="bg-red-50">
                                <td colSpan="5" className="px-6 py-8 text-center">
                                    <p className="text-lg font-bold text-red-700">Lỗi Tải Dữ Liệu</p>
                                    <p className="text-red-600">{error}</p>
                                </td>
                            </tr>
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="px-6 py-4 text-center text-gray-500 italic">
                                    Không có lịch hẹn nào trong khoảng thời gian này.
                                </td>
                            </tr>
                        ):(
                            data.map((item) => {
                                const statusInfo = getStatusTextAndColor(item.status);
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.appointmentCode || item.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-800">{item.patientName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {/* Dữ liệu dateTime đã là chuẩn dd/MM/yyyy HH:mm từ Backend */}
                                            {item.dateTime}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-right">
                                            {formatCurrency(item.price)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.color}`}>
                                                {statusInfo.text}
                                            </span>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/*Footer table */}
            <div className="flex justify-end p-4 bg-gray-50/50 rounded-b-xl border-t border-gray-200">
                <div className="text-right text-lg font-bold text-gray-800 w-full max-w-sm">
                    <span className="text-gray-600 mr-4">TỔNG DOANH THU:</span>
                    <span className={`text-${primaryColor}-600`}>
                        {formatCurrency(totalRevenue)}
                    </span>
                </div>
            </div>

        </div>
    );
};

export default DetailedReportTable;