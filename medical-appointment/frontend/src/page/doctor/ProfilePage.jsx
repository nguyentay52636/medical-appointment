import { useEffect, useState } from 'react';
import axios from 'axios';

const PRIMARY_COLOR = 'blue';
const SAVE_COLOR = 'emerald';

const profileFields = [
    { key: 'fullName', label: 'Tên', icon: 'user-md', type: 'text', editable:false },
    { key: 'specialtyName', label: 'Chuyên Khoa', icon: 'stethoscope', type: 'text', editable:false },
    { key: 'email', label: 'Email', icon: 'envelope', type: 'email', editable:false },
    { key: 'phoneNumber', label: 'Điện Thoại', icon: 'phone', type: 'tel', editable: true },
    { key: 'experienceYears', label: 'Kinh Nghiệm(Năm)', icon: 'briefcase', type: 'text', editable: true },
    { key: 'bio', label: 'Hồ sơ chuyên môn', icon: 'graduation-cap', type: 'text', editable:false },
];

function DoctorProfile() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    //component mount - Khi mở một trang hoặc render một component, React “gắn” nó vào giao diện
    useEffect(() => {
        const storedDoctor = sessionStorage.getItem('doctor');
        if (storedDoctor) {
            setProfile(JSON.parse(storedDoctor));
        }
        setLoading(false); 
    }, []);

    // Nếu đang loading, hiển thị spinner hoặc thông báo
    if (loading) {
        return (
            <div className="text-center p-6 text-lg font-medium text-gray-700">
                Đang tải thông tin bác sĩ...
            </div>
        );
    }

    // Nếu load xong mà không có profile, thông báo lỗi
    if (!profile) {
        return (
            <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border rounded-xl shadow-md">
                Không tìm thấy thông tin bác sĩ.
            </div>
        );
    }

    const handleSave = async (e) => {
        e.preventDefault();
        setIsSaving(true);

        // 1. Tạo DTO chỉ chứa các trường được phép sửa
        const doctorDTO = {
            id: profile.id,
            phoneNumber: profile.phoneNumber,
            experienceYears: profile.experienceYears,
        };

        try {
            // 2. Gọi API để cập nhật backend
            const response = await axios.put('http://localhost:8080/api/doctor/update', doctorDTO);
            const updatedDoctor = response.data; // Lấy dữ liệu mới nhất từ server

            // 3. Cập nhật state và sessionStorage với dữ liệu đã được xác nhận
            // Sử dụng ...profile để giữ lại các trường cũ (như fullName, email...)
            // và ghi đè bằng ...updatedDoctor (phoneNumber, experienceYears mới)
            const newProfile = { ...profile, ...updatedDoctor };
            
            sessionStorage.setItem('doctor', JSON.stringify(newProfile));
            setProfile(newProfile); // Cập nhật state của React

            // 4. Hoàn tất
            setIsEditing(false);
            alert("Cập nhật hồ sơ thành công!");

        } catch (err) {
            console.error("Lỗi khi cập nhật hồ sơ:", err);
            // Nếu lỗi, không nên tắt chế độ Edit
            // để người dùng không bị mất thay đổi của họ
            alert("Có lỗi khi cập nhật hồ sơ. Vui lòng thử lại!");
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    // Nút Edit/Cancel
    const renderEditButton = () => {
        const iconClass = isEditing ? 'fas fa-times' : 'fas fa-edit';
        const colorClass = isEditing ? 'bg-red-500 hover:bg-red-600' : `bg-${PRIMARY_COLOR}-600 hover:bg-${PRIMARY_COLOR}-700`;

        return (
            <button
                onClick={() => setIsEditing(!isEditing)}
                className={`${colorClass} text-white px-6 py-3 rounded-xl text-lg font-semibold transition-all shadow-md transform hover:scale-[1.01] flex items-center cursor-pointer`}
            >
                <i className={`${iconClass} mr-2`}></i>
                {isEditing ? 'Hủy Bỏ' : 'Chỉnh Sửa'}
            </button>
        );
    };

    return (
        <div className="space-y-8">
            {/* TIÊU ĐỀ */}
            <div className="flex justify-between items-center border-b border-gray-200 pb-4">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center">
                    <i className={`fas fa-user-circle text-${PRIMARY_COLOR}-600 mr-4`}></i>
                    Hồ Sơ Cá Nhân
                </h1>
                {renderEditButton()}
            </div>

            <form onSubmit={handleSave} className="bg-white p-10 rounded-2xl shadow-2xl border border-gray-100 space-y-10">

                {/* CARD THÔNG TIN CƠ BẢN VÀ AVATAR */}
                <div className="flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 pb-6 border-b border-gray-100">
                    <div className="flex-shrink-0">
                        {/* Ảnh đại diện giả lập */}
                        <div className={`w-32 h-32 rounded-full bg-${PRIMARY_COLOR}-100 flex items-center justify-center border-4 border-${PRIMARY_COLOR}-300 shadow-xl overflow-hidden`}>
                            <i className={`fas fa-user-circle text-7xl text-${PRIMARY_COLOR}-500`}></i>
                        </div>
                    </div>
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-800">{profile.fullName}</h2>
                        <p className={`text-xl font-semibold text-${PRIMARY_COLOR}-600 mt-1`}>
                            <i className={`fas fa-user-tag mr-2 text-${PRIMARY_COLOR}-400`}></i>
                            {profile.specialtyName}
                        </p>
                        <p className="text-gray-500 mt-2">Cập nhật lần cuối: {new Date().toLocaleDateString('vi-VN')}</p>
                    </div>
                </div>

                {/* CÁC TRƯỜNG THÔNG TIN CHI TIẾT */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                    {profileFields.map((field) => (
                        <div key={field.key}>
                            <label className={`block text-base font-semibold mb-2 flex items-center ${isEditing ? 'text-gray-800' : 'text-gray-600'}`}>
                                <i className={`fas fa-${field.icon} mr-3 text-lg text-${PRIMARY_COLOR}-500`}></i>
                                {field.label}
                            </label>
                            <input
                                type={field.type}
                                name={field.key}
                                value={profile[field.key]}
                                onChange={handleChange}
                                readOnly={!isEditing || !field.editable} //// chỉ cho phép sửa nếu đang editing và editable
                                className={`mt-1 block w-full p-3 rounded-xl shadow-inner transition-all duration-300 
                                    ${isEditing
                                        ? `border-2 border-${PRIMARY_COLOR}-300 focus:border-${PRIMARY_COLOR}-500 focus:ring-1 focus:ring-${PRIMARY_COLOR}-500 bg-white text-gray-800`
                                        : 'border border-gray-100 bg-gray-50 text-gray-700 font-medium cursor-default'}
                                `}
                            />
                        </div>
                    ))}
                </div>

                {/* NÚT LƯU */}
                {isEditing && (
                    <div className="pt-8 flex justify-end border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className={`bg-${SAVE_COLOR}-600 text-white px-8 py-3 rounded-xl text-lg font-semibold hover:bg-${SAVE_COLOR}-700 transition-all shadow-xl transform hover:scale-[1.01] flex items-center disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer`}
                        >
                            {isSaving ? (
                                <>
                                    <i className="fas fa-spinner fa-spin mr-3"></i> Đang Lưu...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-save mr-3"></i> Lưu Thay Đổi
                                </>
                            )}
                        </button>
                    </div>
                )}
            </form>
        </div>
    );
}

export default DoctorProfile;