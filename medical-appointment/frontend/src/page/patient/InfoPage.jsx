import { useContext, useState, useEffect } from "react";
import { PatientContext } from "../../context/PatientContext";
import PatientService from "../../service/patientService";
import { useNavigate } from "react-router-dom";

export default function PatientInfo() {
    const { patient, updatePatientInfo } = useContext(PatientContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        fullName: "",
        email: "",
        phoneNumber: "",
        address: ""
    });

    useEffect(() => {
        if (patient) {
            setFormData({
                fullName: patient.fullName || "",
                email: patient.email || "",
                phoneNumber: patient.phoneNumber || "",
                address: patient.address || ""
            });
        }
    }, [patient]);

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const updated = await PatientService.updatePatient(patient.id, formData);
            // Cập nhật context
            updatePatientInfo(updated);
            alert("Cập nhật thông tin thành công!");
        } catch (err) {
            // Kiểm tra message trả về từ backend
            if (err.response && err.response.data === "Số điện thoại đã tồn tại") {
                alert("Số điện thoại đã tồn tại, vui lòng nhập số khác!");
            } else {
                alert("Cập nhật thất bại!");
                console.error(err);
            }
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();

        // Mật khẩu mới và xác nhận phải trùng
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            alert("Mật khẩu xác nhận không khớp!");
            return;
        }

        // Mật khẩu mới >= 6 ký tự
        if (passwordData.newPassword.length < 6) {
            alert("Mật khẩu mới phải có ít nhất 6 ký tự!");
            return;
        }

        // Mật khẩu mới khác mật khẩu cũ
        if (passwordData.newPassword === passwordData.oldPassword) {
            alert("Mật khẩu mới không được trùng với mật khẩu cũ!");
            return;
        }

        try {
            const updated = await PatientService.changePassword(patient.id, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            updatePatientInfo(updated);
            alert("Đổi mật khẩu thành công!");
            setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            if (err.response && err.response.data) {
                alert(err.response.data);
            } else {
                alert("Đổi mật khẩu thất bại!");
            }
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-10 px-4">
            <div className="max-w-6xl mx-auto bg-white shadow-xl rounded-2xl p-8 md:p-12">
                <h2 className="text-3xl font-bold text-blue-700 mb-10 text-center">
                    Thông Tin Cá Nhân
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Cột trái - Thông tin cá nhân */}
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
                            Cập nhật thông tin
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Họ và tên
                                </label>
                                <input
                                    type="text"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    disabled
                                    className="w-full border border-gray-200 bg-gray-100 rounded-lg px-3 py-2 text-gray-500 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Số điện thoại
                                </label>
                                <input
                                    type="text"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Địa chỉ
                                </label>
                                <textarea
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                ></textarea>
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition cursor-pointer"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Cột phải - Đổi mật khẩu */}
                    <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition">
                        <h3 className="text-lg font-semibold text-gray-800 mb-6 border-b pb-2">
                            Đổi mật khẩu
                        </h3>

                        <form onSubmit={handlePasswordSubmit} className="space-y-5">
                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Mật khẩu cũ
                                </label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    value={passwordData.oldPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Mật khẩu mới
                                </label>
                                <input
                                    type="password"
                                    name="newPassword"
                                    value={passwordData.newPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 mb-1 font-medium">
                                    Xác nhận mật khẩu
                                </label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={passwordData.confirmPassword}
                                    onChange={handlePasswordChange}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400 outline-none"
                                />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    className="px-5 py-2 bg-rose-500 hover:bg-rose-600 text-white font-medium rounded-lg transition cursor-pointer"
                                >
                                    Đổi mật khẩu
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center">
                            <button
                                onClick={() => navigate("/patient/home")}
                                className="text-blue-600 hover:underline text-lg font-medium cursor-pointer"
                            >
                                ← Quay lại trang chủ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
