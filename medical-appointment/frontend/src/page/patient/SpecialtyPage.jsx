import useFetch from "../../hook/useFetch";
import { specialtyService } from "../../service/specialtyService";

const SpecialtyCard = ({ icon, title, description, slug }) => {
    const iconClass = `transition duration-300`;
    const hoverClass = `group-hover:text-blue-700`;
    const detailUrl = `/patient/specialty_detail?id=${slug}`;

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-blue-600 group hover:shadow-2xl transition duration-300 transform hover:-translate-y-2 cursor-pointer">
            <div className={`w-16 h-16 flex items-center justify-center bg-blue-100 rounded-full mb-6 transition duration-300 group-hover:bg-blue-200`}>

                <i className={`${icon} ${iconClass} ${hoverClass} text-4xl text-blue-600`}></i>

            </div>

            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition duration-300">
                {title}
            </h4>
            <p className="text-gray-600 leading-relaxed">
                {description}
            </p>

            <a href={detailUrl} className={`mt-4 inline-block font-semibold text-sm text-blue-600 group-hover:text-blue-800 transition duration-300`}>
                Xem chi tiết <i className="fas fa-arrow-right ml-1"></i>
            </a>
        </div>
    );
};

export default function SpecialtyPage() {
    const iconMap = {
        "Nội khoa": "fa-solid fa-user-md",
        "Tim mạch": "fa-solid fa-heart-pulse",
        "Tai Mũi Họng": "fa-solid fa-ear-listen",
        "Da liễu": "fa-solid fa-wand-magic-sparkles",
        "Nhi khoa": "fa-solid fa-baby",
    };

    const { data: specialtiesData = [], loading: specialtiesLoading } = useFetch(
        specialtyService.getAllSpecialties
    );

    if (specialtiesLoading) {
        return <div className="text-center py-20">Đang tải...</div>;
    }

    return (
        <div className="bg-gradient-to-r from-white via-blue-50 to-gray-100 py-16 lg:py-10 font-sans">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                <div className="text-center mb-16 lg:mb-20">
                    <h2 className="mb-4 text-4xl font-extrabold text-blue-800 leading-tight">
                        Chọn đúng Chuyên khoa bạn cần thăm khám
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Phòng khám cung cấp dịch vụ khám bệnh chuyên sâu, tận tâm cho đa dạng các lĩnh vực y tế phổ biến.
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                    {(specialtiesData || []).map((item) => (
                        <SpecialtyCard
                            key={item.id}
                            icon={iconMap[item.specialtyName] || "fa-solid fa-user-md"}
                            title={item.specialtyName}
                            description={item.description}
                            slug={item.specialtyName
                                .normalize("NFD")
                                .replace(/\p{Diacritic}/gu, '')
                                .replace(/\s+/g, '_')
                                .toLowerCase()
                            }
                        />
                    ))}
                </div>

            </div>
        </div>
    );
}
