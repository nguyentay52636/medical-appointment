import { useState, useCallback, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_ENDPOINT } from '../../config/apiConfig';
import { medicalRecordService } from '../../service/medicalRecordService';
import MedicalRecordModal from '../../component/common/MedicalRecordModal';

const PRIMARY_COLOR = 'blue';

const getStatusStyles = (status) => {
    switch (status) {
        case 'confirmed': return 'bg-emerald-100 text-emerald-800 border-emerald-300';
        case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
        default: return 'bg-gray-50 text-gray-600 border-gray-200';
    }
};

const getStatusText = (status) => {
    switch (status) {
        case 'confirmed': return 'Đã Xác Nhận';
        case 'pending': return 'Chờ Duyệt';
        case 'completed': return 'Đã Khám';
        case 'cancelled': return 'Đã Hủy';
        default: return 'Không rõ';
    }
};

// Thuốc mẫu gợi ý nhanh cho Bác Sĩ
const COMMON_MEDICINES = [
    { name: 'Paracetamol 500mg', quantity: '10', unit: 'viên', dosage: 'Sáng 1v, Chiều 1v', note: 'Uống sau ăn no khi sốt/đau' },
    { name: 'Amoxicillin 500mg', quantity: '14', unit: 'viên', dosage: 'Sáng 1v, Tối 1v', note: 'Kháng sinh uống liên tục 7 ngày' },
    { name: 'Omeprazole 20mg', quantity: '14', unit: 'viên', dosage: 'Sáng 1v trước ăn 30p', note: 'Giảm tiết axit dạ dày' },
    { name: 'Vitamin C 500mg', quantity: '20', unit: 'viên', dosage: 'Sáng 1v sau ăn', note: 'Tăng cường sức đề kháng' },
    { name: 'Alpha Choay', quantity: '20', unit: 'viên', dosage: 'Sáng 2v, Chiều 2v', note: 'Ngậm dưới lưỡi giảm viêm phù nề' },
    { name: 'Loratadine 10mg', quantity: '10', unit: 'viên', dosage: 'Tối 1v trước ngủ', note: 'Chống dị ứng, mẩn ngứa' }
];

