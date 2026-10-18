import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import useVietMap from "../../hook/useVietMap";
import useFetch from "../../hook/useFetch";
import ALL_DISTRICTS_HCM from "../../constants/allDistricts";
import { specialtyService } from "../../service/specialtyService";
import { fetchAllDoctor, fetchDoctorSchedule, fetchNearbyDoctors } from "../../service/doctorService";

const DEFAULT_DOCTOR_IMAGE = "https://i.pravatar.cc/350?img=5";
const ITEMS_PER_PAGE = 3;
const VIETMAP_API_KEY = "YOUR_TILEMAP_KEY";

export default function DoctorsPage() {
  const [filter, setFilter] = useState("Tất cả");
  const [addressFilter, setAddressFilter] = useState("Tất cả");
  const [page, setPage] = useState(1);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [doctorSchedules, setDoctorSchedules] = useState({});
  const [allAddresses] = useState(ALL_DISTRICTS_HCM);
  const [userLocation, setUserLocation] = useState(null);
  const [nearbyDoctors, setNearbyDoctors] = useState([]);
  const [useNearby, setUseNearby] = useState(false);

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const vietmapLoaded = useVietMap(VIETMAP_API_KEY);

  const navigate = useNavigate();

  const location = useLocation();
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const specialtyQuery = params.get("specialty");

    if (specialtyQuery) {
      setFilter(specialtyQuery);
    } else {
      setFilter("Tất cả");
    }
    setPage(1);
  }, [location.search]);

  const { data: specialtiesData = [], loading: specialtiesLoading } = useFetch(
    specialtyService.getAllSpecialties
  );
  const allSpecialties = useMemo(
    () => ["Tất cả", ...(specialtiesData?.map(s => s.specialtyName) || [])],
    [specialtiesData]
  );

  const { data: doctorsData = [], loading: doctorsLoading } = useFetch(fetchAllDoctor.getAllDoctors);
  const doctors = doctorsData || [];

  useEffect(() => {
    if (!("geolocation" in navigator)) return console.warn("Trình duyệt không hỗ trợ Geolocation");

    navigator.geolocation.getCurrentPosition(
      pos => {
        console.log("Vị trí hiện tại:", pos.coords);
        setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      err => {
        console.error("Không lấy được vị trí:", err);
        alert("Không thể lấy vị trí thiết bị. Vui lòng bật định vị và cho phép truy cập.");
      },
      { enableHighAccuracy: true, timeout: 30000, maximumAge: 0 }
    );
  }, []);

  const handleFindNearby = async () => {
    if (!userLocation) {
      alert("Không thể lấy vị trí. Vui lòng cho phép truy cập vị trí.");
      return;
    }

    try {
      const radiusKm = 10; // bán kính mặc định 10km, có thể thay đổi
      const topN = 2;     // lấy tối đa 2 bác sĩ gần nhất
      const nearby = await fetchNearbyDoctors(userLocation.lat, userLocation.lng, topN, radiusKm);

      setNearbyDoctors(nearby);
      setUseNearby(true);
      setPage(1);

      if (!nearby || nearby.length === 0) {
        alert("Không có bác sĩ nào gần vị trí của bạn.");
      } else {
        console.log("Found nearby doctors:", nearby);
      }
    } catch (err) {
      console.error(err);
      alert("Không thể tìm bác sĩ gần vị trí hiện tại.");
    }
  };

  const handleFilterClick = (type, value) => {
    if (type === "specialty") setFilter(value);
    if (type === "address") setAddressFilter(value);
    setPage(1);
  };

  const doctorsToShow = useNearby ? nearbyDoctors : doctors;

  const filtered = doctorsToShow.filter(d => {
    const specialtyMatch = filter === "Tất cả" || d.specialtyName === filter;

    const address = d.address || "";
    const wardMatch = addressFilter === "Tất cả" ||
      address
        .split(",")
        .map(part => part.trim().toLowerCase())
        .some(part => part.startsWith("quận") && part === addressFilter.toLowerCase());

    return specialtyMatch && wardMatch;
  });

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const currentItems = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleBookingClick = doctor => {
    const token = sessionStorage.getItem("patient");
    if (!token) return setShowAuthModal(true);
    navigate("/patient/booking", { state: { doctor } });
  };

  // Xem/ẩn lịch làm việc
  const handleToggleSchedule = async doctorId => {
    if (doctorSchedules[doctorId]?.data) {
      setDoctorSchedules(prev => ({
        ...prev,
        [doctorId]: { ...prev[doctorId], open: !prev[doctorId].open }
      }));
    } else {
      try {
        const schedule = await fetchDoctorSchedule(doctorId);
        setDoctorSchedules(prev => ({
          ...prev,
          [doctorId]: { data: schedule, open: true }
        }));
      } catch (err) {
        alert("Không tải được lịch làm việc bác sĩ");
        console.error(err);
      }
    }
  };

  // Map logic
  useEffect(() => {
    if (!vietmapLoaded || !mapRef.current) return;

    // Nếu map chưa khởi tạo
    if (!mapInstance.current) {
      mapInstance.current = new window.vietmapgl.Map({
        container: mapRef.current,
        style: `https://maps.vietmap.vn/maps/styles/tm/style.json?apikey=${VIETMAP_API_KEY}`,
        center: [userLocation?.lng || 106.675477, userLocation?.lat || 10.758898],
        zoom: userLocation ? 14 : 6
      });
      mapInstance.current.addControl(new window.vietmapgl.NavigationControl(), "top-left");
    } else if (userLocation) {
      // Update center nếu userLocation thay đổi
      mapInstance.current.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 14 });
    }
  }, [vietmapLoaded, userLocation]);

  useEffect(() => {
    const map = mapInstance.current;
    if (!vietmapLoaded || !map) return;

    markersRef.current.forEach(m => { try { m.remove(); } catch (e) { } });
    markersRef.current = [];

    if (userLocation) {
      const userMarker = new window.vietmapgl.Marker({ color: "#f00" })
        .setLngLat([userLocation.lng, userLocation.lat])
        .addTo(map);
      markersRef.current.push(userMarker);
    }

    doctorsToShow.forEach(doc => {
      const lat = parseFloat(doc.lat);
      const lng = parseFloat(doc.lng);
      if (!isFinite(lat) || !isFinite(lng) || lat === 0 || lng === 0) return;

      const marker = new window.vietmapgl.Marker()
        .setLngLat([lng, lat])
        .addTo(map);

      const popup = new window.vietmapgl.Popup({ offset: 25 })
        .setHTML(`<div class="text-sm font-semibold">${doc.fullName}</div><div class="text-xs">${doc.specialtyName}</div>`);

      marker.getElement().addEventListener("click", () => popup.setLngLat([lng, lat]).addTo(map));

      markersRef.current.push(marker);
    });

    if (useNearby && userLocation && doctorsToShow.length > 0) {
      const bounds = new window.vietmapgl.LngLatBounds();
      bounds.extend([userLocation.lng, userLocation.lat]);
      doctorsToShow.forEach(doc => {
        const lat = parseFloat(doc.lat);
        const lng = parseFloat(doc.lng);
        if (isFinite(lat) && isFinite(lng)) bounds.extend([lng, lat]);
      });
      map.fitBounds(bounds, { padding: 60, maxZoom: 15 });
    } else if (userLocation) {
      map.flyTo({ center: [userLocation.lng, userLocation.lat], zoom: 13 });
    }

  }, [vietmapLoaded, doctorsToShow, userLocation, useNearby]);

  return (
    <div className="min-h-screen px-4 lg:px-24 py-10 bg-gradient-to-r from-white via-blue-50 to-gray-100">
      <h1 className="text-4xl font-bold text-center mb-12 text-blue-800">Đội ngũ bác sĩ</h1>
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-10">
        {/* Filter + Map */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Chuyên khoa */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-xl mb-3">Chuyên khoa</h3>
            {specialtiesLoading ? <p>Đang tải...</p> : (
              <div className="flex flex-col gap-1 max-h-[260px] overflow-auto pr-2">
                {allSpecialties.map(s => (
                  <button key={s} onClick={() => handleFilterClick("specialty", s)}
                    className={`text-left px-3 py-2 rounded ${filter === s ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-200 cursor-pointer"}`}>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Địa chỉ */}
          {!useNearby && (
            <div className="bg-white rounded-xl shadow p-6">
              <h3 className="font-bold text-xl mb-3">Địa chỉ (Thành Phố Hồ Chí Minh)</h3>
              <div className="flex flex-col gap-1 max-h-[260px] overflow-auto pr-2">
                {allAddresses.map(addr => (
                  <button
                    key={addr}
                    onClick={() => handleFilterClick("address", addr)}
                    className={`text-left px-3 py-2 rounded ${addressFilter === addr ? "bg-blue-700 text-white" : "bg-gray-100 text-gray-700 hover:bg-blue-200 cursor-pointer"}`}
                  >
                    {addr}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Gần tôi */}
          <div className="bg-white rounded-xl shadow p-6">
            <h3 className="font-bold text-xl mb-3">Gần tôi (tối đa 10km)</h3>
            <button
              className={`px-4 py-2 rounded w-full ${useNearby ? "bg-red-600 text-white" : "bg-gray-200 text-gray-800"} cursor-pointer`}
              onClick={() => {
                if (useNearby) {
                  // tắt chế độ gần tôi
                  setUseNearby(false);
                  setNearbyDoctors([]);
                } else {
                  // bật chế độ gần tôi
                  handleFindNearby();
                }
              }}
            >
              {useNearby ? "Tắt chế độ gần tôi" : "Tìm bác sĩ gần tôi"}
            </button>
          </div>

          {/* Map */}
          <div className="bg-white rounded-xl shadow p-4 h-[300px]">
            <div ref={mapRef} className="w-full h-[230px] rounded-md overflow-hidden" />
            {!vietmapLoaded && <div className="text-xs text-gray-500 mt-2">Đang tải bản đồ...</div>}
            {vietmapLoaded && !userLocation && <div className="text-xs text-gray-500 mt-2">Không có vị trí thiết bị</div>}
          </div>
        </div>

        {/* Doctor List */}
        <div className="lg:col-span-5 flex flex-col gap-10">
          {filtered.length === 0 && (
            <div className="border-2 border-red-500 bg-red-50 text-red-700 text-lg font-bold rounded-xl p-6 text-center py-10">
              Không tìm thấy bác sĩ nào phù hợp với điều kiện lọc.
            </div>
          )}

          {currentItems.map((d, i) => (
            <div key={i} className="bg-white rounded-xl flex flex-col lg:flex-row gap-6 p-6 shadow hover:shadow-lg transition">
              {/* Hình ảnh */}
              <img src={d.imageUrl || DEFAULT_DOCTOR_IMAGE} alt={d.fullName} className="w-full lg:w-64 h-64 object-cover rounded-lg shadow" />

              {/* Thông tin */}
              <div className="flex-1 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                  <h2 className="text-2xl font-bold text-blue-700">{d.fullName}</h2>
                  <p className="mt-2 text-gray-700"><strong>Kinh nghiệm:</strong> {d.experienceYears} năm</p>
                  <p className="text-gray-700"><strong>Chuyên khoa:</strong> {d.specialtyName}</p>
                  <p className="text-gray-700"><strong>Địa chỉ:</strong> {d.address}</p>
                  <p className="text-gray-700"><strong>Email:</strong> {d.email}</p>
                  <p className="text-gray-700"><strong>Số điện thoại:</strong> {d.phoneNumber}</p>
                </div>

                {/* Nút hành động */}
                <div className="flex gap-4 mt-4">
                  <button onClick={() => handleBookingClick(d)} className="px-6 py-2 border border-blue-700 text-blue-700 rounded-lg hover:bg-blue-100 cursor-pointer">
                    ĐẶT LỊCH KHÁM
                  </button>
                  <button onClick={() => handleToggleSchedule(d.id)} className="px-4 py-2 border border-gray-400 text-gray-700 rounded-lg hover:bg-gray-100 cursor-pointer">
                    {doctorSchedules[d.id]?.open ? "ẨN LỊCH" : "XEM LỊCH"}
                  </button>
                </div>

                {/* Lịch làm việc */}
                {doctorSchedules[d.id]?.open && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    {Object.entries(doctorSchedules[d.id].data).map(([day, slots]) => {
                      const dayVN = {
                        monday: "Thứ Hai",
                        tuesday: "Thứ Ba",
                        wednesday: "Thứ Tư",
                        thursday: "Thứ Năm",
                        friday: "Thứ Sáu",
                        saturday: "Thứ Bảy",
                        sunday: "Chủ Nhật"
                      }[day] || day;

                      return (
                        <div key={day} className="mb-2">
                          <strong>{dayVN}:</strong>{" "}
                          {slots.length > 0 ? slots.map(s => s.timeRange).join(", ") : "Nghỉ"}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 pt-6">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer">&lt;</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i} onClick={() => setPage(i + 1)} className={`px-4 py-2 rounded-lg border ${page === i + 1 ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-700 border-gray-300"} cursor-pointer`}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="px-3 py-2 border border-gray-300 rounded-lg cursor-pointer">&gt;</button>
            </div>
          )}

          {/* Modal đăng nhập */}
          {showAuthModal && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
              <div className="relative bg-white p-6 rounded-xl w-[420px] shadow-2xl animate-fadeIn">
                <button onClick={() => setShowAuthModal(false)} className="absolute right-0 top-0 w-8 h-8 rounded-full bg-gray-200 hover:bg-red-500 hover:text-white text-gray-600 flex items-center justify-center transition cursor-pointer">✕</button>
                <h2 className="text-xl font-bold text-center mb-6">Bạn cần đăng nhập trước khi đặt lịch</h2>
                <button className="w-full bg-blue-600 text-white py-2 rounded-lg mb-3 cursor-pointer hover:bg-blue-700 transition" onClick={() => { setShowAuthModal(false); navigate("/patient/login"); }}>Đăng nhập</button>
                <button className="w-full bg-gray-200 text-gray-800 py-2 rounded-lg cursor-pointer hover:bg-gray-300 transition" onClick={() => { setShowAuthModal(false); navigate("/patient/register"); }}>Đăng ký</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}