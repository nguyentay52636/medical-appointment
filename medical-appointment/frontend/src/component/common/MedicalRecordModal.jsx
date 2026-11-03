import React, { useRef } from 'react';

const getBmiCategory = (bmi) => {
  if (!bmi || isNaN(bmi)) return { label: 'Chưa có', color: 'bg-slate-100 text-slate-700 border-slate-200' };
  const num = parseFloat(bmi);
  if (num < 18.5) return { label: 'Thiếu cân / Nhẹ cân', color: 'bg-amber-50 text-amber-800 border-amber-200' };
  if (num < 23.0) return { label: 'Bình thường (Chuẩn)', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  if (num < 25.0) return { label: 'Tiền béo phì', color: 'bg-yellow-50 text-yellow-800 border-yellow-200' };
  if (num < 30.0) return { label: 'Béo phì độ 1', color: 'bg-orange-50 text-orange-800 border-orange-200' };
  return { label: 'Béo phì độ 2+', color: 'bg-rose-50 text-rose-800 border-rose-200' };
};

export default function MedicalRecordModal({ isOpen, onClose, record, appointment }) {
  const printRef = useRef(null);

  if (!isOpen || !record) return null;

  // Phân tích Toa thuốc (nếu là JSON hoặc chuỗi)
  let parsedPrescriptions = [];
  if (record.prescriptions) {
    try {
      parsedPrescriptions = typeof record.prescriptions === 'string'
        ? JSON.parse(record.prescriptions)
        : record.prescriptions;
      if (!Array.isArray(parsedPrescriptions)) {
        parsedPrescriptions = [{ name: record.prescriptions, dosage: '', note: '' }];
      }
    } catch {
      parsedPrescriptions = [{ name: record.prescriptions, dosage: '', note: '' }];
    }
  }

  // Tính BMI nếu có chiều cao và cân nặng
  let calculatedBmi = null;
  if (record.weight && record.height && Number(record.height) > 0) {
    const hMeter = Number(record.height) / 100;
    calculatedBmi = (Number(record.weight) / (hMeter * hMeter)).toFixed(1);
  }

  const bmiCat = getBmiCategory(calculatedBmi);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 flex flex-col max-h-[92vh]">
        
        {/* Header Modal - Thiết kế Chuẩn Y Khoa Đồng Bộ */}
        <div className="bg-slate-900 px-6 py-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-600 flex items-center justify-center text-white text-xl shadow-md shadow-blue-500/20">
              <i className="fas fa-file-medical-alt"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg md:text-xl font-bold tracking-tight text-white">
                  Hồ Sơ Bệnh Án Điện Tử & Đơn Thuốc
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider bg-blue-500/20 border border-blue-400/30 text-blue-300">
                  {record.examinationType || "Khám lâm sàng"}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Mã hồ sơ: <span className="font-bold text-slate-200">BA-{record.id || appointment?.id}</span> | Mã lịch hẹn: <span className="font-bold text-slate-200">#{record.appointmentCode || appointment?.appointmentCode || appointment?.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold transition border border-slate-700 cursor-pointer"
              title="In bệnh án"
            >
              <i className="fas fa-print"></i>
              <span>In Bệnh Án</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition cursor-pointer"
              title="Đóng"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Modal Body / Printable area */}
        <div ref={printRef} className="p-6 md:p-8 overflow-y-auto space-y-6 text-slate-800 text-sm print:p-0 print:m-0 print:overflow-visible">
          
          {/* Header Bệnh Viện (Hiển thị khi In) */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-slate-800 pb-4 mb-4">
            <div>
              <h1 className="text-xl font-extrabold text-slate-900 uppercase tracking-wide">
                PHÒNG KHÁM ĐA KHOA QUỐC TẾ KLINIK
              </h1>
              <p className="text-xs text-slate-500">273 An Dương Vương, Phường 4, Quận 5, TP. Hồ Chí Minh | Hotline: (+84) 846 777 901</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-slate-900">PHIẾU KHÁM BỆNH & ĐƠN THUỐC ĐIỆN TỬ</p>
              <p className="text-xs text-slate-500">Ngày in phiếu: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Bảng thông tin Bệnh Nhân & Bác Sĩ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
            <div className="space-y-2">
              <div className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <i className="fas fa-user-circle text-blue-600"></i>
                <span>Thông tin Người Bệnh</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Họ và tên:</span>
                  <p className="font-bold text-sm text-slate-900">{record.patientName || appointment?.patientName || "Bệnh nhân"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>
                  <p className="font-semibold text-slate-800">{record.patientPhone || appointment?.patientPhone || "---"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500">Email:</span>
                  <p className="font-semibold text-slate-800">{record.patientEmail || appointment?.patientEmail || "---"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:border-l md:border-slate-200 md:pl-5">
              <div className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
                <i className="fas fa-user-md text-blue-600"></i>
                <span>Bác Sĩ & Lịch Khám</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500">Bác sĩ phụ trách:</span>
                  <p className="font-bold text-sm text-slate-900">{record.doctorName || appointment?.doctorName || "BS. Đang cập nhật"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Chuyên khoa:</span>
                  <p className="font-semibold text-slate-800">{record.specialtyName || appointment?.specialtyName || "Đa khoa"}</p>
                </div>
                <div>
                  <span className="text-slate-500">Thời gian khám:</span>
                  <p className="font-semibold text-slate-800">{appointment?.time || ""}, {appointment?.date ? new Date(appointment.date).toLocaleDateString('vi-VN') : (record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : "")}</p>
                </div>
                <div>
                  <span className="text-slate-500">Hình thức khám:</span>
                  <p className="font-semibold text-blue-700">{record.examinationType || "Khám tổng quát"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 1: BẢNG CHỈ SỐ SINH HIỆU (VITAL SIGNS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">1</span>
                <span>Chỉ Số Sinh Hiệu Lâm Sàng</span>
              </div>
              {calculatedBmi && (
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${bmiCat.color}`}>
                  BMI: {calculatedBmi} ({bmiCat.label})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {/* Huyết áp */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <i className="fas fa-heart-pulse text-blue-600 block text-sm mb-0.5"></i>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Huyết áp</span>
                <p className="text-base font-bold text-slate-900 font-mono tracking-tight">{record.bloodPressure || "--/--"}</p>
                <span className="text-[10px] text-slate-400">mmHg</span>
              </div>

              {/* Nhịp tim */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <i className="fas fa-heartbeat text-rose-500 block text-sm mb-0.5"></i>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Nhịp tim</span>
                <p className="text-base font-bold text-slate-900 font-mono tracking-tight">{record.heartRate || "--"}</p>
                <span className="text-[10px] text-slate-400">nhịp / phút</span>
              </div>

              {/* Thân nhiệt */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <i className="fas fa-temperature-half text-amber-500 block text-sm mb-0.5"></i>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Thân nhiệt</span>
                <p className="text-base font-bold text-slate-900 font-mono tracking-tight">{record.temperature ? `${record.temperature}°C` : "--"}</p>
                <span className="text-[10px] text-slate-400">Độ C</span>
              </div>

              {/* Cân nặng */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <i className="fas fa-weight-scale text-indigo-500 block text-sm mb-0.5"></i>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Cân nặng</span>
                <p className="text-base font-bold text-slate-900 font-mono tracking-tight">{record.weight ? `${record.weight}` : "--"}</p>
                <span className="text-[10px] text-slate-400">kg</span>
              </div>

              {/* Chiều cao */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <i className="fas fa-ruler-vertical text-teal-600 block text-sm mb-0.5"></i>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Chiều cao</span>
                <p className="text-base font-bold text-slate-900 font-mono tracking-tight">{record.height ? `${record.height}` : "--"}</p>
                <span className="text-[10px] text-slate-400">cm</span>
              </div>

              {/* Chỉ số BMI */}
              <div className="bg-white p-3 rounded-xl border border-slate-200 text-center space-y-0.5 shadow-2xs">
                <i className="fas fa-calculator text-blue-600 block text-sm mb-0.5"></i>
                <span className="text-[11px] font-semibold text-slate-500 block uppercase">Chỉ số BMI</span>
                <p className="text-base font-bold text-blue-700 font-mono tracking-tight">{calculatedBmi || "--"}</p>
                <span className="text-[10px] text-slate-400">kg/m²</span>
              </div>
            </div>

            {/* Triệu chứng lâm sàng */}
            {record.clinicalSymptoms && (
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Triệu chứng lâm sàng ghi nhận:</span>
                <p className="text-slate-800 leading-relaxed whitespace-pre-line">{record.clinicalSymptoms}</p>
              </div>
            )}
          </div>

          {/* PHẦN 2: CHẨN ĐOÁN & CẬN LÂM SÀNG */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">2</span>
              <span>Chẩn Đoán Y Khoa & Cận Lâm Sàng</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1.5">
                  <i className="fas fa-stethoscope text-blue-600"></i>
                  <span>Chẩn đoán bệnh chính:</span>
                </span>
                <p className="text-sm md:text-base font-bold text-slate-900 leading-relaxed">
                  {record.diagnosis || "Chưa có kết luận chẩn đoán."}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1.5">
                  <i className="fas fa-microscope text-slate-600"></i>
                  <span>Kết quả cận lâm sàng / Xét nghiệm:</span>
                </span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {record.labResults || "Không có chỉ định cận lâm sàng đặc biệt."}
                </p>
              </div>
            </div>
          </div>

          {/* PHẦN 3: TOA THUỐC ĐIỀU TRỊ */}
          <div className="space-y-3">
            <div className="text-xs font-bold uppercase text-slate-700 tracking-wider flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[11px]">3</span>
              <span>Đơn Thuốc Điều Trị</span>
            </div>

            {parsedPrescriptions.length === 0 ? (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-center text-slate-500 text-xs italic">
                Bác sĩ không kê đơn thuốc cho đợt khám này hoặc sử dụng phác đồ theo dõi.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-2xs">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-700 uppercase font-bold text-[11px] border-b border-slate-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3">Tên thuốc & Hàm lượng</th>
                      <th className="py-2.5 px-3 w-28 text-center">Số lượng</th>
                      <th className="py-2.5 px-3">Liều dùng & Cách sử dụng</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {parsedPrescriptions.map((item, index) => (
                      <tr key={index} className="hover:bg-slate-50/60 transition">
                        <td className="py-2.5 px-3 text-center font-bold text-slate-500">{index + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{item.name || item.medicineName || "Thuốc"}</td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100">
                            {item.quantity ? `${item.quantity} ${item.unit || 'viên'}` : (item.amount || 'Theo hướng dẫn')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-800">{item.dosage || item.instruction || item.usage || "Uống theo chỉ định"}</td>
                        <td className="py-2.5 px-3 text-slate-500">{item.note || item.advice || "Sau bữa ăn"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PHẦN 4: LỜI DẶN & HẸN TÁI KHÁM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
            <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1.5">
                <i className="fas fa-comment-medical text-blue-600"></i>
                <span>Lời dặn dò của Bác sĩ:</span>
              </span>
              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {record.doctorAdvice || "Uống thuốc đúng giờ, kiêng các chất kích thích, nghỉ ngơi hợp lý và tái khám khi có dấu hiệu bất thường."}
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex flex-col justify-center text-center space-y-1">
              <span className="text-xs font-bold text-slate-700 uppercase block">
                <i className="fas fa-calendar-check text-blue-600 mr-1"></i> Ngày Hẹn Tái Khám
              </span>
              <p className="text-base font-bold text-blue-700">
                {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString('vi-VN') : "Theo dõi khi cần"}
              </p>
              <span className="text-[11px] text-slate-500">Tái khám đúng hẹn theo chỉ định</span>
            </div>
          </div>

          {/* Chữ ký khi in */}
          <div className="hidden print:grid grid-cols-2 pt-8 text-center text-xs">
            <div>
              <p className="font-semibold text-slate-600">Người bệnh / Thân nhân</p>
              <p className="italic text-[10px] text-slate-400">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-semibold text-slate-600">Bác sĩ khám bệnh</p>
              <p className="italic text-[10px] text-slate-400">(Ký, đóng dấu và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold text-slate-900 text-sm">{record.doctorName || appointment?.doctorName}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <p className="text-xs text-slate-500">
            Hồ sơ bệnh án điện tử được số hóa và quản lý tập trung theo chuẩn y khoa.
          </p>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <i className="fas fa-print"></i>
              <span>In Bệnh Án</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