function AppointmentDetail() {
    const params = useParams();
    const id = params.id;

    const [doctor] = useState(() => JSON.parse(sessionStorage.getItem("doctor")) || {});
    const [appointment, setAppointments] = useState(null);
    const [medicalRecord, setMedicalRecord] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showRecordModal, setShowRecordModal] = useState(false);

    // Form Khám bệnh State
    const [examForm, setExamForm] = useState({
        examinationType: 'Khám tổng quát',
        bloodPressure: '120/80',
        heartRate: '75',
        temperature: '37.0',
        weight: '65',
        height: '170',
        clinicalSymptoms: '',
        diagnosis: '',
        labResults: '',
        prescriptions: [
            { name: 'Paracetamol 500mg', quantity: '10', unit: 'viên', dosage: 'Sáng 1v, Chiều 1v sau ăn', note: 'Uống khi sốt hoặc đau' }
        ],
        doctorAdvice: 'Ăn uống đủ chất, uống nhiều nước ấm (2L/ngày), nghỉ ngơi hợp lý và tái khám khi có dấu hiệu bất thường.',
        followUpDate: ''
    });

    // Real-time BMI calculation
    const calculatedBmi = useMemo(() => {
        const w = parseFloat(examForm.weight);
        const h = parseFloat(examForm.height);
        if (!w || !h || h <= 0) return null;
        const hMeter = h / 100;
        return (w / (hMeter * hMeter)).toFixed(1);
    }, [examForm.weight, examForm.height]);

    const bmiCategory = useMemo(() => {
        if (!calculatedBmi) return null;
        const num = parseFloat(calculatedBmi);
        if (num < 18.5) return { label: 'Thiếu cân / Gầy', color: 'text-amber-600 bg-amber-50 border-amber-200' };
        if (num < 23.0) return { label: 'Bình thường (Chuẩn)', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
        if (num < 25.0) return { label: 'Tiền béo phì', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' };
        if (num < 30.0) return { label: 'Béo phì độ 1', color: 'text-orange-700 bg-orange-50 border-orange-200' };
        return { label: 'Béo phì độ 2+', color: 'text-red-700 bg-red-50 border-red-200' };
    }, [calculatedBmi]);

    const fetchAppointmentDetail = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get(`${API_ENDPOINT}/api/appointment/doctor/${doctor.id}/${id}`);
            const appt = response.data;
            setAppointments(appt);

            // Tự động điền triệu chứng ban đầu từ lý do khám của bệnh nhân
            if (appt.reason || appt.notes) {
                setExamForm(prev => ({
                    ...prev,
                    clinicalSymptoms: prev.clinicalSymptoms || [appt.reason, appt.notes].filter(Boolean).join(' - ')
                }));
            }

            // Kiểm tra xem đã có bệnh án chưa
            try {
                const recordRes = await medicalRecordService.getMedicalRecordByAppointment(id);
                if (recordRes?.success && recordRes?.data) {
                    const rec = recordRes.data;
                    setMedicalRecord(rec);

                    // Điền dữ liệu đã lưu vào form
                    let parsedPrescriptions = [];
                    if (rec.prescriptions) {
                        try {
                            parsedPrescriptions = typeof rec.prescriptions === 'string'
                                ? JSON.parse(rec.prescriptions)
                                : rec.prescriptions;
                        } catch {
                            parsedPrescriptions = [{ name: rec.prescriptions, quantity: '1', unit: 'liều', dosage: '', note: '' }];
                        }
                    }

                    setExamForm({
                        examinationType: rec.examinationType || 'Khám tổng quát',
                        bloodPressure: rec.bloodPressure || '120/80',
                        heartRate: rec.heartRate ? String(rec.heartRate) : '75',
                        temperature: rec.temperature ? String(rec.temperature) : '37.0',
                        weight: rec.weight ? String(rec.weight) : '65',
                        height: rec.height ? String(rec.height) : '170',
                        clinicalSymptoms: rec.clinicalSymptoms || '',
                        diagnosis: rec.diagnosis || '',
                        labResults: rec.labResults || '',
                        prescriptions: Array.isArray(parsedPrescriptions) && parsedPrescriptions.length > 0 ? parsedPrescriptions : [],
                        doctorAdvice: rec.doctorAdvice || '',
                        followUpDate: rec.followUpDate || ''
                    });
                }
            } catch {
                // Chưa có hồ sơ bệnh án, không sao
            }
        } catch (e) {
            setError(e.response?.data?.message || e.message);
        } finally {
            setLoading(false);
            setIsProcessing(false);
        }
    }, [doctor, id]);

    useEffect(() => {
        fetchAppointmentDetail();
    }, [fetchAppointmentDetail]);

    // Thao tác chuyển đổi trạng thái cơ bản (xác nhận, hủy)
    const handleAction = async (actionType) => {
        setIsProcessing(true);
        try {
            await axios.post(`${API_ENDPOINT}/api/doctor/${doctor.id}/appointments/${id}/action`, { action: actionType });
            alert(`Đã thực hiện thao tác "${actionType}" thành công!`);
            fetchAppointmentDetail();
        } catch (e) {
            alert(`Lỗi khi xử lý: ${e.response?.data?.message || e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    // Quản lý toa thuốc
    const handleAddPrescription = () => {
        setExamForm(prev => ({
            ...prev,
            prescriptions: [
                ...prev.prescriptions,
                { name: '', quantity: '10', unit: 'viên', dosage: 'Sáng 1v, Chiều 1v sau ăn', note: '' }
            ]
        }));
    };

    const handleRemovePrescription = (index) => {
        setExamForm(prev => ({
            ...prev,
            prescriptions: prev.prescriptions.filter((_, i) => i !== index)
        }));
    };

    const handlePrescriptionChange = (index, field, value) => {
        setExamForm(prev => {
            const updated = [...prev.prescriptions];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, prescriptions: updated };
        });
    };

    const handleAddQuickMed = (med) => {
        setExamForm(prev => ({
            ...prev,
            prescriptions: [...prev.prescriptions, { ...med }]
        }));
    };

    // Lưu Hồ Sơ Bệnh Án & Hoàn Thành Ca Khám
    const handleSaveMedicalRecord = async (status = 'completed') => {
        if (!examForm.diagnosis?.trim()) {
            alert('Vui lòng nhập Kết luận Chẩn đoán bệnh trước khi hoàn thành ca khám!');
            return;
        }

        setIsProcessing(true);
        try {
            const payload = {
                id: medicalRecord?.id || null,
                appointmentId: Number(id),
                patientId: appointment.patientId,
                doctorId: doctor.id,
                examinationType: examForm.examinationType,
                status: status,
                bloodPressure: examForm.bloodPressure,
                heartRate: examForm.heartRate ? parseInt(examForm.heartRate) : null,
                temperature: examForm.temperature ? parseFloat(examForm.temperature) : null,
                weight: examForm.weight ? parseFloat(examForm.weight) : null,
                height: examForm.height ? parseFloat(examForm.height) : null,
                clinicalSymptoms: examForm.clinicalSymptoms,
                diagnosis: examForm.diagnosis,
                labResults: examForm.labResults,
                prescriptions: JSON.stringify(examForm.prescriptions),
                doctorAdvice: examForm.doctorAdvice,
                followUpDate: examForm.followUpDate || null
            };

            const response = await medicalRecordService.saveMedicalRecord(payload);
            if (response.success) {
                alert(status === 'completed' 
                    ? '🎉 Đã hoàn thành ca khám và lưu hồ sơ bệnh án thành công!' 
                    : 'Đã lưu nháp hồ sơ bệnh án thành công!');
                setMedicalRecord(response.data);
                // Reload lại chi tiết lịch hẹn
                fetchAppointmentDetail();
            } else {
                alert(response.message || 'Lỗi khi lưu bệnh án');
            }
        } catch (e) {
            console.error(e);
            alert(`Lỗi khi lưu bệnh án: ${e.response?.data?.message || e.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    if (error) return (
        <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border border-red-200 rounded-2xl shadow-lg m-6">
            <i className="fas fa-exclamation-triangle mr-2"></i> Lỗi tải chi tiết: {error}
        </div>
    );

    if (loading || !appointment) return (
        <div className={`text-center p-12 text-xl font-semibold text-blue-600`}>
            <i className="fas fa-circle-notch fa-spin mr-3 text-3xl"></i> Đang tải chi tiết ca khám...
        </div>
    );

    const isPending = appointment.status === 'pending';
    const isConfirmed = appointment.status === 'confirmed';
    const isCompleted = appointment.status === 'completed';
    const isCancelled = appointment.status === 'cancelled';

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-16 px-4 sm:px-6">
            
            {/* Top Navigation & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5 pt-2">
                <div>
                    <div className="flex items-center gap-3">
                        <Link to="/doctor/appointment" className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center transition cursor-pointer">
                            <i className="fas fa-arrow-left"></i>
                        </Link>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                                Ca Khám Bệnh <span className="text-blue-600 font-mono">#{appointment.appointmentCode || appointment.id}</span>
                            </h1>
                            <p className="text-xs md:text-sm text-gray-500 font-medium">
                                Ngày hẹn: {appointment.date} | Giờ khám: {appointment.time} - {appointment.endTime || 'Kết thúc'}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 text-sm font-extrabold rounded-xl border shadow-xs ${getStatusStyles(appointment.status)}`}>
                        <i className={`fas fa-${isCompleted ? 'check-double' : isConfirmed ? 'user-clock' : isPending ? 'hourglass-half' : 'times'} mr-1.5`}></i>
                        {getStatusText(appointment.status)}
                    </span>

                    {/* Nút Xem Hồ sơ bệnh án nếu đã có */}
                    {medicalRecord && (
                        <button
                            type="button"
                            onClick={() => setShowRecordModal(true)}
                            className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition flex items-center gap-2 cursor-pointer"
                        >
                            <i className="fas fa-file-prescription"></i>
                            <span>Xem & In Bệnh Án</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Grid 2 Cột: Thông tin Bệnh Nhân & Thao Tác Nhanh */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Cột 1 & 2: Thông tin Bệnh Nhân & Lịch Hẹn */}
                <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                    <div className="flex items-start justify-between border-b border-gray-100 pb-4">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-md">
                                {appointment.patientName?.charAt(0) || "BN"}
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Hồ sơ bệnh nhân</span>
                                <h2 className="text-2xl font-black text-gray-900">{appointment.patientName}</h2>
                                <p className="text-xs text-gray-500 font-mono">Mã BN: BN-{appointment.patientId || appointment.id}</p>
                            </div>
                        </div>

                        <div className="text-right">
                            <span className="text-xs text-gray-400 block">Hình thức thanh toán</span>
                            <span className="text-sm font-bold text-gray-800 uppercase">
                                {appointment.paymentMethod === 'online' ? '💳 Đã TT Online' : '💵 Thanh toán tại quầy'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block mb-1">Số điện thoại</span>
                            <p className="font-bold text-gray-900 text-sm">{appointment.patientPhone || "Chưa cập nhật"}</p>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block mb-1">Email liên hệ</span>
                            <p className="font-bold text-gray-900 text-sm truncate" title={appointment.patientEmail}>{appointment.patientEmail || "Chưa có"}</p>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block mb-1">Ngày khám</span>
                            <p className="font-bold text-gray-900 text-sm">{appointment.date}</p>
                        </div>
                        <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-100">
                            <span className="text-gray-400 font-semibold block mb-1">Khung giờ</span>
                            <p className="font-bold text-gray-900 text-sm">{appointment.time}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                        <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <span className="font-bold text-blue-900 uppercase block mb-1 flex items-center gap-1.5">
                                <i className="fas fa-question-circle text-blue-600"></i> Lý do khám / Yêu cầu từ bệnh nhân:
                            </span>
                            <p className="text-gray-800 leading-relaxed text-sm">
                                {appointment.reason || "Khám sức khỏe tổng quát theo lịch hẹn."}
                            </p>
                        </div>
                        <div className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                            <span className="font-bold text-indigo-900 uppercase block mb-1 flex items-center gap-1.5">
                                <i className="fas fa-history text-indigo-600"></i> Tiền sử bệnh lý / Ghi chú ban đầu:
                            </span>
                            <p className="text-gray-800 leading-relaxed text-sm">
                                {appointment.notes || "Chưa ghi nhận tiền sử dị ứng hoặc bệnh nền đặc biệt."}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Cột 3: Quản lý trạng thái */}
                <div className="lg:col-span-1 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex flex-col justify-between space-y-6">
                    <div>
                        <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                            <i className="fas fa-sliders-h text-blue-600"></i> Tiến Trình Ca Khám
                        </h3>
                        <p className="text-xs text-gray-500 leading-relaxed mb-4">
                            Quản lý duyệt lịch hẹn, tiếp nhận bệnh nhân vào phòng khám và hoàn tất ca khám.
                        </p>

                        <div className="space-y-3">
                            {isPending && (
                                <button
                                    onClick={() => handleAction('confirm')}
                                    disabled={isProcessing}
                                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-sm shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <i className="fas fa-check-circle"></i>
                                    <span>Xác Nhận Lịch Hẹn</span>
                                </button>
                            )}

                            {isConfirmed && !medicalRecord && (
                                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs space-y-2">
                                    <div className="flex items-center gap-2 font-bold text-sm text-emerald-800">
                                        <i className="fas fa-stethoscope text-base"></i> Bệnh nhân đã sẵn sàng khám
                                    </div>
                                    <p>Vui lòng tiến hành đo sinh hiệu, khám lâm sàng và kê đơn thuốc bên dưới.</p>
                                </div>
                            )}

                            {isCompleted && (
                                <div className="p-5 bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                                    <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-xl">
                                        <i className="fas fa-check-double"></i>
                                    </div>
                                    <p className="font-black text-gray-900 text-base">Ca Khám Đã Hoàn Tất</p>
                                    <p className="text-xs text-gray-600">Hồ sơ bệnh án điện tử đã được ghi nhận vào hệ thống.</p>
                                    <button
                                        onClick={() => setShowRecordModal(true)}
                                        className="mt-2 w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition cursor-pointer"
                                    >
                                        Xem Chi Tiết Bệnh Án
                                    </button>
                                </div>
                            )}

                            {!isCompleted && !isCancelled && (
                                <button
                                    onClick={() => handleAction('reject')}
                                    disabled={isProcessing}
                                    className="w-full py-2.5 px-4 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-2xl font-semibold text-xs transition border border-gray-200 cursor-pointer disabled:opacity-50"
                                >
                                    <i className="fas fa-times-circle mr-1.5"></i> Hủy / Báo Bệnh Nhân Vắng Mặt
                                </button>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-gray-100 text-center">
                        <span className="text-[11px] text-gray-400">Bác sĩ phụ trách: {doctor.fullName || "Bác sĩ"}</span>
                    </div>
                </div>
            </div>

            {/* PHÂN HỆ KHÁM BỆNH & LẬP BỆNH ÁN (MEDICAL EXAMINATION SUITE) */}
            {!isCancelled && (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden">
                    
                    {/* Header Phân Hệ Khám */}
                    <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-600 p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl shadow-inner">
                                <i className="fas fa-notes-medical"></i>
                            </div>
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Hồ Sơ Khám Bệnh & Kê Đơn Thuốc</h2>
                                <p className="text-xs text-blue-100">
                                    Thực hiện quy trình khám bệnh toàn diện, ghi nhận sinh hiệu và phác đồ điều trị
                                </p>
                            </div>
                        </div>

                        {/* Chọn Loại Khám: Khám Tổng Quát vs Khám Chuyên Khoa */}
                        <div className="flex items-center bg-white/15 p-1 rounded-2xl backdrop-blur-md border border-white/25">
                            <button
                                type="button"
                                onClick={() => setExamForm(prev => ({ ...prev, examinationType: 'Khám tổng quát' }))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    examForm.examinationType === 'Khám tổng quát'
                                        ? 'bg-white text-blue-800 shadow-md'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <i className="fas fa-heartbeat"></i>
                                <span>Khám Tổng Quát</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setExamForm(prev => ({ ...prev, examinationType: 'Khám chuyên khoa' }))}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                                    examForm.examinationType === 'Khám chuyên khoa'
                                        ? 'bg-white text-blue-800 shadow-md'
                                        : 'text-white hover:bg-white/10'
                                }`}
                            >
                                <i className="fas fa-stethoscope"></i>
                                <span>Khám Chuyên Khoa</span>
                            </button>
                        </div>
                    </div>

                    {/* Nội dung Form Khám Bệnh */}
                    <div className="p-6 md:p-8 space-y-8">
                        
                        {/* BƯỚC 1: SINH HIỆU & KHÁM LÂM SÀNG */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">1</span>
                                    Chỉ Số Sinh Hiệu & Triệu Chứng Khám Lâm Sàng
                                </h3>
                                {calculatedBmi && (
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bmiCategory?.color}`}>
                                        BMI: {calculatedBmi} ({bmiCategory?.label})
                                    </span>
                                )}
                            </div>

                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                {/* Huyết áp */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                        Huyết áp (mmHg)
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="Ví dụ: 120/80"
                                        value={examForm.bloodPressure}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, bloodPressure: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-rose-600 focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Nhịp tim */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                        Mạch / Tim (lần/p)
                                    </label>
                                    <input
                                        type="number"
                                        placeholder="75"
                                        value={examForm.heartRate}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, heartRate: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-rose-500 focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Thân nhiệt */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                        Thân nhiệt (°C)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        placeholder="37.0"
                                        value={examForm.temperature}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, temperature: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-amber-600 focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Cân nặng */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                        Cân nặng (kg)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.5"
                                        placeholder="65"
                                        value={examForm.weight}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, weight: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Chiều cao */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                        Chiều cao (cm)
                                    </label>
                                    <input
                                        type="number"
                                        step="1"
                                        placeholder="170"
                                        value={examForm.height}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, height: e.target.value }))}
                                        className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 font-bold text-indigo-600 focus:ring-2 focus:ring-blue-500 text-sm"
                                    />
                                </div>

                                {/* Chỉ số BMI tự động */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1">
                                        Chỉ số BMI
                                    </label>
                                    <div className="px-3.5 py-2.5 rounded-xl bg-gray-100 border border-gray-200 text-teal-700 font-black text-sm flex items-center justify-between">
                                        <span>{calculatedBmi || '--'}</span>
                                        <span className="text-[10px] text-gray-400 font-normal">kg/m²</span>
                                    </div>
                                </div>
                            </div>

                            {/* Triệu chứng lâm sàng */}
                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Triệu chứng & Khám thực thể lâm sàng
                                </label>
                                <textarea
                                    rows="3"
                                    placeholder="Ghi nhận triệu chứng cơ năng & thực thể: ho, tức ngực, đau họng, niêm mạc hồng hào, tim phổi đều..."
                                    value={examForm.clinicalSymptoms}
                                    onChange={(e) => setExamForm(prev => ({ ...prev, clinicalSymptoms: e.target.value }))}
                                    className="w-full p-3.5 rounded-2xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>

                        {/* BƯỚC 2: KẾT QUẢ CẬN LÂM SÀNG & CHẨN ĐOÁN */}
                        <div className="space-y-4">
                            <div className="border-b border-gray-100 pb-3">
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">2</span>
                                    Kết Quả Cận Lâm Sàng & Kết Luận Chẩn Đoán
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Kết quả Xét nghiệm / X-Quang / Cận lâm sàng (nếu có)
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Công thức máu bình thường, X-quang phổi chưa phát hiện tổn thương, Siêu âm bụng tổng quát..."
                                        value={examForm.labResults}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, labResults: e.target.value }))}
                                        className="w-full p-3.5 rounded-2xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1 flex items-center justify-between">
                                        <span>Kết luận Chẩn đoán y khoa <span className="text-red-500">*</span></span>
                                        <span className="text-[11px] text-blue-600 lowercase font-normal">Bắt buộc</span>
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Ví dụ: Viêm họng cấp / Theo dõi hội chứng trào ngược dạ dày thực quản / Thể lực bình thường"
                                        value={examForm.diagnosis}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, diagnosis: e.target.value }))}
                                        className="w-full p-3.5 rounded-2xl border-2 border-blue-300 text-sm font-semibold text-blue-950 focus:ring-2 focus:ring-blue-500 bg-blue-50/20"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* BƯỚC 3: TOA THUỐC ĐIỀU TRỊ */}
                        <div className="space-y-4">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                                <div>
                                    <h3 className="text-base font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                        <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs font-black">3</span>
                                        Kê Đơn Thuốc Điều Trị
                                    </h3>
                                    <p className="text-xs text-gray-500">Kê toa thuốc chi tiết cho bệnh nhân hoặc chọn nhanh từ danh mục mẫu</p>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleAddPrescription}
                                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer self-start sm:self-auto"
                                >
                                    <i className="fas fa-plus"></i>
                                    <span>Thêm Thuốc Mới</span>
                                </button>
                            </div>

                            {/* Gợi ý chọn nhanh thuốc thông dụng */}
                            <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200/80">
                                <span className="text-[11px] font-bold text-gray-600 uppercase block mb-2 flex items-center gap-1">
                                    <i className="fas fa-bolt text-amber-500"></i> Chọn nhanh thuốc thông dụng:
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {COMMON_MEDICINES.map((med, idx) => (
                                        <button
                                            key={idx}
                                            type="button"
                                            onClick={() => handleAddQuickMed(med)}
                                            className="px-3 py-1.5 bg-white hover:bg-emerald-50 text-gray-800 hover:text-emerald-800 border border-gray-200 hover:border-emerald-300 rounded-lg text-xs font-medium transition shadow-2xs flex items-center gap-1.5 cursor-pointer"
                                        >
                                            <i className="fas fa-pills text-emerald-500"></i>
                                            <span>{med.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Bảng danh sách thuốc kê đơn */}
                            {examForm.prescriptions.length === 0 ? (
                                <div className="p-6 bg-gray-50 border border-dashed border-gray-300 rounded-2xl text-center text-gray-500 text-xs">
                                    Chưa có thuốc nào trong đơn. Bấm nút "Thêm Thuốc Mới" hoặc chọn thuốc mẫu ở trên.
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {examForm.prescriptions.map((med, idx) => (
                                        <div key={idx} className="p-4 bg-gray-50/80 rounded-2xl border border-gray-200 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                                            <div className="md:col-span-4">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Tên thuốc & Hàm lượng</label>
                                                <input
                                                    type="text"
                                                    placeholder="Tên thuốc..."
                                                    value={med.name}
                                                    onChange={(e) => handlePrescriptionChange(idx, 'name', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs font-bold text-gray-900"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Số lượng / Đơn vị</label>
                                                <div className="flex gap-1.5">
                                                    <input
                                                        type="text"
                                                        placeholder="SL"
                                                        value={med.quantity}
                                                        onChange={(e) => handlePrescriptionChange(idx, 'quantity', e.target.value)}
                                                        className="w-16 px-2.5 py-2 bg-white rounded-xl border border-gray-300 text-xs font-semibold text-center"
                                                    />
                                                    <input
                                                        type="text"
                                                        placeholder="viên/chai"
                                                        value={med.unit}
                                                        onChange={(e) => handlePrescriptionChange(idx, 'unit', e.target.value)}
                                                        className="w-full px-2.5 py-2 bg-white rounded-xl border border-gray-300 text-xs"
                                                    />
                                                </div>
                                            </div>

                                            <div className="md:col-span-3">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Liều dùng & Cách uống</label>
                                                <input
                                                    type="text"
                                                    placeholder="Sáng 1v, Chiều 1v sau ăn"
                                                    value={med.dosage}
                                                    onChange={(e) => handlePrescriptionChange(idx, 'dosage', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs"
                                                />
                                            </div>

                                            <div className="md:col-span-2">
                                                <label className="block text-[11px] font-bold text-gray-500 uppercase mb-1">Ghi chú thêm</label>
                                                <input
                                                    type="text"
                                                    placeholder="Uống sau ăn no"
                                                    value={med.note}
                                                    onChange={(e) => handlePrescriptionChange(idx, 'note', e.target.value)}
                                                    className="w-full px-3 py-2 bg-white rounded-xl border border-gray-300 text-xs"
                                                />
                                            </div>

                                            <div className="md:col-span-1 flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemovePrescription(idx)}
                                                    className="w-9 h-9 rounded-xl bg-red-100 hover:bg-red-200 text-red-600 flex items-center justify-center transition cursor-pointer mt-4 md:mt-0"
                                                    title="Xóa thuốc"
                                                >
                                                    <i className="fas fa-trash-alt text-xs"></i>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* BƯỚC 4: LỜI DẶN DÒ & HẸN TÁI KHÁM */}
                        <div className="space-y-4">
                            <div className="border-b border-gray-100 pb-3">
                                <h3 className="text-base font-black text-gray-900 uppercase tracking-wide flex items-center gap-2">
                                    <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-black">4</span>
                                    Lời Dặn Của Bác Sĩ & Hẹn Tái Khám
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Lời dặn dò chế độ dinh dưỡng, sinh hoạt, vận động
                                    </label>
                                    <textarea
                                        rows="3"
                                        placeholder="Chế độ ăn nhạt, kiêng đồ cay nóng, không uống rượu bia, tập thể dục nhẹ nhàng 30 phút mỗi ngày..."
                                        value={examForm.doctorAdvice}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, doctorAdvice: e.target.value }))}
                                        className="w-full p-3.5 rounded-2xl border border-gray-300 text-sm focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                        Ngày Hẹn Tái Khám (nếu cần)
                                    </label>
                                    <input
                                        type="date"
                                        min={new Date().toISOString().split("T")[0]}
                                        value={examForm.followUpDate}
                                        onChange={(e) => setExamForm(prev => ({ ...prev, followUpDate: e.target.value }))}
                                        className="w-full p-3.5 rounded-2xl border border-gray-300 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-blue-500"
                                    />
                                    <p className="text-[11px] text-gray-400 mt-1.5">
                                        Hệ thống sẽ nhắc hẹn bệnh nhân trước ngày tái khám.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* THANH HÀNH ĐỘNG LƯU BỆNH ÁN */}
                        <div className="pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                <i className="fas fa-shield-alt text-emerald-600 text-base"></i>
                                <span>Khi bấm "Hoàn Thành Ca Khám", hệ thống sẽ lưu bệnh án và cập nhật trạng thái lịch hẹn thành Đã Khám.</span>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <button
                                    type="button"
                                    onClick={() => handleSaveMedicalRecord('draft')}
                                    disabled={isProcessing}
                                    className="flex-1 sm:flex-none px-5 py-3 rounded-2xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    <i className="fas fa-save"></i>
                                    <span>Lưu Nháp Bệnh Án</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => handleSaveMedicalRecord('completed')}
                                    disabled={isProcessing}
                                    className="flex-1 sm:flex-none px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 text-white text-sm font-black shadow-lg hover:shadow-xl transition transform hover:scale-[1.01] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                                >
                                    {isProcessing ? (
                                        <>
                                            <i className="fas fa-spinner fa-spin"></i>
                                            <span>Đang Lưu...</span>
                                        </>
                                    ) : (
                                        <>
                                            <i className="fas fa-check-circle"></i>
                                            <span>Hoàn Thành Ca Khám & Lưu Bệnh Án</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            )}

            {/* Modal Xem Bệnh Án & In Toa Thuốc */}
            {showRecordModal && medicalRecord && (
                <MedicalRecordModal
                    isOpen={showRecordModal}
                    onClose={() => setShowRecordModal(false)}
                    record={medicalRecord}
                    appointment={appointment}
                />
            )}

        </div>
    );
}

export default AppointmentDetail;