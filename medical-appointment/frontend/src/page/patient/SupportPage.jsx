import React from 'react';
import AssistantAI from './AsistantAI';

const faqs = [
    {
        question: "1. Làm thế nào để đặt lịch khám?",
        answer: "Bạn có thể đặt lịch khám trực tuyến qua form Đặt Lịch trên trang web, hoặc gọi trực tiếp đến số điện thoại hỗ trợ của chúng tôi để được hướng dẫn."
    },
    {
        question: "2. Klinik có chấp nhận bảo hiểm y tế không?",
        answer: "Hiện tại, Klinik đang làm việc với các đối tác bảo hiểm lớn. Vui lòng liên hệ bộ phận hỗ trợ để kiểm tra chính sách bảo hiểm cụ thể của bạn trước khi đến khám."
    },
    {
        question: "3. Tôi cần chuẩn bị gì khi đi khám?",
        answer: "Vui lòng mang theo các giấy tờ tùy thân (CMND/CCCD), thẻ bảo hiểm (nếu có), và các kết quả xét nghiệm, đơn thuốc cũ (nếu có) để bác sĩ tiện theo dõi."
    },
    {
        question: "4. Nếu tôi muốn hủy hoặc đổi lịch hẹn?",
        answer: "Để hủy hoặc đổi lịch, vui lòng gọi điện thoại thông báo cho chúng tôi ít nhất 4 giờ trước giờ hẹn đã đặt. Điều này giúp chúng tôi sắp xếp lại lịch khám cho các bệnh nhân khác."
    },
];

const FAQItem = ({ question, answer, index }) => {
    const [isOpen, setIsOpen] = React.useState(index === 0);

    return (
        <div className="border-b border-gray-200 py-4">
            <button
                className="flex justify-between items-center w-full text-left font-semibold text-lg text-gray-800 hover:text-blue-600 transition duration-300"
                onClick={() => setIsOpen(!isOpen)}
            >
                {question}
                <svg 
                    className={`w-5 h-5 transition-transform duration-300 ${isOpen ? 'transform rotate-180 text-blue-600' : 'text-gray-500'}`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth="2"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <p className="mt-3 text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-lg border-l-4 border-blue-200">
                    {answer}
                </p>
            )}
        </div>
    );
};

export default function SupportPage() {
    const [showChat, setShowChat] = React.useState(false);

    return (
        <div className="min-h-screen bg-gradient-to-r from-white via-blue-50 to-gray-100">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <header className="text-center mb-12 border-b pb-6">
                        <h1 className="text-4xl font-extrabold text-blue-800">
                            Trung tâm hỗ trợ khách hàng
                        </h1>
                        <p className="mt-4 text-lg text-gray-600">
                            Mọi thắc mắc của bạn sẽ được giải đáp nhanh chóng.
                        </p>
                    </header>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        
                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
                            <svg className="w-8 h-8 mx-auto text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                            <h3 className="font-bold text-xl text-gray-800">Gọi điện</h3>
                            <p className="text-blue-600 font-semibold text-lg mt-1">(+84) 901 234 567</p>
                            <p className="text-sm text-gray-500">Hỗ trợ 24/7</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
                            <svg className="w-8 h-8 mx-auto text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                            <h3 className="font-bold text-xl text-gray-800">Email</h3>
                            <p className="text-blue-600 font-semibold text-lg mt-1">klinik@gmail.com</p>
                            <p className="text-sm text-gray-500">Chúng tôi trả lời trong vòng 24h</p>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md text-center border-t-4 border-blue-500 hover:shadow-xl transition duration-300">
                            <svg className="w-8 h-8 mx-auto text-blue-500 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                            <h3 className="font-bold text-xl text-gray-800">Địa chỉ</h3>
                            <p className="text-blue-600 font-semibold text-lg mt-1">273 An Dương Vương, TP. HCM</p>
                            <p className="text-sm text-gray-500">Làm việc T2 - T6</p>
                        </div>
                    </section>
                    
                    <section className="bg-white p-8 rounded-2xl shadow-xl">
                        <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center border-b pb-4">
                            CÂU HỎI THƯỜNG GẶP 
                        </h2>
                        
                        <div className="space-y-4">
                            {faqs.map((faq, index) => (
                                <FAQItem key={index} question={faq.question} answer={faq.answer} index={index} />
                            ))}
                        </div>

                        <div className="mt-10 text-center">
                            <p className="text-lg text-gray-700 mb-4">
                                Bạn vẫn chưa tìm thấy câu trả lời?
                            </p>
                            <button
                                onClick={() => setShowChat(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg transition duration-300 transform hover:scale-[1.01] cursor-pointer"
                            >
                                <svg className="w-5 h-5 inline mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>
                                Gửi yêu cầu hỗ trợ chi tiết
                            </button>
                        </div>
                    </section>

                    {showChat && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center">
                            <div className="fixed inset-0 bg-black opacity-40" onClick={() => setShowChat(false)} />
                            <div className="relative w-full max-w-4xl h-[80vh] bg-transparent p-4">
                                <div className="h-full bg-white rounded-2xl shadow-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-4 py-3 border-b">
                                        <h3 className="text-lg font-semibold">Trợ lý AI</h3>
                                        <button onClick={() => setShowChat(false)} className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded">
                                            ✕
                                        </button>
                                    </div>
                                    <div className="h-[calc(100%-56px)]">
                                        <AssistantAI embedded={true} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
