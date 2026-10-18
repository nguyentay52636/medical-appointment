export default function ContactPage() {
    return (
        <div className="bg-gradient-to-r from-white via-blue-50 to-gray-100 py-16 lg:py-10 font-sans min-h-screen">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16 lg:mb-20">
                    <h2 className="mb-4 text-4xl font-extrabold text-blue-800 leading-tight">
                        Liên hệ phòng khám Klinik
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Chúng tôi luôn sẵn sàng hỗ trợ bạn. Vui lòng liên hệ qua các kênh dưới đây.
                    </p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    
                    <div className="lg:col-span-1 space-y-8">
                        <div className="bg-white p-8 rounded-xl shadow-2xl border-t-4 border-blue-600 h-full">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">
                                Thông tin liên hệ chính
                            </h3>
                            <div className="space-y-6 text-gray-700">
                                
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                                    <div>
                                        <p className="font-semibold text-gray-800">Địa chỉ Phòng khám</p>
                                        <p>273 An Dương Vương, Phường Chợ Quán, TP. HCM</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                                    <div>
                                        <p className="font-semibold text-gray-800">Số Điện thoại</p>
                                        <p className="text-blue-600 font-bold text-lg">(+84) 901 234 567</p>
                                        <p className="text-sm text-gray-500">Đặt lịch & Hỗ trợ khẩn cấp</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-start">
                                    <svg className="w-6 h-6 text-blue-600 mt-1 mr-4 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                                    <div>
                                        <p className="font-semibold text-gray-800">Email Hỗ trợ</p>
                                        <p>klinik@gmail.com</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white p-8 rounded-xl shadow-lg border-l-4 border-blue-500">
                            <h3 className="text-xl font-bold text-gray-800 mb-6">
                                Giờ Làm Việc
                            </h3>
                            <ul className="space-y-3 text-lg text-gray-700">
                                <li className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-800">Thứ Hai - Thứ Sáu:</span>
                                    <span className="text-blue-600 font-bold">08:00 - 17:00</span>
                                </li>
                                <li className="flex justify-between border-b pb-2">
                                    <span className="font-medium text-gray-800">Thứ Bảy:</span>
                                    <span className="text-blue-600 font-bold">08:00 - 12:00</span>
                                </li>
                                <li className="flex justify-between">
                                    <span className="font-medium text-gray-800">Chủ Nhật:</span>
                                    <span className="text-red-500 font-bold">Nghỉ (Khám Khẩn cấp theo hẹn)</span>
                                </li>
                            </ul>
                            <p className="mt-4 text-sm text-gray-500 italic">
                                Vui lòng đặt lịch hẹn trước để đảm bảo được phục vụ tốt nhất.
                            </p>
                        </div>
                        
                        <div className="bg-white p-6 rounded-xl shadow-2xl">
                            <h4 className="text-xl font-bold text-gray-800 mb-4">Vị trí trên Bản đồ</h4>
                            <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
                                <iframe
                                    title="Klinik Map"
                                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.794216372469!2d106.68883741526053!3d10.770142062278272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752936f1a11e0d%3A0x7c1d8a14c682d8e1!2s273%20An%20D%C6%B0%C6%A1ng%20V%C6%B0%C6%A1ng%2C%20Ph%C6%B0%E1%BB%9Dng%20Ch%C3%B4%20Qu%C3%A1n%2C%20Qu%E1%BA%ADn%205%2C%20TP.%20HCM!5e0!3m2!1sen!2s!4v1709323534321!5m2!1sen!2s"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen=""
                                    loading="lazy"
                                    referrerPolicy="no-referrer-when-downgrade"
                                ></iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
