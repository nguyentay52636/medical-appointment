import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/banner_1.jpg';
import banner2 from '../../assets/banner_2.png';
import banner3 from '../../assets/banner_3.png';

const banners = [
  { title: "Đặt Lịch Khám Ngay", subtitle: "Nhanh chóng, tiện lợi, an toàn", image: banner1 },
  { title: "Khám Bệnh An Toàn", subtitle: "Quy trình nhanh chóng, thông tin bảo mật", image: banner3 },
  { title: "Hỗ Trợ 24/7", subtitle: "Luôn đồng hành cùng sức khỏe của bạn", image: banner2 },
];

const services = [
  { icon: "fa-solid fa-user-doctor", title: "Khám theo chuyên khoa", description: "Lựa chọn đúng bác sĩ theo từng chuyên ngành bệnh lý." },
  { icon: "fa-solid fa-microscope", title: "Xét nghiệm chuyên sâu", description: "Thực hiện xét nghiệm theo yêu cầu của từng chuyên khoa." },
  { icon: "fa-solid fa-heart-pulse", title: "Theo dõi & quản lý bệnh", description: "Theo dõi tiến triển sức khỏe và hỗ trợ điều trị cá nhân." },
  { icon: "fa-solid fa-comments", title: "Tư vấn sức khỏe thông minh", description: "Nhận tư vấn và định hướng điều trị trước khi đăng ký khám." },
];

const news = [
  { title: "Cách phòng ngừa cảm cúm mùa đông", date: "01/11/2025", image: "https://i.pravatar.cc/300?img=10" },
  { title: "Lợi ích của việc kiểm tra sức khỏe định kỳ", date: "28/10/2025", image: "https://i.pravatar.cc/300?img=20" },
  { title: "Chế độ dinh dưỡng cho người cao tuổi", date: "25/10/2025", image: "https://i.pravatar.cc/300?img=30" },
];

