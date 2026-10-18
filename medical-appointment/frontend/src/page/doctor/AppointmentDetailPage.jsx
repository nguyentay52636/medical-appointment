
import { useState, useCallback, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const PRIMARY_COLOR = 'blue';

const getStatusStyles = (status) => {
    switch (status) {
        case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'completed': return 'bg-gray-100 text-gray-700 border-gray-300';
        case 'cancelled': return 'bg-gray-100 text-gray-700 border-gray-300';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'confirmed': return 'Đã Xác Nhận';
        case 'pending': return 'Chờ Duyệt';
        case 'completed': return 'Đã Khám';
        case 'cancelled': return 'Đã hủy';
        default: return 'Không rõ';
    }
};

function AppointmentDetail() {
    const params = useParams();
    const id = params.id;

    const [doctor, setDoctor] = useState( () => JSON.parse(sessionStorage.getItem("doctor")) || {});
    const [appointment, setAppointments]= useState(null);
    const [loading, setLoading]= useState(false);
    const [error, setError]= useState('');
    const [isProcessing, setIsProcessing]= useState(false);

    const fetchAppointmentDetail = useCallback(async () => {
        setLoading(true);
        setError('');
        try{
            const response = await axios.get(`http://localhost:8080/api/appointment/doctor/${doctor.id}/${id}`);
            setAppointments(response.data);
        }catch (e) {
            alert(`Lỗi khi xử lý: ${e.response?.data?.message || e.message}`);
        } finally {
            setIsProcessing(false);
        }
    }, [doctor, id]);

    useEffect(() => {
        fetchAppointmentDetail();
    }, [fetchAppointmentDetail]);


    const handleAction = async (actionType) => {
        setIsProcessing(true);
        try {
            // Ví dụ POST action lên backend
            await axios.post(`http://localhost:8080/api/doctor/${doctor.id}/appointments/${id}/action`, { action: actionType });
            alert(`Đã thực hiện hành động "${actionType}" thành công!`);
            fetchAppointmentDetail(); // refetch sau khi xử lý
        } catch (e) {
            alert(`Lỗi khi xử lý: ${e.response?.data?.message || e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (error) return (
        <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border border-red-200 rounded-md shadow-lg">
            Lỗi tải chi tiết: {error}
        </div>
    );
    if (!appointment) return ( 
        <div className={`text-center p-8 text-xl font-semibold text-${PRIMARY_COLOR}-600`}>
            <i className="fas fa-spinner fa-spin mr-2"></i> Đang tải chi tiết lịch hẹn...
        </div>
    );


    const isPending = appointment.status === 'pending';
    const isConfirmed = appointment.status === 'confirmed';
    const isCompleted = appointment.status === 'completed';
    const isRejected = appointment.status === 'cancelled';

    return (
        <div className="space-y-8">
            
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                    <i className={`fas fa-file-invoice text-${PRIMARY_COLOR}-600 mr-4`}></i>
                    Chi Tiết Lịch Hẹn <span className={`text-${PRIMARY_COLOR}-500 ml-2`}>#{appointment.id}</span>
                </h1>
                <Link to="/doctor/appointment" className={`text-${PRIMARY_COLOR}-600 hover:text-${PRIMARY_COLOR}-800 text-base font-medium transition-colors flex items-center`}>
                    <i className="fas fa-arrow-left mr-2"></i> Quay lại danh sách
                </Link>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                <div className="lg:col-span-2 space-y-6">
                    
                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
                        
                        <div className="flex justify-between items-start pb-4 border-b border-gray-100">
                            <div className="flex flex-col">
                                <span className="text-sm font-medium text-gray-500 mb-1 uppercase">Bệnh nhân</span>
                                <h2 className="text-3xl font-extrabold text-gray-900 leading-tight">
                                    {appointment.patientName}
                                </h2>
                            </div>
                            <span 
                                className={`px-4 py-2 text-base font-bold rounded-xl border-2 shadow-sm ${getStatusStyles(appointment.status)} flex-shrink-0`}
                            >
                                {getStatusText(appointment.status)}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 text-sm">
                            <DetailItem label="Mã KH" value={`KH-${appointment.id}`} icon="id-card" />
                            <DetailItem label="Điện thoại" value={appointment.patientPhone} icon="phone-alt" />
                            <DetailItem label="Email" value={appointment.patientEmail} icon="birthday-cake" />
                            <DetailItem label="Thời gian" value={appointment.time} icon="clock" />
                            <DetailItem label="Ngày hẹn" value={appointment.date} icon="calendar-day" />
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 space-y-6">
                        
                        <div>
                            <p className={`text-lg font-semibold text-${PRIMARY_COLOR}-600 mb-2 flex items-center`}>
                                <i className="fas fa-question-circle mr-2 text-xl"></i> Lý do Khám/Yêu cầu
                            </p>
                            <div className="text-base text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {appointment.reason || "Không rõ lý do."}
                            </div>
                        </div>

                        <div>
                            <p className={`text-lg font-semibold text-${PRIMARY_COLOR}-600 mb-2 flex items-center`}>
                                <i className="fas fa-clipboard-list mr-2 text-xl"></i> Ghi chú/Tiền sử bệnh án
                            </p>
                            <div className="text-base text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                {appointment.notes || "Không có ghi chú bệnh lý quan trọng."}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <ActionCard 
                        isCompleted={isCompleted} 
                        isConfirmed={isConfirmed} 
                        isPending={isPending} 
                        isProcessing={isProcessing} 
                        isRejected={isRejected}
                        handleAction={handleAction} 
                    />
                </div>

            </div>
        </div>
    );
}

const DetailItem = ({ label, value, icon }) => (
    <div>
        <p className="text-xs font-medium uppercase text-gray-500 mb-1 flex items-center">
            <i className={`fas fa-${icon} mr-2 text-${PRIMARY_COLOR}-400`}></i> {label}
        </p>
        <p className="text-lg font-bold text-gray-800">{value}</p>
    </div>
);

const ActionCard = ({ isCompleted, isConfirmed, isPending, isProcessing, isRejected, handleAction }) => (
    <div className={`bg-white p-6 rounded-2xl shadow-2xl border border-${PRIMARY_COLOR}-100`}>
        <h3 className={`text-2xl font-bold text-${PRIMARY_COLOR}-700 mb-4 border-b border-gray-100 pb-3`}>
            <i className="fas fa-cogs mr-2"></i> Tác vụ Quản lý
        </h3>

        {isCompleted &&  (
            <div className="text-center p-6 bg-gray-50 rounded-xl">
                <i className="fas fa-check-circle text-6xl text-emerald-500 mb-3"></i>
                <p className="text-xl font-bold text-gray-700">Lịch hẹn này đã hoàn tất.</p>
            </div>
        )}

        {isRejected && (
            <div className="text-center p-6 bg-red-50 rounded-xl">
                <i className="fas fa-times-circle text-6xl text-red-500 mb-3"></i>
                <p className="text-xl font-bold text-gray-700">Lịch hẹn này đã bị hủy.</p>
            </div>
        )}

        {!isCompleted && !isRejected &&(
            <div className="flex flex-col space-y-4">
                {isPending && (
                    <ActionButton
                        onClick={() => handleAction('confirm')}
                        color="bg-emerald-600 hover:bg-emerald-700"
                        label="Xác Nhận Lịch Hẹn"
                        icon="check-circle"
                        disabled={isProcessing}
                        isProcessing={isProcessing} 
                    />
                )}

                {isConfirmed && (
                    <ActionButton
                        onClick={() => handleAction('start')}
                        color="bg-blue-600 hover:bg-blue-700"
                        label={isProcessing ? 'Đang khởi tạo...' : 'Bắt Đầu Khám'}
                        icon="play"
                        disabled={isProcessing}
                        isProcessing={isProcessing} 
                    />
                )}
                
                <ActionButton
                    onClick={() => handleAction('reject')}
                    color="bg-red-500 hover:bg-red-600"
                    label="Hủy Lịch Hẹn"
                    icon="times-circle"
                    disabled={isProcessing}
                    isProcessing={isProcessing} 
                />
                
            </div>
        )}
    </div>
);


const ActionButton = ({ onClick, color, label, disabled, icon, isProcessing }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className={`${color} text-white px-5 py-3 rounded-xl text-lg font-semibold transition-all shadow-lg transform hover:scale-[1.01] flex items-center justify-center disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer`}
    >
        {isProcessing && label.includes('Đang') ? <i className="fas fa-spinner fa-spin mr-2"></i> : <i className={`fas fa-${icon} mr-2`}></i>}
        {label}
    </button>
);

export default AppointmentDetail;