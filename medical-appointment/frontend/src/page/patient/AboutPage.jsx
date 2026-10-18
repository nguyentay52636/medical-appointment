import { useState } from 'react';
import useFetch from "../../hook/useFetch";
import { fetchAllDoctor } from "../../service/doctorService";

export default function AboutPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);
    const { data: doctorsData = [], loading: doctorsLoading } = useFetch(
        fetchAllDoctor.getAllDoctors
    );

    const doctors = doctorsData || [];

    if (doctorsLoading) {
        return <div className="text-center py-20">Đang tải...</div>;
    }

    return (
        <div className="bg-gradient-to-r from-white via-blue-50 to-gray-100 min-h-screen flex flex-col items-center justify-start py-10 px-4 lg:px-20">

            <div className="max-w-7xl text-center mb-20">
                <h2 className="text-4xl font-extrabold text-blue-800 mb-6 leading-tight">
                    Tại sao nên tin tưởng Klinik?
                </h2>
                <p className="text-xl text-gray-600">
                    Klinik là nền tảng chăm sóc sức khỏe tiên tiến, kết nối bệnh nhân với đội ngũ bác sĩ chuyên khoa hàng đầu.
                    Chúng tôi cam kết mang lại trải nghiệm đặt lịch khám dễ dàng, nhanh chóng và an toàn.
                </p>
            </div>

            <div className="max-w-7xl flex flex-col lg:flex-row lg:gap-16 w-full">
                <div className="lg:w-1/2 flex flex-col justify-center mb-12 lg:mb-0">
                    <h3 className="text-2xl font-bold text-gray-800 border-l-4 border-blue-600 pl-4 mb-6">
                        Sứ mệnh của chúng tôi là mang dịch vụ y tế đến gần bạn hơn.
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Chúng tôi hiểu rằng thời gian của bạn là quý giá. Đó là lý do Klinik ra đời, loại bỏ những thủ tục rườm rà và thời gian chờ đợi lâu.
                        Đội ngũ chuyên gia của chúng tôi luôn sẵn sàng hỗ trợ, đảm bảo mọi thông tin y tế của bạn được bảo mật tuyệt đối.
                    </p>

                    <div className="space-y-4 mb-8 text-gray-700 font-medium">
                        <p className="flex items-start"><i className="fas fa-check-circle text-blue-600 mr-3 mt-1 text-xl"></i>Chăm sóc sức khỏe chất lượng cao, tiếp cận dễ dàng.</p>
                        <p className="flex items-start"><i className="fas fa-check-circle text-blue-600 mr-3 mt-1 text-xl"></i>Đội ngũ Bác sĩ chuyên môn được cấp phép.</p>
                        <p className="flex items-start"><i className="fas fa-check-circle text-blue-600 mr-3 mt-1 text-xl"></i>Quy trình đặt lịch và hỗ trợ tận tâm 24/7.</p>
                    </div>

                    <button
                        onClick={openModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full py-4 px-10 shadow-lg transition transform hover:scale-105 self-start cursor-pointer"
                    >
                        Tìm hiểu thêm về đội ngũ
                    </button>
                </div>

                <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    <FeatureBox icon="fas fa-user-md" title="100+ Bác sĩ Chuyên khoa" description="Tuyển chọn nghiêm ngặt, đảm bảo kinh nghiệm và chuyên môn sâu rộng." />
                    <FeatureBox icon="fas fa-clinic-medical" title="Cơ sở vật chất Hiện đại" description="Áp dụng công nghệ tiên tiến để chẩn đoán và điều trị chính xác." />
                    <FeatureBox icon="fas fa-lock" title="Bảo mật Thông tin Tuyệt đối" description="Tuân thủ nghiêm ngặt các quy định bảo mật dữ liệu y tế quốc tế." />
                    <FeatureBox icon="fas fa-heartbeat" title="Hỗ trợ Khẩn cấp 24/7" description="Đội ngũ trực tuyến luôn sẵn sàng giải đáp và hỗ trợ kịp thời." />
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
                    <div className="bg-white rounded-2xl p-10 w-[60%] shadow-2xl relative overflow-y-auto max-h-[85vh] animate-fadeIn">
                        <button
                            onClick={closeModal}
                            className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl cursor-pointer"
                        >
                            <i className="fas fa-times"></i>
                        </button>
                        <h3 className="text-2xl font-bold text-blue-700 mb-6 text-center">Đội ngũ Bác sĩ của Klinik</h3>
                        <p className="text-gray-600 mb-8 text-center">
                            Gặp gỡ các bác sĩ chuyên khoa hàng đầu, tận tâm chăm sóc sức khỏe của bạn.
                        </p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6">
                            {doctors.map((d) => (
                                <DoctorCard
                                    key={d.id}
                                    name={d.fullName}
                                    specialty={d.specialtyName}
                                    image={d.imageUrl}  
                                />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const FeatureBox = ({ icon, title, description }) => (
    <div className="bg-white p-6 rounded-2xl shadow-lg border-t-4 border-blue-600 transition duration-300 transform hover:shadow-2xl hover:-translate-y-2">
        <i className={`${icon} text-4xl text-blue-600 mb-4`}></i>
        <h4 className="text-xl font-bold text-gray-900 mb-3">{title}</h4>
        <p className="text-gray-500">{description}</p>
    </div>
);

const DoctorCard = ({ name, specialty, image }) => (
    <div className="bg-gray-50 p-6 rounded-2xl shadow-md hover:shadow-xl transition transform hover:-translate-y-1 text-center">
        <img src={image} alt={name} className="w-28 h-28 rounded-full mx-auto mb-4 object-cover" />
        <h4 className="text-lg font-semibold text-gray-800">{name}</h4>
        <p className="text-sm text-gray-500">{specialty}</p>
    </div>
);
