import { useState, useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import useFetch from "../../hook/useFetch";
import { fetchDoctorsBySpecialtyId } from '../../service/doctorService';

const slugToSpecialtyId = {
    noi_khoa: 1,
    tim_mach: 2,
    tai_mui_hong: 3,
    da_lieu: 4,
    nhi_khoa: 5,
};

const allSpecialtyDetails = {
    "noi_khoa": {
        slug: "noi_khoa",
        icon: "fa-solid fa-user-md",
        title: "Chuyên khoa Nội khoa",
        subtitle: "Chẩn đoán và điều trị các bệnh lí bên trong cơ thể, không phẫu thuật.",
        description: "Nội khoa tập trung vào việc chẩn đoán và điều trị các bệnh lý nội tạng mà không cần phẫu thuật. Các bác sĩ sẽ đánh giá tổng quát chức năng các cơ quan và điều trị các tình trạng mãn tính như tiểu đường, cao huyết áp, và các vấn đề chuyển hóa.",
        treatments: [
            "Khám sức khỏe tổng quát",
            "Điều trị bệnh nội tổng hợp",
            "Quản lý bệnh tiểu đường",
            "Điều trị rối loạn chuyển hóa",
            "Kiểm tra định kỳ"
        ],
        color: "bg-blue-100 text-blue-700",
    },
    "tim_mach": {
        slug: "tim_mach",
        icon: "fa-solid fa-heart-pulse",
        title: "Chuyên khoa Tim mạch",
        subtitle: "Chuyên điều trị bệnh tim và hệ mạch máu.",
        description: "Chuyên sâu về quản lý bệnh tim mạch như suy tim, bệnh mạch vành, tăng huyết áp, rối loạn nhịp tim,... áp dụng các phương pháp hiện đại và cá nhân hóa.",
        treatments: [
            "Điều trị tăng huyết áp",
            "Theo dõi rối loạn nhịp tim",
            "Tư vấn bệnh mạch vành",
            "Khám suy tim",
        ],
        color: "bg-red-100 text-red-700",
    },
    "tai_mui_hong": {
        slug: "tai_mui_hong",
        icon: "fa-solid fa-ear-listen",
        title: "Chuyên khoa Tai Mũi Họng",
        subtitle: "Chẩn đoán và điều trị các bệnh tai, mũi, họng và vùng cổ.",
        description: "Điều trị các bệnh lý viêm nhiễm tai mũi họng, dị ứng, polyp mũi và nhiều bệnh lý vùng đầu cổ.",
        treatments: [
            "Khám viêm mũi dị ứng",
            "Điều trị viêm họng mãn tính",
            "Soi tai mũi họng",
        ],
        color: "bg-indigo-100 text-indigo-700",
    },
    "da_lieu": {
        slug: "da_lieu",
        icon: "fa-solid fa-wand-magic-sparkles",
        title: "Chuyên khoa Da liễu",
        subtitle: "Khám và điều trị bệnh lý da, tóc, móng và dị ứng da.",
        description: "Điều trị các bệnh lý liên quan đến da như mụn trứng cá, nám, viêm da, dị ứng, nấm,...",
        treatments: [
            "Điều trị mụn",
            "Điều trị nám",
            "Điều trị viêm da cơ địa",
        ],
        color: "bg-yellow-100 text-yellow-700",
    },
    "nhi_khoa": {
        slug: "nhi_khoa",
        icon: "fa-solid fa-baby",
        title: "Chuyên khoa Nhi khoa",
        subtitle: "Chăm sóc sức khỏe trẻ em từ sơ sinh đến thiếu niên.",
        description: "Khám nhi tổng quát, tiêm chủng, điều trị các bệnh lý thường gặp ở trẻ em như sốt, ho, tiêu chảy,…",
        treatments: [
            "Theo dõi phát triển trẻ",
            "Điều trị bệnh hô hấp cho trẻ",
            "Khám tiêu hóa cho trẻ",
        ],
        color: "bg-lime-100 text-lime-700",
    },
};

// --- COMPONENTS ---

const DoctorCard = (props) => (
    <div className="flex items-center space-x-4 p-4 bg-blue-50/70 rounded-lg transition duration-300 hover:shadow-md">
        <img src={props.image} alt={props.name} className="w-16 h-16 rounded-full object-cover border-2 border-blue-400" />
        <div>
            <p className="font-bold text-gray-800">{props.name}</p>
            <p className="text-sm text-blue-600 italic">{props.specialty}</p>
        </div>
    </div>
);

// Component cho thẻ chuyên khoa khác (dùng trong thanh lướt)
const OtherSpecialtyCard = ({ specialty }) => (
    <a
        href={`/patient/specialty_detail?id=${specialty.slug}`}
        className="flex-shrink-0 w-64 h-60 p-5 bg-white rounded-xl shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 cursor-pointer border border-gray-100 flex flex-col justify-between"
    >
        <div>
            <div className={`p-3 w-fit rounded-full ${specialty.color} mb-3`}>
                <i className={`${specialty.icon} text-xl`}></i>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-1">{specialty.title.replace('Chuyên khoa ', '')}</h3>
            <p className="text-gray-600 text-sm line-clamp-2">{specialty.subtitle}</p>
        </div>
        <div className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm transition duration-150 text-left">
            Xem chi tiết &rarr;
        </div>
    </a>
);


// --- HELPERS ---

const getSpecialtyDetailsBySlug = (slug) => {
    return allSpecialtyDetails[slug] || allSpecialtyDetails["noi_khoa"];
}

const getOtherSpecialties = (currentSlug) => {
    return Object.values(allSpecialtyDetails).filter(s => s.slug !== currentSlug);
}


// --- MAIN COMPONENT ---

export default function SpecialtyDetailPage() {
    const urlParams = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
    const currentSlug = urlParams.get('id') || "noi_khoa";

    const specialtyId = slugToSpecialtyId[currentSlug];
    const apiCall = useCallback(
        () => fetchDoctorsBySpecialtyId.getDoctorsBySpecialtyId(specialtyId),
        [specialtyId]
    );

    const { data: doctors, loading, error, refetch } = useFetch(apiCall, [specialtyId]);

    if (loading) return <p>Đang tải bác sĩ...</p>;
    if (error) return <p className="text-red-600">Lỗi tải dữ liệu bác sĩ</p>;

    const specialty = getSpecialtyDetailsBySlug(currentSlug);
    const otherSpecialties = getOtherSpecialties(currentSlug);

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
    const closeMenu = () => setIsMenuOpen(false);
    const navigate = useNavigate();

    const handleBookingClick = () => {
        closeMenu();

        const token = sessionStorage.getItem("patient");
        if (!token) {
            // hiện popup form login/register
            setShowAuthModal(true);
            return;
        }

        navigate("/patient/booking", { state: { specialtySlug: currentSlug } });
    };

    if (!specialty) {
        return (
            <div className="text-center py-20 text-xl text-red-600">
                Không tìm thấy thông tin chuyên khoa này.
            </div>
        );
    }

    return (
        <div className="bg-gradient-to-r from-white via-blue-50 to-gray-100 py-16 lg:py-24 font-sans min-h-screen">
            <style>{`
                .hide-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .hide-scrollbar {
                    -ms-overflow-style: none;  
                    scrollbar-width: none;  
                }
            `}</style>

            <button
                onClick={toggleMenu}
                className="lg:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-expanded={isMenuOpen}
            >
                {isMenuOpen ? (
                    <i className="fa fa-times text-2xl"></i>
                ) : (
                    <i className="fa fa-bars text-2xl"></i>
                )}
            </button>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="bg-white p-8 rounded-xl shadow-2xl border-l-8 border-blue-600 mb-12">
                    <div className="flex items-center space-x-6">
                        <div className={`w-20 h-20 flex items-center justify-center bg-blue-100 rounded-full flex-shrink-0`}>
                            <i className={`${specialty.icon} text-5xl text-blue-600`}></i>
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-blue-600 uppercase">Chuyên khoa</p>
                            <h1 className="text-4xl font-extrabold text-gray-800 leading-tight mt-1">
                                {specialty.title}
                            </h1>
                            <p className="text-lg text-gray-600 mt-2">{specialty.subtitle}</p>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white p-8 rounded-xl shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
                                Tổng quan
                            </h2>
                            <p className="text-lg text-gray-700 leading-relaxed">
                                {specialty.description}
                            </p>
                            <p className="mt-4 text-md italic text-gray-500">
                                Chúng tôi cam kết mang lại chất lượng khám chữa bệnh tốt nhất, lấy bệnh nhân làm trung tâm.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-xl">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
                                Phạm vi Điều trị
                            </h2>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 text-lg text-gray-700">
                                {specialty.treatments.map((treatment, index) => (
                                    <li key={index} className="flex items-start">
                                        <svg className="w-5 h-5 text-blue-600 mt-1 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                        {treatment}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="lg:col-span-1 space-y-10">

                        <div className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-500">
                            <h3 className="text-2xl font-bold text-gray-800 mb-4 pb-2 border-b">
                                Bác sĩ chuyên gia
                            </h3>
                            <div className="space-y-4 overflow-y-auto">
                                {doctors?.map((doctor) => (
                                    <DoctorCard
                                        key={doctor.id}
                                        name={doctor.fullName}
                                        specialty={doctor.specialtyName}
                                        image={doctor.imageUrl}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="p-6 rounded-xl bg-blue-600 text-white text-center shadow-2xl">
                            <h3 className="text-2xl font-bold mb-3">
                                Đặt lịch khám bệnh ngay
                            </h3>
                            <p className="text-blue-200 mb-6">
                                Liên hệ với chúng tôi để được tư vấn và đặt lịch với chuyên gia.
                            </p>
                            <button
                                onClick={handleBookingClick}
                                className="block text-center w-full py-3 bg-white text-blue-600 font-bold rounded-full shadow-lg hover:bg-gray-100 transition duration-300 transform hover:scale-[1.02] cursor-pointer"
                            >
                                <i className="fas fa-calendar-check mr-2"></i>
                                ĐẶT LỊCH ONLINE
                            </button>
                            <p className="mt-4 text-sm text-blue-300">
                                Hoặc gọi: (+84) 901 234 567
                            </p>
                        </div>
                    </div>
                </div>

                {otherSpecialties.length > 0 && (
                    <section className="mt-16 pt-8 max-w-7xl mx-auto relative">
                        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 border-l-4 border-blue-500 pl-3">
                            Các Chuyên Khoa Khác
                        </h2>

                        <div className="relative">
                            {/* Nút trái */}
                            <button
                                onClick={() => {
                                    document.getElementById("scrollContainer").scrollBy({
                                        left: -300,
                                        behavior: "smooth",
                                    });
                                }}
                                className="absolute left-[-60px] top-1/3 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition z-10 cursor-pointer"
                            >
                                <i className="fas fa-chevron-left text-blue-600"></i>
                            </button>

                            {/* Vùng cuộn các thẻ chuyên khoa */}
                            <div
                                id="scrollContainer"
                                className="flex space-x-6 overflow-x-scroll pb-4 hide-scrollbar h-[20rem] items-start scroll-smooth"
                            >
                                {otherSpecialties.map((spec, index) => (
                                    <OtherSpecialtyCard key={index} specialty={spec} />
                                ))}
                                <div className="flex-shrink-0 w-4"></div>
                            </div>

                            {/* Nút phải */}
                            <button
                                onClick={() => {
                                    document.getElementById("scrollContainer").scrollBy({
                                        left: 300,
                                        behavior: "smooth",
                                    });
                                }}
                                className="absolute right-[-60px] top-1/3 transform -translate-y-1/2 bg-white shadow-lg rounded-full p-3 hover:bg-gray-100 transition z-10 cursor-pointer"
                            >
                                <i className="fas fa-chevron-right text-blue-600"></i>
                            </button>
                        </div>
                    </section>
                )}

                {showAuthModal && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
                        <div className="relative bg-white p-6 rounded-xl w-[420px] shadow-2xl animate-fadeIn">

                            <button
                                onClick={() => setShowAuthModal(false)}
                                className="absolute right-0 top-0 w-8 h-8 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white text-gray-600 flex items-center justify-center transition cursor-pointer"
                            >
                                ✕
                            </button>

                            <h2 className="text-xl font-bold text-center mb-6">
                                Bạn cần đăng nhập trước khi đặt lịch
                            </h2>

                            <button
                                className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 cursor-pointer hover:bg-blue-700 transition"
                                onClick={() => window.location.href = "/patient/login"}
                            >
                                Đăng nhập
                            </button>

                            <button
                                className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition"
                                onClick={() => window.location.href = "/patient/register"}
                            >
                                Đăng ký
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
