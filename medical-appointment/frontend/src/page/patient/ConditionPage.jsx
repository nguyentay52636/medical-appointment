export default function ConditionPage() {
    const termsSections = [
        {
            title: "1. Quy Định Chung",
            content: "Việc sử dụng dịch vụ của Klinik đồng nghĩa với việc bạn chấp nhận toàn bộ các điều khoản và điều kiện được nêu ra dưới đây. Các điều khoản này có thể được cập nhật bất cứ lúc nào mà không cần báo trước. Vui lòng kiểm tra thường xuyên để nắm được các thay đổi mới nhất.",
            points: [
                "Người dùng phải cung cấp thông tin cá nhân chính xác và đầy đủ.",
                "Nghiêm cấm mọi hành vi can thiệp hoặc gây ảnh hưởng đến hệ thống dịch vụ.",
                "Mọi tranh chấp sẽ được giải quyết dựa trên luật pháp Việt Nam."
            ]
        },
       {
            title: "2. Trách Nhiệm và Giới Hạn", 
            content: "Klinik cam kết cung cấp dịch vụ khám chữa bệnh chất lượng cao, nhưng chúng tôi không chịu trách nhiệm đối với các rủi ro phát sinh từ thông tin không chính xác do người dùng cung cấp hoặc các trường hợp bất khả kháng.",
            points: [
                "Klinik có quyền hủy bỏ lịch hẹn nếu người dùng không đến đúng giờ theo quy định.",
                "Chúng tôi không bảo đảm tính kịp thời của dịch vụ trong các trường hợp khẩn cấp (vui lòng liên hệ dịch vụ cấp cứu địa phương).",
                "Trách nhiệm tối đa của Klinik đối với mọi khiếu nại không vượt quá tổng chi phí dịch vụ mà người dùng đã thanh toán."
            ]
        },
        {
            title: "3. Bảo Mật Thông Tin Cá Nhân",
            content: "Klinik cam kết bảo mật thông tin cá nhân của người bệnh theo quy định của pháp luật. Thông tin chỉ được sử dụng cho mục đích y tế và quản lý dịch vụ, không được tiết lộ cho bên thứ ba trừ khi có yêu cầu từ cơ quan nhà nước có thẩm quyền.",
            points: [
                "Dữ liệu bệnh án được mã hóa và lưu trữ an toàn.",
                "Người dùng có quyền yêu cầu chỉnh sửa hoặc xóa thông tin cá nhân theo quy trình.",
                "Mọi yêu cầu về thông tin cá nhân phải được gửi qua kênh hỗ trợ chính thức của Klinik."
            ]
        }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-r from-white via-blue-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                
                <header className="text-center mb-12 border-b pb-6">
                    <h1 className="text-4xl font-extrabold text-blue-800">
                        Điều khoản & Điều kiện
                    </h1>
                    <p className="mt-4 text-lg text-gray-600">
                        Vui lòng đọc kỹ các quy định sau trước khi sử dụng dịch vụ của Klinik.
                    </p>
                </header>

                <main className="space-y-12">
                    {termsSections.map((section, index) => (
                        <section key={index} className="bg-gray-50 p-6 rounded-2xl shadow-lg border-l-4 border-blue-500 transition duration-300 hover:shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-3">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500 flex-shrink-0"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                                {section.title}
                            </h2>
                            <p className="text-gray-600 mb-4 leading-relaxed">{section.content}</p>
                            
                            <ul className="list-none space-y-2 mt-4">
                                {section.points.map((point, i) => (
                                    <li key={i} className="flex items-start text-gray-700">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 w-4 h-4 mt-1 mr-2 flex-shrink-0"><path d="M20 6 9 17l-5-5"/></svg>
                                        <span className="text-sm md:text-base">{point}</span>
                                    </li>
                                ))}
                            </ul>
                        </section>
                    ))}
                </main>

                <footer className="mt-12 pt-6 border-t text-center text-gray-500 text-sm">
                    <p>Cập nhật lần cuối: 31 tháng 10 năm 2025</p>
                </footer>
            </div>
        </div>
    );
}
