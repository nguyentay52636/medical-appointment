import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
    return (
        <footer className="w-full bg-gray-900 text-gray-300 pt-12 pb-12 animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {/* Cột 1: Thông tin liên hệ */}
                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Địa chỉ liên hệ</h5>
                        <p className="mb-3 flex items-start">
                            <i className="fa fa-map-marker-alt mr-3 text-blue-400 mt-1 flex-shrink-0"></i>
                            <span>273 An Dương Vương, Phường Chợ Quán, TP. HCM</span>
                        </p>
                        <p className="mb-3 flex items-center">
                            <i className="fa fa-phone-alt mr-3 text-blue-400"></i>
                            <a href="tel:0846777901" className="text-gray-300 hover:text-white transition font-medium">
                                (+84) 846 777 901
                            </a>
                        </p>
                        <p className="mb-3 flex items-center">
                            <i className="fa fa-envelope mr-3 text-blue-400"></i>
                            <span>klinik@gmail.com</span>
                        </p>

                        <div className="flex pt-2 space-x-2">
                            <a
                                className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-blue-600 hover:border-blue-600 transition"
                                href="https://www.facebook.com/klinik"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Facebook"
                            >
                                <i className="fab fa-facebook-f"></i>
                            </a>
                            <a
                                className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-gray-700 transition"
                                href="https://twitter.com/klinik"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Twitter"
                            >
                                <i className="fab fa-twitter"></i>
                            </a>
                            <a
                                className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-[#0A66C2] hover:border-[#0A66C2] transition"
                                href="https://www.linkedin.com/company/klinik"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="LinkedIn"
                            >
                                <i className="fab fa-linkedin-in"></i>
                            </a>
                            <a
                                className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-[#C13584] hover:border-[#C13584] transition"
                                href="https://www.instagram.com/klinik"
                                target="_blank"
                                rel="noreferrer"
                                aria-label="Instagram"
                            >
                                <i className="fab fa-instagram"></i>
                            </a>
                        </div>
                    </div>

                    {/* Cột 2: Các chuyên khoa */}
                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Các chuyên khoa</h5>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/specialty_detail?id=noi_khoa">Khoa Nội</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/specialty_detail?id=tim_mach">Khoa Tim mạch</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/specialty_detail?id=tai_mui_hong">Khoa Tai mũi họng</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/specialty_detail?id=da_lieu">Khoa Da liễu</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/specialty_detail?id=nhi_khoa">Khoa Nhi</Link>
                    </div>

                    {/* Cột 3: Liên kết nhanh */}
                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Liên kết nhanh</h5>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/about">Về chúng tôi</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/specialty">Chuyên khoa</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/doctor_list">Đội ngũ bác sĩ</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/contact">Liên hệ phòng khám</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/support">Hỗ trợ khách hàng</Link>
                        <Link className="block text-gray-300 hover:text-white transition duration-200 mb-2" to="/patient/condition">Điều khoản & Điều kiện</Link>
                        <Link className="block text-blue-400 hover:text-blue-300 transition duration-200 mb-2 font-medium" to="/doctor">Cổng Bác sĩ (Doctor Portal)</Link>
                        <Link className="block text-emerald-400 hover:text-emerald-300 transition duration-200 mb-2 font-medium" to="/admin/dashboard">Quản trị Phòng khám (Admin)</Link>
                    </div>

                    {/* Cột 4: Đăng ký nhận tin */}
                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Đăng ký nhận tin</h5>
                        <p className="text-gray-400 mb-4">Cập nhật thông tin y tế và khuyến mãi mới nhất từ phòng khám.</p>
                        <div className="relative max-w-sm mx-auto">
                            <input
                                className="w-full py-3 pl-4 pr-24 border border-gray-600 rounded-lg text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                type="email"
                                placeholder="Email của bạn"
                            />
                            <button
                                type="button"
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 absolute top-1.5 right-1.5 rounded-md transition duration-200 cursor-pointer"
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Copyright */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-700 pt-6 mt-6">
                <div className="text-center text-sm">
                    <div className="md:flex md:justify-between items-center">
                        <div className="text-center md:text-left mb-3 md:mb-0">
                            &copy; <Link className="border-b border-gray-500 hover:border-blue-400 hover:text-white" to="/patient/about">Klinik</Link>, Mọi quyền được bảo lưu.
                        </div>
                        <div className="text-center md:text-right">
                            Thiết kế bởi <span className="border-b border-gray-500 text-gray-400">AHQV Team</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}