import { useContext, useState, useEffect } from "react";
import { DoctorContext } from "../../context/DoctorContext";
import { changePasswordDoctor } from '../../service/doctorService';
import { useNavigate } from "react-router-dom";

export default function ChangePassword() {
    const { doctor, changePassword } = useContext(DoctorContext);

    if (!doctor) {
        return (
            <div className="text-center p-6 text-lg font-medium text-red-600 bg-red-50 border rounded-xl shadow-md">
                Không tìm thấy thông tin bác sĩ.
            </div>
        );
    }

    const navigate = useNavigate();

    const [passwordData, setPasswordData] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handlePasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData((prev) => ({ ...prev, [name]: value }));
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
            const updated = await changePasswordDoctor.changePassword(doctor.id, {
                oldPassword: passwordData.oldPassword,
                newPassword: passwordData.newPassword
            });

            changePassword({ ...doctor, ...updated });
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
                            onClick={() => navigate("/doctor/dashboard")}
                            className="text-blue-600 hover:underline text-lg font-medium cursor-pointer"
                        >
                            ← Quay lại trang chính
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
