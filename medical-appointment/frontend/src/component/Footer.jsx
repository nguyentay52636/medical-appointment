
export default function Footer() {
    return (
        <div className="w-full bg-gray-900 text-gray-300 pt-12 pb-12 animate-fadeIn">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Địa chỉ liên hệ</h5>
                        <p className="mb-3 flex items-center"><i className="fa fa-map-marker-alt mr-3 text-blue-400"></i>273 An Dương Vương, Phường Chợ Quán, TP. HCM</p>
                        <p className="mb-3 flex items-center"><i className="fa fa-envelope mr-3 text-blue-400"></i>klinik@gmail.com</p>

                        <div className="flex pt-2 space-x-2">
                            <a className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-gray-700 transition" href="https://www.facebook.com/klinik"><i className="fab fa-facebook-f"></i></a>
                            <a className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-gray-700 transition" href="https://twitter.com/klinik"><i className="fab fa-twitter"></i></a>
                            <a className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-gray-700 transition" href="https://www.linkedin.com/company/klinik"><i className="fab fa-linkedin-in"></i></a>
                            <a className="w-10 h-10 flex items-center justify-center border border-gray-400 text-white rounded-full hover:bg-gray-700 transition" href="https://www.instagram.com/klinik"><i className="fab fa-instagram"></i></a>
                        </div>
                    </div>

                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Các chuyên khoa</h5>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/specialty_detail?id=noi_khoa">Khoa Nội</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/specialty_detail?id=tim_mach">Khoa Tim mạch</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/specialty_detail?id=tai_mui_hong">Khoa Tai mũi họng</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/specialty_detail?id=da_lieu">Khoa Da liễu</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/specialty_detail?id=nhi_khoa">Khoa Nhi</a>
                    </div>

                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Liên kết nhanh</h5>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/about">Về chúng tôi</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/specialty">Chuyên khoa</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/doctor_list">Đội ngũ bác sĩ</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/contact">Liên hệ phòng khám</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/support">Hỗ trợ khách hàng</a>
                        <a className="block text-gray-300 hover:text-white transition duration-200 mb-2" href="/patient/condition">Điều khoản & Điều kiện</a>
                    </div>
                    <div className="lg:col-span-1 md:col-span-1">
                        <h5 className="text-white text-xl font-semibold mb-4">Đăng ký nhận tin</h5>
                        <p className="text-gray-400 mb-4">Cập nhật thông tin y tế và khuyến mãi mới nhất từ phòng khám.</p>
                        <div className="relative max-w-sm mx-auto">
                            <input className="w-full py-3 pl-4 pr-16 border-3 rounded-lg text-white-800 focus:ring-0 focus:outline-none" type="text" placeholder="Email của bạn" />
                            <button type="button" className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 absolute top-2 right-2 rounded-lg transition duration-200 cursor-pointer">Đăng ký</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-gray-700 pt-6 mt-6">
                <div className="text-center text-sm">
                    <div className="md:flex md:justify-between items-center">
                        <div className="text-center md:text-left mb-3 md:mb-0">
                            &copy; <a className="border-b border-gray-500 hover:border-blue-400" href="/patient/about">Klinik</a>, Mọi quyền được bảo lưu.
                        </div>
                        <div className="text-center md:text-right">
                            Thiết kế bởi <a className="border-b border-gray-500 hover:border-blue-400" href="https://htmlcodex.com">AHQV Team</a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}