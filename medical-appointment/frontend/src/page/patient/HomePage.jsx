import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import banner1 from '../../assets/banner_1.jpg';
import banner2 from '../../assets/banner_2.png';
import banner3 from '../../assets/banner_3.png';

const banners = [
  {
    badge: "Chăm sóc sức khỏe toàn diện",
    title: "Đặt Lịch Khám Trực Tuyến Nhanh Chóng",
    subtitle: "Chủ động chọn bác sĩ chuyên khoa giỏi, khung giờ khám thuận tiện, không cần xếp hàng chờ đợi.",
    image: banner1,
    primaryCta: "ĐẶT LỊCH NGAY",
    secondaryCta: "Đội ngũ bác sĩ",
    secondaryLink: "/patient/doctor_list"
  },
  {
    badge: "Y tế chất lượng cao",
    title: "Khám Bệnh An Toàn & Chu Đáo",
    subtitle: "Quy trình tiêu chuẩn, trang thiết bị tiên tiến cùng phác đồ điều trị tận tâm, cá nhân hóa.",
    image: banner3,
    primaryCta: "ĐẶT LỊCH NGAY",
    secondaryCta: "Xem chuyên khoa",
    secondaryLink: "/patient/specialty"
  },
  {
    badge: "Đồng hành 24/7 cùng bạn",
    title: "Luôn Sẵn Sàng Chăm Sóc Sức Khỏe",
    subtitle: "Đội ngũ bác sĩ giàu kinh nghiệm, hỗ trợ giải đáp thắc mắc và định hướng y tế kịp thời.",
    image: banner2,
    primaryCta: "ĐẶT LỊCH NGAY",
    secondaryCta: "Hỗ trợ khách hàng",
    secondaryLink: "/patient/support"
  },
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
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrent(prev => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const nextSlide = () => setCurrent(prev => (prev + 1) % banners.length);
  const prevSlide = () => setCurrent(prev => (prev - 1 + banners.length) % banners.length);

  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();

  const handleBookingClick = () => {
    const token = sessionStorage.getItem("patient");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    navigate("/patient/booking");
  };

  return (
    <div className="bg-gray-50">
      {/* Banner slider hiện đại */}
      <section
        className="relative h-[560px] sm:h-[620px] lg:h-[680px] w-full overflow-hidden select-none bg-slate-950"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              idx === current ? "opacity-100 z-10 pointer-events-auto" : "opacity-0 z-0 pointer-events-none"
            }`}
          >
            {/* Hình nền với hiệu ứng zoom nhẹ */}
            <div
              className={`absolute inset-0 bg-cover bg-center transition-transform duration-[7000ms] ease-out ${
                idx === current ? "scale-105" : "scale-100"
              }`}
              style={{ backgroundImage: `url(${banner.image})` }}
            />

            {/* Gradient Overlay tối màu tạo độ tương phản cao cho chữ */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-slate-900/35" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

            {/* Nội dung banner */}
            <div className="relative h-full max-w-7xl mx-auto px-6 sm:px-12 lg:px-16 flex flex-col items-center justify-center text-center text-white">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/20 backdrop-blur-md border border-blue-400/40 text-blue-200 text-xs sm:text-sm font-semibold mb-5 tracking-wider uppercase shadow-sm">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                <span>{banner.badge}</span>
              </div>

              {/* Tiêu đề */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight tracking-tight drop-shadow-xl max-w-4xl">
                {banner.title}
              </h1>

              {/* Mô tả phụ */}
              <p className="text-sm sm:text-base md:text-lg text-slate-200 mb-8 max-w-2xl leading-relaxed drop-shadow-md">
                {banner.subtitle}
              </p>

              {/* Nút thao tác (Dual CTA) */}
              <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto">
                <button
                  onClick={handleBookingClick}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-full shadow-lg shadow-blue-600/40 hover:shadow-blue-500/60 transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base cursor-pointer"
                >
                  <i className="fas fa-calendar-check text-lg"></i>
                  <span>{banner.primaryCta}</span>
                </button>

                <button
                  onClick={() => navigate(banner.secondaryLink)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 px-7 rounded-full backdrop-blur-md border border-white/30 hover:border-white/60 transition-all duration-200 text-sm sm:text-base cursor-pointer"
                >
                  <span>{banner.secondaryCta}</span>
                  <i className="fas fa-arrow-right text-xs"></i>
                </button>
              </div>
            </div>
          </div>
        ))}

        {/* Nút lùi (Previous Arrow) */}
        <button
          onClick={prevSlide}
          aria-label="Previous slide"
          className="absolute left-3 sm:left-6 lg:left-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-blue-600 text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-105"
        >
          <i className="fas fa-chevron-left text-sm sm:text-base"></i>
        </button>

        {/* Nút tới (Next Arrow) */}
        <button
          onClick={nextSlide}
          aria-label="Next slide"
          className="absolute right-3 sm:right-6 lg:right-8 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-black/30 hover:bg-blue-600 text-white/90 hover:text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 shadow-xl cursor-pointer hover:scale-105"
        >
          <i className="fas fa-chevron-right text-sm sm:text-base"></i>
        </button>

        {/* Thanh điều hướng chỉ số trang (Indicators) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/30 backdrop-blur-md border border-white/10">
          {banners.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrent(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              className={`transition-all duration-300 rounded-full cursor-pointer ${
                idx === current
                  ? "w-8 h-2 bg-blue-500 shadow-sm"
                  : "w-2 h-2 bg-white/50 hover:bg-white/90"
              }`}
            />
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
