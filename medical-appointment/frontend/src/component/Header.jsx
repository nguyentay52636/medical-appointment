import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { PatientContext } from "../context/PatientContext.jsx";

export default function Header() {
    const { patient, logout } = useContext(PatientContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        const confirmLogout = window.confirm("Bạn có chắc muốn đăng xuất không?");
        if (confirmLogout) {
            logout();
            navigate("/patient/home");
        }
    };

    const fullName = patient?.fullName || "";

    return (
        <div className="w-full bg-gray-50 sticky top-0 z-50 border-b border-gray-100 p-0 animate-fadeIn">
            <div className="flex flex-row flex-wrap -mx-0 lg:flex mx-auto px-4 sm:px-6 lg:px-8 h-10 lg:h-12 items-center justify-between">

                <div className="w-full lg:w-4/12 text-left flex flex-wrap items-center h-full">
                    <div className="h-full inline-flex items-center py-0 mr-6">
                        <small className="fa fa-map-marker-alt text-blue-600 mr-2 text-sm"></small>
                        <small className="text-gray-600 text-xs hidden sm:block">273 An Dương Vương, TP. HCM</small>
                        <small className="text-gray-600 text-xs sm:hidden">TP. HCM</small>
                    </div>
                    <div className="h-full inline-flex items-center py-0">
                        <small className="far fa-clock text-blue-600 mr-2 text-sm"></small>
                        <small className="text-gray-600 text-xs hidden md:block">T2 - T6: 08:00 - 17:00, T7: 08:00 - 12:00</small>
                    </div>
                </div>

                <div className="w-full lg:w-8/12 text-right flex flex-wrap items-start justify-end h-full">
                    {fullName && (
                        <div className="h-full inline-flex items-center py-0 mr-6 space-x-2">
                            <small className="text-gray-700 font-semibold text-sm">
                                Xin chào, <strong>{fullName}!</strong>
                            </small>

                            {/* Nút Đăng xuất */}
                            <button
                                onClick={handleLogout}
                                className="px-2 py-1 text-sm font-medium bg-red-500 hover:bg-red-600 text-white rounded transition cursor-pointer"
                            >
                                <i className="fas fa-sign-out-alt"></i> Đăng xuất
                            </button>

                            {/* Nút cập nhật thông tin cá nhân và đổi mật khẩu* */}
                            <button
                                onClick={() => navigate("/patient/info")}
                                className="px-2 py-1 text-sm font-medium bg-blue-500 hover:bg-blue-600 text-white rounded transition flex items-center gap-1 cursor-pointer"
                            >
                                <i className="fas fa-user"></i> Thông Tin Cá Nhân
                            </button>

                            {/* Nút Lịch Sử Đặt Lịch */}
                            <button
                                onClick={() => navigate("/patient/booking_history")}
                                className="px-2 py-1 text-sm font-medium bg-gray-500 hover:bg-gray-600 text-white rounded transition cursor-pointer flex items-center gap-1"
                            >
                                <i className="fas fa-history"></i> Lịch Sử Đặt Lịch
                            </button>
                        </div>
                    )}

                    <div className="h-full inline-flex items-center py-0 mr-4">
                        <small className="fa fa-phone-alt text-blue-600 mr-2 text-sm"></small>
                        <small className="text-gray-700 font-semibold text-xs">(+84) 846 777 901</small>
                    </div>

                    <div className="h-full inline-flex items-center space-x-1 lg:space-x-2">
                        <a className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center hover:bg-[#166FE5]"
                            href="https://www.facebook.com/klinik" aria-label="Facebook">
                            <i className="fab fa-facebook-f text-sm"></i>
                        </a>
                        <a className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center hover:bg-gray-800"
                            href="https://twitter.com/klinik" aria-label="Twitter">
                            <i className="fab fa-twitter text-sm"></i>
                        </a>
                        <a className="w-8 h-8 rounded-full bg-[#0A66C2] text-white flex items-center justify-center hover:bg-[#0959A5] hidden sm:flex"
                            href="https://www.linkedin.com/company/klinik" aria-label="LinkedIn">
                            <i className="fab fa-linkedin-in text-sm"></i>
                        </a>
                        <a className="w-8 h-8 rounded-full bg-[#C13584] text-white flex items-center justify-center hover:bg-[#A93174]"
                            href="https://www.instagram.com/klinik" aria-label="Instagram">
                            <i className="fab fa-instagram text-sm"></i>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
