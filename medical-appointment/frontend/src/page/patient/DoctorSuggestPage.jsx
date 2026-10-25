import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDoctorsSuggestByAI } from "../../service/doctorService";

const DEFAULT_DOCTOR_IMAGE = "https://i.pravatar.cc/350?img=5";

const ITEMS_PER_PAGE = 3;

export default function DoctorsPage() {
  const [page, setPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [address, setAddress] = useState("");
  const [symptom, setSymptom] = useState("");
  const [doctors, setDoctors] = useState([]);
  const [doctorsLoading, setDoctorsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  const handleSuggestClick = async () => {
    setShowSuggestions(true);
    setDoctorsLoading(true);
    try {
      const data = await fetchDoctorsSuggestByAI(address, symptom);
      setDoctors(data || []);
      setPage(1);
    } catch (err) {
      console.error("Error fetching suggested doctors:", err);
      setDoctors([]);
    } finally {
      setDoctorsLoading(false);
    }
  };

  // Show all doctors (no specialty filtering)
  const filtered = doctors || [];

  const handleBookingClick = (doctor) => {
    const token = sessionStorage.getItem("patient");
    if (!token) {
      setShowAuthModal(true);
      return;
    }

    navigate("/patient/booking", { state: { doctor } });
  };

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);

  const currentItems = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const goPrev = () => page > 1 && setPage(page - 1);
  const goNext = () => page < totalPages && setPage(page + 1);

  return (
    <div className="min-h-screen bg-gradient-to-r from-white via-blue-50 to-gray-100 px-4 lg:px-24 py-10">
      <div className="bg-white rounded-xl shadow p-6 mb-12 border border-blue-600">
        <label htmlFor="">Nhập vị trí muốn tìm bác sĩ</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          className="w-full p-3 rounded-lg shadow mb-8 border border-blue-600"
          placeholder="Hà Nội, Hồ Chí Minh..."
        />
        <label htmlFor="symptom-input">Nhập triệu chứng: </label>
        <input
          id="symptom-input"
          type="text"
          value={symptom}
          onChange={(e) => setSymptom(e.target.value)}
          className="w-full p-3 rounded-lg shadow mb-8 border border-blue-600"
          placeholder="cảm cúm, sốt, đau đầu..."
        />
        <div className="flex justify-center">
          <button
            onClick={handleSuggestClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
          >
            Gợi ý bác sĩ
          </button>
        </div>
      </div>


      {showSuggestions && (
        <>
          <div className=" mb-12">
            <h1 className="text-2xl font-extrabold">Bác sĩ phù hợp với bạn</h1>
          </div>
          <div className="grid grid-cols-1 gap-10">

            {/* LIST */}
            <div className="flex flex-col gap-10 w-full">

              {doctorsLoading ? (
                <div className="text-center py-20">Đang tải...</div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-10">Không tìm thấy bác sĩ phù hợp.</div>
              ) : (
                currentItems.map((d, i) => (
                  <div key={i} className="bg-white rounded-xl flex flex-col lg:flex-row gap-6 p-6 shadow">

                    <img
                      src={d.imageUrl || DEFAULT_DOCTOR_IMAGE}
                      alt={d.fullName}
                      className="w-full lg:w-64 h-64 object-cover rounded-lg shadow"
                    />

                    <div className="flex-1 flex flex-col justify-center">
                      <h2 className="text-2xl font-bold text-blue-700">{d.fullName}</h2>
                      <p className="text-gray-700">Chuyên khoa: {d.specialtyName}</p>
                      <p className="text-gray-700">Địa chỉ: {d.address}</p>
                      <div className="flex gap-4 mt-6">
                        <button
                          onClick={() => handleBookingClick(d)}
                          className="px-6 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer"
                        >
                          ĐẶT LỊCH KHÁM
                        </button>
                      </div>
                    </div>
                  </div>
                )))}

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 pt-6">
                  <button
                    onClick={goPrev}
                    disabled={page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-blue-100 disabled:opacity-40"
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`px-4 py-2 rounded-lg border ${page === i + 1
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-blue-10 cursor-pointer"
                        }`}
                    >
                      {i + 1}
                    </button>
                  ))}

                  <button
                    onClick={goNext}
                    disabled={page === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-lg bg-white hover:bg-blue-100 disabled:opacity-40 cursor-pointer"
                  >
                    &gt;
                  </button>
                </div>
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
        </>
      )}
    </div>
  );
}
