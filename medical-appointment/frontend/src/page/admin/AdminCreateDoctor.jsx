import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminService } from '../../service/adminService';

// Thư viện Avatar bác sĩ mẫu đẹp mắt
const DEFAULT_AVATARS = [
    'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1594824813681-424a6549c95d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=350&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1622902046580-2b47f47f5471?w=350&auto=format&fit=crop&q=80',
];

export default function AdminCreateDoctor() {
    const navigate = useNavigate();
    const [specialties, setSpecialties] = useState([]);
    const [isLoadingSpecialties, setIsLoadingSpecialties] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Modal hiển thị thông tin tài khoản bàn giao sau khi cấp thành công
    const [createdAccount, setCreatedAccount] = useState(null);

    // State Form
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: 'Klinik@' + Math.floor(1000 + Math.random() * 9000),
        phoneNumber: '',
        specialtyId: '',
        experienceYears: 5,
        pricePerAppointment: 250000,
        address: '273 An Dương Vương, Phường 4, Quận 5, TP. HCM',
        bio: '',
        imageUrl: DEFAULT_AVATARS[0]
    });

    useEffect(() => {
        const fetchSpecialties = async () => {
            try {
                const data = await adminService.getAllSpecialties();
                setSpecialties(data || []);
                if (data && data.length > 0) {
                    setFormData(prev => ({ ...prev, specialtyId: data[0].id }));
                }
            } catch (err) {
                console.error("Lỗi khi tải chuyên khoa:", err);
            } finally {
                setIsLoadingSpecialties(false);
            }
        };
        fetchSpecialties();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const generateRandomPassword = () => {
        const randomPass = 'Klinik@' + Math.floor(100000 + Math.random() * 900000);
        setFormData(prev => ({ ...prev, password: randomPass }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.fullName.trim()) {
            alert("Vui lòng nhập họ tên bác sĩ");
            return;
        }
        if (!formData.email.trim()) {
            alert("Vui lòng nhập email đăng nhập");
            return;
        }
        if (!formData.password || formData.password.length < 6) {
            alert("Mật khẩu khởi tạo phải từ 6 ký tự trở lên");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await adminService.createDoctor(formData);
            const chosenSpec = specialties.find(s => s.id === Number(formData.specialtyId));

            // Lưu thông tin để hiển thị bảng bàn giao
            setCreatedAccount({
                fullName: formData.fullName,
                email: formData.email,
                password: formData.password,
                specialtyName: chosenSpec?.specialtyName || 'Chung',
                phoneNumber: formData.phoneNumber,
                loginUrl: window.location.origin + '/doctor/login'
            });
        } catch (err) {
            console.error("Lỗi cấp tài khoản bác sĩ:", err);
            alert(err.response?.data?.message || err.message || "Không thể cấp tài khoản bác sĩ!");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCopyCredentials = () => {
        if (!createdAccount) return;
        const handoverText = `[KLINIK HEALTHCARE] THÔNG TIN BÀN GIAO TÀI KHOẢN BÁC SĨ MỚI
──────────────────────────────────────
• Bác sĩ: ${createdAccount.fullName}
• Chuyên khoa phân công: ${createdAccount.specialtyName}
• Cổng đăng nhập Bác sĩ: ${createdAccount.loginUrl}
• Email đăng nhập: ${createdAccount.email}
• Mật khẩu khởi tạo: ${createdAccount.password}
──────────────────────────────────────
Ghi chú: Vui lòng đăng nhập và chủ động đổi lại mật khẩu cá nhân trong lần làm việc đầu tiên.`;

        navigator.clipboard.writeText(handoverText).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        });
    };

    const handleResetForm = () => {
        setCreatedAccount(null);
        setFormData({
            fullName: '',
            email: '',
            password: 'Klinik@' + Math.floor(1000 + Math.random() * 9000),
            phoneNumber: '',
            specialtyId: specialties[0]?.id || '',
            experienceYears: 5,
            pricePerAppointment: 250000,
            address: '273 An Dương Vương, Phường 4, Quận 5, TP. HCM',
            bio: '',
            imageUrl: DEFAULT_AVATARS[Math.floor(Math.random() * DEFAULT_AVATARS.length)]
        });
    };

    const selectedSpecialtyObj = specialties.find(s => s.id === Number(formData.specialtyId));

    const formatCurrency = (val) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val || 0);
    };

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {/* Header & Navigation Breadcrumb */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                        <Link to="/admin/dashboard" className="hover:text-blue-600 transition">Quản trị</Link>
                        <span>/</span>
                        <Link to="/admin/doctors" className="hover:text-blue-600 transition">Bác sĩ</Link>
                        <span>/</span>
                        <span className="text-blue-600">Cấp tài khoản mới</span>
                    </div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-user-plus"></i>
                        </span>
                        Cấp Tài Khoản Bác Sĩ Mới
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Khởi tạo tài khoản hệ thống, phân khoa khám bệnh và cấp quyền truy cập Cổng Bác sĩ (Doctor Portal).
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => navigate('/admin/doctors')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 hover:border-slate-300 transition cursor-pointer"
                    >
                        <i className="fas fa-arrow-left text-xs"></i> Danh sách bác sĩ
                    </button>
                </div>
            </div>

            {/* Layout 2 cột: Cột trái (Form nhập) - Cột phải (Live Preview & Hướng dẫn) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* CỘT TRÁI: FORM CẤP TÀI KHOẢN (8 Cột) */}
                <div className="lg:col-span-7 xl:col-span-8 bg-white p-6 md:p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* PHẦN 1: TÀI KHOẢN ĐĂNG NHẬP & BẢO MẬT */}
                        <div>
                            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                                <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-xs font-bold">1</span>
                                <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                                    Tài Khoản Đăng Nhập & Bảo Mật
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Email Đăng Nhập <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-envelope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            placeholder="ví dụ: bs.long@klinik.vn"
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Dùng để bác sĩ đăng nhập vào hệ thống.</p>
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-1.5">
                                        <label className="text-xs font-bold text-slate-700 uppercase">
                                            Mật Khẩu Khởi Tạo <span className="text-rose-500">*</span>
                                        </label>
                                        <button
                                            type="button"
                                            onClick={generateRandomPassword}
                                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 transition cursor-pointer"
                                        >
                                            <i className="fas fa-random mr-1"></i> Tạo mật khẩu mới
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <i className="fas fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            name="password"
                                            required
                                            placeholder="Ít nhất 6 ký tự"
                                            value={formData.password}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                                        >
                                            <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-xs`}></i>
                                        </button>
                                    </div>
                                    <p className="text-[11px] text-slate-400 mt-1">Bác sĩ có thể đổi mật khẩu sau khi đăng nhập.</p>
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 2: THÔNG TIN CHUYÊN MÔN & PHÂN KHOA */}
                        <div>
                            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                                <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center text-xs font-bold">2</span>
                                <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                                    Thông Tin Định Danh & Phân Chuyên Khoa
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Họ và Tên Bác Sĩ <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-user-md absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            placeholder="VD: BS.CKII Lê Hoàng Long"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Phân Khoa Công Tác <span className="text-rose-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-stethoscope absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <select
                                            name="specialtyId"
                                            value={formData.specialtyId}
                                            onChange={handleChange}
                                            disabled={isLoadingSpecialties}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        >
                                            {specialties.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.specialtyName} {s.description ? `(${s.description})` : ''}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Kinh Nghiệm (Số năm)
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-award absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type="number"
                                            name="experienceYears"
                                            min="0"
                                            max="60"
                                            value={formData.experienceYears}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Giá Khám Mỗi Lượt (VND)
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-money-bill-wave absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type="number"
                                            name="pricePerAppointment"
                                            step="10000"
                                            min="0"
                                            value={formData.pricePerAppointment}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                    <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                                        Tương đương: {formatCurrency(formData.pricePerAppointment)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* PHẦN 3: LIÊN HỆ, ĐỊA CHỈ & HỒ SƠ */}
                        <div>
                            <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-100">
                                <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-xs font-bold">3</span>
                                <h2 className="text-base font-bold text-slate-800 uppercase tracking-wide">
                                    Thông Tin Liên Hệ & Phòng Khám
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Số Điện Thoại Liên Lạc
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-phone-alt absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type="text"
                                            name="phoneNumber"
                                            placeholder="VD: 0901234567"
                                            value={formData.phoneNumber}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                        Địa Chỉ Nơi Khám
                                    </label>
                                    <div className="relative">
                                        <i className="fas fa-map-marker-alt absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Chọn ảnh đại diện */}
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                    Chọn Ảnh Đại Diện Bác Sĩ
                                </label>
                                <div className="flex flex-wrap gap-3 items-center mb-3">
                                    {DEFAULT_AVATARS.map((url, idx) => (
                                        <img
                                            key={idx}
                                            src={url}
                                            alt={`Avatar mẫu ${idx + 1}`}
                                            onClick={() => setFormData(prev => ({ ...prev, imageUrl: url }))}
                                            className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition transform hover:scale-105 ${
                                                formData.imageUrl === url
                                                    ? 'border-blue-600 ring-2 ring-blue-400 ring-offset-2'
                                                    : 'border-slate-200 opacity-70 hover:opacity-100'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <div className="relative">
                                    <i className="fas fa-link absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                                    <input
                                        type="url"
                                        name="imageUrl"
                                        placeholder="Hoặc nhập URL hình ảnh trực tiếp..."
                                        value={formData.imageUrl}
                                        onChange={handleChange}
                                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>

                            {/* Giới thiệu / Bio */}
                            <div className="mt-4">
                                <label className="block text-xs font-bold text-slate-700 uppercase mb-1.5">
                                    Tiểu Sử & Giới Thiệu Chuyên Môn
                                </label>
                                <textarea
                                    name="bio"
                                    rows="3"
                                    placeholder="Tóm tắt quá trình đào tạo, chuyên môn sâu, công trình nghiên cứu nổi bật..."
                                    value={formData.bio}
                                    onChange={handleChange}
                                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                                ></textarea>
                            </div>
                        </div>

                        {/* Nút hành động Submit */}
                        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleResetForm}
                                className="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                            >
                                <i className="fas fa-undo mr-1.5"></i> Đặt lại form
                            </button>
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-lg shadow-blue-500/25 transition cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i> Đang khởi tạo tài khoản...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-check-circle"></i> Cấp Tài Khoản Bác Sĩ
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </div>

                {/* CỘT PHẢI: LIVE PREVIEW & QUY TRÌNH (4 Cột) */}
                <div className="lg:col-span-5 xl:col-span-4 space-y-6">
                    {/* THẺ XEM TRƯỚC HỒ SƠ BÁC SĨ (LIVE PREVIEW) */}
                    <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 relative overflow-hidden">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                <i className="fas fa-eye mr-1 text-blue-500"></i> Xem trước thẻ hồ sơ
                            </span>
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
                                Sẵn sàng cấp
                            </span>
                        </div>

                        <div className="text-center space-y-3">
                            <div className="relative inline-block">
                                <img
                                    src={formData.imageUrl || DEFAULT_AVATARS[0]}
                                    alt="Doctor Avatar"
                                    className="w-24 h-24 rounded-2xl object-cover mx-auto shadow-md border-2 border-white ring-2 ring-blue-500/30"
                                    onError={(e) => { e.target.src = DEFAULT_AVATARS[0]; }}
                                />
                                <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 text-white text-[11px] flex items-center justify-center shadow">
                                    <i className="fas fa-check"></i>
                                </span>
                            </div>

                            <div>
                                <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                                    {formData.fullName || 'Họ và Tên Bác Sĩ'}
                                </h3>
                                <p className="text-xs font-semibold text-blue-600 inline-block px-3 py-1 rounded-full bg-blue-50 mt-1">
                                    {selectedSpecialtyObj ? selectedSpecialtyObj.specialtyName : 'Chuyên khoa'}
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-left">
                                <div className="bg-slate-50 p-2.5 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Kinh nghiệm</span>
                                    <span className="text-sm font-bold text-slate-800">{formData.experienceYears || 0} năm</span>
                                </div>
                                <div className="bg-slate-50 p-2.5 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Giá dịch vụ</span>
                                    <span className="text-sm font-bold text-emerald-600">
                                        {formatCurrency(formData.pricePerAppointment)}
                                    </span>
                                </div>
                            </div>

                            <div className="space-y-1.5 text-left text-xs text-slate-600 pt-2">
                                <div className="flex items-center gap-2 text-slate-600 truncate">
                                    <i className="fas fa-envelope text-slate-400 w-4 text-center"></i>
                                    <span className="truncate">{formData.email || 'email@klinik.vn'}</span>
                                </div>
                                <div className="flex items-center gap-2 text-slate-600">
                                    <i className="fas fa-phone-alt text-slate-400 w-4 text-center"></i>
                                    <span>{formData.phoneNumber || 'Chưa có số ĐT'}</span>
                                </div>
                                <div className="flex items-start gap-2 text-slate-600">
                                    <i className="fas fa-map-marker-alt text-slate-400 w-4 text-center mt-0.5"></i>
                                    <span className="line-clamp-2 text-[11px]">{formData.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* HỘP HƯỚNG DẪN QUY TRÌNH CẤP TÀI KHOẢN */}
                    <div className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
                        <div className="flex items-center gap-2.5 text-blue-400 font-bold text-xs uppercase tracking-wider">
                            <i className="fas fa-shield-alt text-sm"></i> Quy Trình Cấp & Bàn Giao
                        </div>
                        <ul className="space-y-3 text-xs text-slate-300">
                            <li className="flex items-start gap-2.5">
                                <i className="fas fa-check-circle text-blue-400 mt-0.5 flex-shrink-0"></i>
                                <span>Mật khẩu khởi tạo được mã hóa an toàn bằng thuật toán <strong>BCrypt</strong> trong cơ sở dữ liệu.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <i className="fas fa-check-circle text-blue-400 mt-0.5 flex-shrink-0"></i>
                                <span>Bác sĩ được kích hoạt hồ sơ ngay lập tức trên hệ thống đặt lịch bệnh nhân.</span>
                            </li>
                            <li className="flex items-start gap-2.5">
                                <i className="fas fa-check-circle text-blue-400 mt-0.5 flex-shrink-0"></i>
                                <span>Sau khi tạo, nhấn nút <strong>Sao chép</strong> để gửi nhanh tài khoản qua Email hoặc Zalo cho Bác sĩ.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* MODAL THÔNG BÁO BÀN GIAO TÀI KHOẢN KHI TẠO THÀNH CÔNG */}
            {createdAccount && (
                <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-6 animate-fadeIn border border-slate-100">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto shadow-md shadow-emerald-500/20">
                                <i className="fas fa-check"></i>
                            </div>
                            <h3 className="text-2xl font-black text-slate-900">Cấp Tài Khoản Thành Công!</h3>
                            <p className="text-xs text-slate-500">
                                Bác sĩ đã được thêm vào hệ thống. Hãy gửi thông tin đăng nhập bên dưới cho Bác sĩ:
                            </p>
                        </div>

                        {/* Thẻ hiển thị thông tin bàn giao */}
                        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 font-sans">
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                <span className="text-slate-500 font-semibold">Bác sĩ:</span>
                                <span className="font-bold text-slate-800">{createdAccount.fullName}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                <span className="text-slate-500 font-semibold">Chuyên khoa:</span>
                                <span className="font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    {createdAccount.specialtyName}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                <span className="text-slate-500 font-semibold">Email đăng nhập:</span>
                                <span className="font-mono font-bold text-slate-900">{createdAccount.email}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-200">
                                <span className="text-slate-500 font-semibold">Mật khẩu ban đầu:</span>
                                <span className="font-mono font-extrabold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                                    {createdAccount.password}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-500 font-semibold">Cổng đăng nhập:</span>
                                <span className="font-mono text-[11px] text-slate-600">{createdAccount.loginUrl}</span>
                            </div>
                        </div>

                        {/* Nút Sao chép thông tin */}
                        <button
                            type="button"
                            onClick={handleCopyCredentials}
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
                                onClick={handleResetForm}
                                className="flex-1 py-2.5 px-4 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 transition cursor-pointer text-center"
                            >
                                <i className="fas fa-plus mr-1"></i> Cấp tài khoản khác
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/admin/doctors')}
                                className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition cursor-pointer text-center shadow-sm"
                            >
                                Xem danh sách bác sĩ <i className="fas fa-arrow-right ml-1"></i>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