export default function HomePage() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleBookingClick = () => {
    const token = sessionStorage.getItem("patient");
    if (!token) {
      // hiện popup form login/register
      setShowAuthModal(true);
      return;
    }

    navigate("/patient/booking");
  };

  return (
    <div className="bg-gray-50">


      {/* Banner slider */}
      <section className="relative h-[70vh] flex items-center justify-center overflow-hidden">
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className="absolute inset-0 w-full h-full transition-transform duration-1000"
            style={{
              transform: `translateX(${100 * (idx - current)}%)`,
              backgroundImage: `url(${banner.image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute inset-0 bg-black/30"></div>
            <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4 lg:px-16">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 drop-shadow-md">
                {banner.title}
              </h1>
              <p className="text-base md:text-lg mb-4 drop-shadow-sm">{banner.subtitle}</p>
              <button
                onClick={handleBookingClick}
                className="inline-block bg-blue-600 text-white font-semibold py-3 px-8 rounded-full shadow-md hover:bg-blue-700 transition transform hover:scale-105 text-base md:text-lg cursor-pointer"
              >
                ĐẶT LỊCH NGAY
              </button>
            </div>
          </div>
        ))}
        <div className="absolute bottom-6 flex space-x-2">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              className={`w-3 h-3 rounded-full ${idx === current ? "bg-white" : "bg-gray-400"}`}
            ></button>
          ))}
        </div>
      </section>

      <section className="py-20 px-4 lg:px-16 bg-gradient-to-r from-white via-blue-50 to-gray-100">
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Tại sao chọn Klinik?</h2>
          <p className="text-gray-700 text-base lg:text-lg max-w-3xl mx-auto">
            Chúng tôi cam kết mang lại trải nghiệm khám bệnh an toàn, tiện lợi và chuyên nghiệp.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-2xl transition transform hover:-translate-y-1">
            <i className="fas fa-check-circle text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Chất lượng hàng đầu</h4>
            <p className="text-gray-600">Đội ngũ bác sĩ chuyên môn cao, tận tâm chăm sóc sức khỏe.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-2xl transition transform hover:-translate-y-1">
            <i className="fas fa-shield-alt text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Bảo mật thông tin</h4>
            <p className="text-gray-600">Mọi thông tin y tế của bạn được bảo mật tuyệt đối.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-2xl transition transform hover:-translate-y-1">
            <i className="fas fa-clock text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Tiện lợi & Nhanh chóng</h4>
            <p className="text-gray-600">Đặt lịch online dễ dàng, không mất nhiều thời gian chờ đợi.</p>
          </div>
          <div className="p-6 bg-white rounded-xl shadow-lg border-t-4 border-blue-600 hover:shadow-2xl transition transform hover:-translate-y-1">
            <i className="fas fa-hand-holding-medical text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Hỗ trợ 24/7</h4>
            <p className="text-gray-600">Luôn có đội ngũ trực tuyến hỗ trợ mọi thắc mắc của bạn.</p>
          </div>
        </div>
      </section>

      {/* Dịch vụ nổi bật */}
      <section className="py-20 px-4 lg:px-16">
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Dịch vụ nổi bật</h2>
          <p className="text-gray-700 text-base lg:text-lg max-w-3xl mx-auto">
            Các dịch vụ chăm sóc sức khỏe toàn diện, hỗ trợ kịp thời cho mọi đối tượng.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          {services.map((svc, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-xl border-t-4 border-blue-600 transition transform hover:shadow-2xl hover:-translate-y-1 text-center">
              <i className={`${svc.icon} text-4xl text-blue-600 mb-4`}></i>
              <h4 className="text-xl font-bold text-gray-900 mb-3">{svc.title}</h4>
              <p className="text-gray-500">{svc.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Quy trình khám bệnh */}
      <section className="py-20 bg-gradient-to-r from-white via-blue-50 to-gray-100 px-4 lg:px-16">
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Quy trình khám bệnh</h2>
          <p className="text-gray-700 text-base lg:text-lg max-w-3xl mx-auto">
            Tham khảo các bước khám bệnh nhanh chóng, hiệu quả và tiện lợi.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-xl shadow-lg duration-300 hover:scale-105">
            <i className="fas fa-calendar-check text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Đặt lịch online</h4>
            <p className="text-gray-600">Chọn bác sĩ và thời gian phù hợp chỉ với vài click.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg duration-300 hover:scale-105">
            <i className="fas fa-user-md text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Khám trực tiếp</h4>
            <p className="text-gray-600">Thăm khám với bác sĩ chuyên môn tại phòng khám.</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg duration-300 hover:scale-105">
            <i className="fas fa-file-medical text-4xl text-blue-600 mb-4"></i>
            <h4 className="text-xl font-bold mb-2">Nhận kết quả</h4>
            <p className="text-gray-600">Kết quả nhanh chóng, thông tin bảo mật và tiện lợi.</p>
          </div>
        </div>
      </section>

      {/* Đánh giá từ bệnh nhân */}
      <section className="py-20 px-4 lg:px-16">
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Đánh giá từ bệnh nhân</h2>
          <p className="text-gray-700 text-base lg:text-lg max-w-3xl mx-auto">
            Những trải nghiệm thực tế từ các bệnh nhân đã sử dụng dịch vụ của Klinik.
          </p>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-lg duration-300 hover:scale-105">
            <p className="text-gray-600 mb-4">
              "Dịch vụ đặt lịch rất tiện lợi, tôi không phải chờ đợi lâu và được bác sĩ tư vấn tận tình."
            </p>
            <p className="font-semibold text-gray-800">– Nguyễn Văn A</p>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg duration-300 hover:scale-105">
            <p className="text-gray-600 mb-4">
              "Klinik giúp tôi theo dõi sức khỏe của cả gia đình một cách nhanh chóng và an toàn."
            </p>
            <p className="font-semibold text-gray-800">– Lê Thị B</p>
          </div>
        </div>
      </section>

      {/* Tin tức sức khỏe */}
      <section className="py-20 bg-gradient-to-r from-white via-blue-50 to-gray-100 px-4 lg:px-16">
        <div className="text-center mb-16 max-w-7xl mx-auto">
          <h2 className="text-3xl lg:text-4xl font-extrabold mb-4 text-gray-900">Tin tức sức khỏe</h2>
          <p className="text-gray-700 text-base lg:text-lg max-w-3xl mx-auto">
            Cập nhật kiến thức sức khỏe mới nhất để bạn chăm sóc bản thân và gia đình.
          </p>
        </div>
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8">
          {news.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl overflow-hidden shadow-lg transform transition duration-300 hover:scale-105"
            >
              <img src={item.image} alt={item.title} className="w-full h-40 object-cover" />
              <div className="p-6">
                <h4 className="font-bold text-lg mb-2">{item.title}</h4>
                <p className="text-gray-500 text-sm">{item.date}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Call-to-action */}
      <section className="py-20 bg-blue-700 text-white text-center px-4 lg:px-16">
        <h2 className="text-3xl lg:text-4xl font-extrabold mb-6">Đặt lịch khám ngay hôm nay</h2>
        <p className="mb-8 text-lg max-w-3xl mx-auto">
          Nhanh chóng, tiện lợi và an toàn. Hãy để Klinik chăm sóc sức khỏe cho bạn và gia đình.
        </p>
        <button
          onClick={handleBookingClick}
          className="inline-block bg-white text-blue-600 font-bold py-3 px-8 rounded-full shadow-lg hover:bg-gray-100 transition transform hover:scale-105 cursor-pointer"
        >
          ĐẶT LỊCH NGAY
        </button>
      </section>

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
  );
};
