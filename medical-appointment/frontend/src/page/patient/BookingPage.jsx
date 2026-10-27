import { useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from "react-router-dom";
import { fetchDoctorsBySpecialtyId, fetchScheduleSummary } from "../../service/doctorService";
import { specialtyService } from "../../service/specialtyService";
import { appointmentService } from "../../service/appointmentService";
import { bookableSlotService } from "../../service/bookableSlotService";
import { PatientContext } from "../../context/PatientContext";

const BookingSidebar = () => (
    <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 h-full">
        <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
            LƯU Ý QUAN TRỌNG
        </h3>

        <div className="mb-4 p-3 bg-blue-100 border border-blue-300 rounded text-sm text-blue-900 font-semibold">
            Vui lòng chọn ngày khám phù hợp với <strong>lịch trực trong tuần</strong> của Bác sĩ.
        </div>

        <ul className="space-y-4 text-gray-700">
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 flex-shrink-0 mr-3 mt-1"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" /><path d="M9 12l2 2 4-4" /></svg>
                <div>
                    <strong className="block text-sm">Xác nhận thông tin</strong>
                    <span className="text-sm">Đảm bảo thông tin liên hệ chính xác để chúng tôi có thể gọi lại xác nhận lịch khám.</span>
                </div>
            </li>
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500 flex-shrink-0 mr-3 mt-1"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                <div>
                    <strong className="block text-sm">Thời gian linh hoạt</strong>
                    <span className="text-sm">Chúng tôi sẽ cố gắng sắp xếp lịch khám gần nhất với yêu cầu của bạn, nhưng có thể điều chỉnh theo lịch trống của bác sĩ.</span>
                </div>
            </li>
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 flex-shrink-0 mr-3 mt-1"><path d="M4 14.899A7 7 0 0 1 15.708 8H17a5 5 0 0 1 4.706 4.109M12 16v3" /><path d="M15 13l-3-3-3 3" /></svg>
                <div>
                    <strong className="block text-sm">Chuẩn bị kỹ lưỡng</strong>
                    <span className="text-sm">Vui lòng mô tả triệu chứng chi tiết nhất có thể để bác sĩ chẩn đoán hiệu quả hơn.</span>
                </div>
            </li>
            <li className="flex items-start">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500 flex-shrink-0 mr-3 mt-1"><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                <div>
                    <strong className="block text-sm">Bảo mật thông tin</strong>
                    <span className="text-sm">Tất cả dữ liệu cá nhân của bạn được bảo mật tuyệt đối theo quy định y tế.</span>
                </div>
            </li>
        </ul>
    </div>
);

export default function BookingPage() {

    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phoneNumber: '',
        address: '',
        specialty: '',
        specialtyName: '',
        doctorId: '',
        doctorName: '',
        date: '',
        bookableSlotId: '',
        reason: '',
        note: '',
        paymentMethod: '',
        paymentStatus: '',
        price: ''
    });

    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [doctorScheduleSummary, setDoctorScheduleSummary] = useState(null);
    const [dateWarningMessage, setDateWarningMessage] = useState('');
    const [suggestedDates, setSuggestedDates] = useState([]);
    const navigate = useNavigate();

    const { patient } = useContext(PatientContext);
    const location = useLocation();
    const selectedDoctor = location.state?.doctor;
    const selectedSpecialtySlug = location.state?.specialtySlug;

    // Nếu chọn chuyên khoa từ SpecialtyDetail
    useEffect(() => {
        if (!selectedSpecialtySlug) return;

        // Map slug -> specialtyId
        const slugToId = {
            noi_khoa: 1,
            tim_mach: 2,
            tai_mui_hong: 3,
            da_lieu: 4,
            nhi_khoa: 5
        };

        const id = slugToId[selectedSpecialtySlug];
        if (!id) return;

        setFormData(prev => ({
            ...prev,
            specialty: id
        }));
    }, [selectedSpecialtySlug]);

    // Load danh sách chuyên khoa
    useEffect(() => {
        specialtyService.getAllSpecialties()
            .then(data => setSpecialties(data))
            .catch(err => console.log('Lỗi load chuyên khoa:', err));
    }, []);

    // Lấy specialtyName
    useEffect(() => {
        if (!formData.specialty) return;

        const specialtyObj = specialties.find(s => s.id === formData.specialty);
        if (specialtyObj) {
            setFormData(prev => ({
                ...prev,
                specialtyName: specialtyObj.specialtyName
            }));
        }
    }, [formData.specialty, specialties]);

    // Nếu chọn bác sĩ từ DoctorList
    useEffect(() => {
        if (!selectedDoctor) return;
        setFormData(prev => ({
            ...prev,
            doctorId: selectedDoctor.id,
            specialty: selectedDoctor.specialtyId
        }));
    }, [selectedDoctor]);

    // Lấy doctorName + price khi doctorId thay đổi
    useEffect(() => {
        if (!formData.doctorId) return;

        const doctor = doctors.find(d => d.id === formData.doctorId);
        if (doctor) {
            setFormData(prev => ({
                ...prev,
                doctorName: doctor.fullName,
                price: doctor.pricePerAppointment || 0
            }));
        }
    }, [formData.doctorId, doctors]);

    // Load thông tin lịch trực và tính các ngày gợi ý gần nhất của bác sĩ
    useEffect(() => {
        if (!formData.doctorId) {
            setDoctorScheduleSummary(null);
            setSuggestedDates([]);
            return;
        }

        fetchScheduleSummary(formData.doctorId)
            .then(summary => {
                setDoctorScheduleSummary(summary);
                if (summary && summary.workingDays && summary.workingDays.length > 0) {
                    const dayMap = {
                        'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
                        'thursday': 4, 'friday': 5, 'saturday': 6
                    };
                    const targetDayNums = summary.workingDays.map(d => dayMap[d.toLowerCase()]);
                    const suggestions = [];
                    const curr = new Date();

                    for (let i = 0; i < 21 && suggestions.length < 4; i++) {
                        const candidate = new Date();
                        candidate.setDate(curr.getDate() + i);
                        const dayNum = candidate.getDay();
                        if (targetDayNums.includes(dayNum)) {
                            const yyyy = candidate.getFullYear();
                            const mm = String(candidate.getMonth() + 1).padStart(2, '0');
                            const dd = String(candidate.getDate()).padStart(2, '0');
                            const dateStr = `${yyyy}-${mm}-${dd}`;

                            const weekdayVi = candidate.toLocaleDateString('vi-VN', { weekday: 'long' });
                            const formattedDisplay = `${weekdayVi.charAt(0).toUpperCase() + weekdayVi.slice(1)}, ${dd}/${mm}`;
                            suggestions.push({ dateStr, label: formattedDisplay });
                        }
                    }
                    setSuggestedDates(suggestions);
                } else {
                    setSuggestedDates([]);
                }
            })
            .catch(err => {
                console.error("Lỗi lấy thông tin lịch bác sĩ:", err);
                setDoctorScheduleSummary(null);
                setSuggestedDates([]);
            });
    }, [formData.doctorId]);

    // Load danh sách bác sĩ khi chuyên khoa được chọn
    useEffect(() => {
        if (!formData.specialty) {
            setDoctors([]);
            return;
        }

        fetchDoctorsBySpecialtyId.getDoctorsBySpecialtyId(formData.specialty)
            .then(data => {
                if (selectedDoctor && selectedDoctor.specialtyId === formData.specialty) {
                    const exists = data.some(d => d.id === selectedDoctor.id);
                    if (!exists) data.unshift(selectedDoctor);
                }
                setDoctors(data);
            })
            .catch(err => setDoctors([]));
    }, [formData.specialty, selectedDoctor]);

    // Load thông tin patient
    useEffect(() => {
        if (patient) {
            setFormData(prev => ({
                ...prev,
                fullName: patient.fullName || '',
                email: patient.email || '',
                phoneNumber: patient.phoneNumber || '',
                address: patient.address || ''
            }));
        }
    }, [patient]);

    // Lấy slot trống khi chọn bác sĩ và ngày
    useEffect(() => {
        if (!formData.doctorId || !formData.date) {
            setAvailableSlots([]);
            setDateWarningMessage('');
            return;
        }

        setDateWarningMessage('');

        bookableSlotService.getAvailableSlots(formData.doctorId, formData.date)
            .then(slots => {
                const now = new Date();
                const selectedDate = new Date(formData.date);

                const available = slots.filter(slot => {
                    if (slot.status.toLowerCase() !== "available") return false;

                    // Nếu là hôm nay, loại bỏ slot đã qua giờ
                    if (selectedDate.toDateString() === now.toDateString()) {
                        const [hours, minutes] = slot.startTime.split(":").map(Number);
                        const slotTime = new Date(selectedDate);
                        slotTime.setHours(hours, minutes, 0, 0);

                        if (slotTime <= now) return false;
                    }

                    return true;
                });

                setAvailableSlots(available);

                if (slots.length === 0) {
                    const dayNameVi = new Date(formData.date + 'T00:00:00').toLocaleDateString('vi-VN', { weekday: 'long' });
                    setDateWarningMessage(`Bác sĩ ${formData.doctorName || ''} không có lịch trực vào ${dayNameVi}. Vui lòng chọn một trong các ngày gợi ý bên dưới.`);
                } else if (available.length === 0) {
                    setDateWarningMessage("Ngày này đã kín hết slot khám hoặc các khung giờ đã trôi qua. Vui lòng chọn một ngày khám khác.");
                } else {
                    setDateWarningMessage('');
                }
            })
            .catch(err => {
                console.error("Lỗi lấy slot:", err);
                setAvailableSlots([]);
                setDateWarningMessage('Không thể nạp danh sách giờ khám. Vui lòng thử lại!');
            });
    }, [formData.doctorId, formData.date, formData.doctorName]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        setFormData(prev => ({
            ...prev,
            [name]: value
        }));

        if (name === "bookableSlotId") {
            setFormData(prev => ({
                ...prev,
                bookableSlotId: parseInt(value)
            }));
        }
    };

    // Khi nhấn xác nhận
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.bookableSlotId) {
            alert("Vui lòng chọn giờ khám.");
            return;
        }

        if (!patient || !patient.id) {
            alert("Thông tin bệnh nhân chưa đầy đủ.");
            return;
        }

        const appointmentData = {
            patientId: Number(patient.id),
            bookableSlotId: Number(formData.bookableSlotId),
            reason: formData.reason?.trim() || "",
            note: formData.note?.trim() || "",
            paymentMethod: formData.paymentMethod,
            paymentStatus: formData.paymentStatus,
            price: formData.price
        };

        try {
            const res = await appointmentService.createAppointment(appointmentData);

            if (appointmentData.paymentMethod === "online" && res.paymentUrl) {
                navigate("/patient/payment", {
                    state: {
                        appointmentId: res.id,
                        formData: { ...formData, price: appointmentData.price },
                        paymentUrl: res.paymentUrl
                    }
                });
            } else {
                alert("Đặt lịch thành công! Bạn sẽ thanh toán khi đến khám.");

                // Xoá slot vừa đặt khỏi danh sách giờ trống
                setAvailableSlots(prev => prev.filter(slot => slot.id !== formData.bookableSlotId));

                setFormData(prev => ({
                    ...prev,
                    bookableSlotId: "",
                    reason: "",
                    note: "",
                    paymentMethod: ""
                }));
            }
        } catch (error) {
            console.error("Lỗi đặt lịch:", error);
            alert("Đặt lịch thất bại! Vui lòng kiểm tra lại thông tin.");
        }
    };

    const handleClose = () => {
        window.history.back();
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-white via-blue-50 to-gray-100 flex items-center justify-center p-6 sm:p-10">
            <div className="bg-white via-blue-50 rounded-3xl shadow-2xl w-full max-w-6xl p-6 md:p-10 border border-gray-100 relative">

                <button type="button" onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition duration-150 p-2 rounded-full hover:bg-red-50 cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 6L6 18" />
                        <path d="M6 6l12 12" />
                    </svg>
                </button>

                <h2 className="text-4xl font-extrabold text-blue-700 mb-3 text-center">ĐẶT LỊCH KHÁM BỆNH</h2>
                <p className="text-gray-600 text-center mb-10 text-lg">Vui lòng điền thông tin bên dưới để đặt lịch khám với bác sĩ chuyên khoa của Klinik.</p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="md:col-span-1"><BookingSidebar /></div>
                    <div className="md:col-span-2">
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <input type="text" name="fullName" value={formData.fullName} disabled className="border rounded-xl p-3 w-full" />
                            <input type="email" name="email" value={formData.email} disabled className="border rounded-xl p-3 w-full" />
                            <input type="tel" name="phoneNumber" value={formData.phoneNumber} disabled className="border rounded-xl p-3 w-full" />
                            <input type="text" name="address" value={formData.address} disabled className="border rounded-xl p-3 w-full" />

                            <select
                                name="specialty"
                                value={formData.specialty || ""}
                                onChange={e => setFormData(prev => ({
                                    ...prev,
                                    specialty: parseInt(e.target.value)
                                }))}
                                disabled={!!selectedDoctor}
                                required
                                className={`border rounded-xl p-3 w-full cursor-pointer
                                    ${formData.specialty ? 'text-black' : 'text-gray-400'}`}
                            >
                                <option value="" disabled>-- Chọn Chuyên khoa --</option>
                                {specialties.map(s => (
                                    <option key={s.id} value={s.id}>{s.specialtyName}</option>
                                ))}
                            </select>

                            <select
                                name="doctorId"
                                value={formData.doctorId || ""}
                                onChange={e => {
                                    const selected = doctors.find(d => d.id === parseInt(e.target.value));
                                    setFormData(prev => ({ ...prev, doctorId: selected?.id }));
                                }}
                                disabled={!formData.specialty || !!selectedDoctor}
                                required
                                className={`border rounded-xl p-3 w-full cursor-pointer
                                    ${formData.doctorId ? 'text-black' : 'text-gray-400'}`}
                            >
                                <option value="" disabled>-- Bác sĩ (Chọn chuyên khoa trước) --</option>
                                {doctors.map(d => <option key={d.id} value={d.id}>{d.fullName}</option>)}
                            </select>

                            {/* Doctor Working Days & Quick Suggestions */}
                            {doctorScheduleSummary && (
                                <div className="md:col-span-2 -mt-2 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl space-y-2">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                            <i className="fas fa-calendar-check text-blue-600"></i>
                                            Lịch trực trong tuần của Bác sĩ:
                                        </span>
                                        {doctorScheduleSummary.workingDaysVi && doctorScheduleSummary.workingDaysVi.length > 0 ? (
                                            doctorScheduleSummary.workingDaysVi.map((dayVi, idx) => (
                                                <span key={idx} className="px-2.5 py-1 bg-white border border-blue-300 text-blue-800 text-xs font-bold rounded-lg shadow-2xs">
                                                    {dayVi}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-xs text-amber-700 italic">Bác sĩ chưa cập nhật lịch trực</span>
                                        )}
                                    </div>

                                    {suggestedDates.length > 0 && (
                                        <div className="pt-2 border-t border-blue-200/60 flex flex-wrap items-center gap-2">
                                            <span className="text-xs font-bold text-gray-700">Gợi ý ngày trực gần nhất:</span>
                                            {suggestedDates.map((item, idx) => (
                                                <button
                                                    key={idx}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, date: item.dateStr }))}
                                                    className={`px-2.5 py-1 text-xs rounded-lg font-bold border transition cursor-pointer ${formData.date === item.dateStr ? 'bg-blue-600 text-white border-blue-600 shadow-sm' : 'bg-white hover:bg-blue-100 text-blue-700 border-blue-200'}`}
                                                >
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Ngày khám dự kiến
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    value={formData.date}
                                    onChange={handleChange}
                                    required
                                    className={`border rounded-xl p-3 w-full cursor-pointer ${formData.date ? 'text-black' : 'text-gray-500'} ${dateWarningMessage ? 'border-amber-400 bg-amber-50/30' : ''}`}
                                    min={new Date().toISOString().split("T")[0]}
                                    max={(() => {
                                        const d = new Date();
                                        d.setDate(d.getDate() + 30);
                                        return d.toISOString().split("T")[0];
                                    })()}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                                    Khung giờ khám
                                </label>
                                <select
                                    name="bookableSlotId"
                                    value={formData.bookableSlotId}
                                    onChange={handleChange}
                                    disabled={!availableSlots.length}
                                    required
                                    className={`border rounded-xl p-3 w-full cursor-pointer ${formData.bookableSlotId ? 'text-black' : 'text-gray-400'}`}
                                >
                                    <option value="">-- {availableSlots.length ? 'Chọn khung giờ khám' : 'Giờ khám (Chọn ngày trước)'} --</option>
                                    {availableSlots.map(slot => (
                                        <option key={slot.id} value={slot.id}>
                                            {slot.startTime.substring(0, 5)} - {slot.endTime.substring(0, 5)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Inline Warning Notice thay cho Popup Alert */}
                            {dateWarningMessage && (
                                <div className="md:col-span-2 p-3.5 bg-amber-50 border border-amber-300 rounded-xl text-amber-900 text-xs flex items-start gap-2.5 shadow-2xs">
                                    <i className="fas fa-exclamation-circle text-amber-600 text-base mt-0.5 shrink-0"></i>
                                    <div className="space-y-1.5 flex-1">
                                        <p className="font-semibold text-xs leading-relaxed">{dateWarningMessage}</p>
                                        {suggestedDates.length > 0 && (
                                            <div className="flex flex-wrap items-center gap-1.5 pt-1">
                                                <span className="font-bold text-gray-700">Chọn nhanh ngày có lịch:</span>
                                                {suggestedDates.map((item, idx) => (
                                                    <button
                                                        key={idx}
                                                        type="button"
                                                        onClick={() => setFormData(prev => ({ ...prev, date: item.dateStr }))}
                                                        className="px-2.5 py-1 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-md text-[11px] font-bold cursor-pointer transition shadow-2xs"
                                                    >
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <textarea name="reason" placeholder="Lý do khám (không bắt buộc)" rows="4" value={formData.reason} onChange={handleChange} className="border rounded-xl p-3 w-full" />
                            <textarea name="note" placeholder="Triệu chứng hoặc lịch sử bệnh án (nếu có)" rows="4" value={formData.note} onChange={handleChange} className="border rounded-xl p-3 w-full" />

                            <select
                                name="paymentMethod"
                                value={formData.paymentMethod || ""}
                                onChange={handleChange}
                                className={`border rounded-xl p-3 w-full md:col-span-2 cursor-pointer
                                    ${formData.paymentMethod ? 'text-black' : 'text-gray-400'}
                                `}
                                required
                            >
                                <option value="" disabled={formData.paymentMethod}>--- Chọn phương thức thanh toán ---</option>
                                <option value="offline">Thanh toán khi đến khám</option>
                                <option value="online">Thanh toán trực tuyến</option>
                            </select>

                            <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg md:col-span-2 mt-4 cursor-pointer">
                                XÁC NHẬN
                            </button>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
