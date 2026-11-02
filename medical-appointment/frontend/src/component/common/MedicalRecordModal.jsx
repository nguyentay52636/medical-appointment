import React, { useRef } from 'react';

const getBmiCategory = (bmi) => {
  if (!bmi || isNaN(bmi)) return { label: 'Chưa có', color: 'bg-gray-100 text-gray-700' };
  const num = parseFloat(bmi);
  if (num < 18.5) return { label: 'Thiếu cân / Nhẹ cân', color: 'bg-amber-100 text-amber-800 border-amber-300' };
  if (num < 23.0) return { label: 'Bình thường (Chuẩn)', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  if (num < 25.0) return { label: 'Tiền béo phì', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' };
  if (num < 30.0) return { label: 'Béo phì độ 1', color: 'bg-orange-100 text-orange-800 border-orange-300' };
  return { label: 'Béo phì độ 2+', color: 'bg-red-100 text-red-800 border-red-300' };
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 animate-fadeIn">
      {/* Container */}
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[92vh]">
        
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-teal-600 px-6 py-5 text-white flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white text-2xl shadow-inner">
              <i className="fas fa-file-medical"></i>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl md:text-2xl font-black tracking-tight">Hồ Sơ Bệnh Án & Toa Thuốc</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/25 border border-white/30 text-white">
                  {record.examinationType || "Khám tổng quát"}
                </span>
              </div>
              <p className="text-xs md:text-sm text-blue-100 font-medium">
                Mã hồ sơ: <span className="font-mono font-bold text-white">BA-{record.id || appointment?.id}</span> | Mã lịch hẹn: <span className="font-mono font-bold text-white">#{record.appointmentCode || appointment?.appointmentCode || appointment?.id}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              type="button"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition shadow-xs cursor-pointer border border-white/20"
              title="In bệnh án"
            >
              <i className="fas fa-print"></i>
              <span>In bệnh án</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition cursor-pointer"
            >
              <i className="fas fa-times text-lg"></i>
            </button>
          </div>
        </div>

        {/* Modal Body / Printable area */}
        <div ref={printRef} className="p-6 md:p-8 overflow-y-auto space-y-6 text-gray-800 text-sm print:p-0 print:m-0 print:overflow-visible">
          
          {/* Header Bệnh Viện (Hiển thị khi In) */}
          <div className="hidden print:flex items-center justify-between border-b-2 border-blue-600 pb-4 mb-4">
            <div>
              <h1 className="text-xl font-black text-blue-800 uppercase tracking-wide">PHÒNG KHÁM Y KHOA ĐA KHOA QUỐC TẾ</h1>
              <p className="text-xs text-gray-500">Địa chỉ: 123 Nguyễn Văn Cừ, Quận 5, TP. Hồ Chí Minh | Hotline: 1900 6868</p>
            </div>
            <div className="text-right">
              <p className="text-base font-bold text-gray-800">PHIẾU KHÁM BỆNH & ĐƠN THUỐC</p>
              <p className="text-xs text-gray-500">Ngày in: {new Date().toLocaleDateString('vi-VN')}</p>
            </div>
          </div>

          {/* Bảng thông tin Bệnh Nhân & Bác Sĩ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gradient-to-br from-blue-50/70 to-indigo-50/40 p-5 rounded-2xl border border-blue-100/80 shadow-2xs">
            <div className="space-y-2">
              <h3 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                <i className="fas fa-user-circle text-blue-600"></i> Thông tin Người Bệnh
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Họ và tên:</span>
                  <p className="font-bold text-sm text-gray-900">{record.patientName || appointment?.patientName || "Bệnh nhân"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Số điện thoại:</span>
                  <p className="font-semibold text-gray-800">{record.patientPhone || appointment?.patientPhone || "---"}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500">Email:</span>
                  <p className="font-semibold text-gray-800">{record.patientEmail || appointment?.patientEmail || "---"}</p>
                </div>
              </div>
            </div>

            <div className="space-y-2 md:border-l md:border-blue-200/60 md:pl-4">
              <h3 className="text-xs font-black uppercase text-blue-800 tracking-wider flex items-center gap-1.5">
                <i className="fas fa-user-md text-blue-600"></i> Bác Sĩ & Lịch Khám
              </h3>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-gray-500">Bác sĩ phụ trách:</span>
                  <p className="font-bold text-sm text-gray-900">{record.doctorName || appointment?.doctorName || "BS. Đang cập nhật"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Chuyên khoa:</span>
                  <p className="font-semibold text-gray-800">{record.specialtyName || appointment?.specialtyName || "Đa khoa"}</p>
                </div>
                <div>
                  <span className="text-gray-500">Thời gian khám:</span>
                  <p className="font-semibold text-gray-800">{appointment?.time || ""}, {appointment?.date ? new Date(appointment.date).toLocaleDateString('vi-VN') : (record.createdAt ? new Date(record.createdAt).toLocaleDateString('vi-VN') : "")}</p>
                </div>
                <div>
                  <span className="text-gray-500">Hình thức khám:</span>
                  <p className="font-semibold text-blue-700">{record.examinationType || "Khám tổng quát"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* PHẦN 1: BẢNG CHỈ SỐ SINH HIỆU (VITAL SIGNS) */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center text-xs">1</span>
                Chỉ Số Sinh Hiệu & Lâm Sàng
              </h3>
              {calculatedBmi && (
                <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${bmiCat.color}`}>
                  BMI: {calculatedBmi} ({bmiCat.label})
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              {/* Huyết áp */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs text-center space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 block uppercase">Huyết áp</span>
                <p className="text-lg font-black text-rose-600 tracking-tight">{record.bloodPressure || "--/--"}</p>
                <span className="text-[10px] text-gray-400">mmHg</span>
              </div>

              {/* Nhịp tim */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs text-center space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 block uppercase">Nhịp tim</span>
                <p className="text-lg font-black text-rose-500 tracking-tight">{record.heartRate || "--"}</p>
                <span className="text-[10px] text-gray-400">nhịp / phút</span>
              </div>

              {/* Thân nhiệt */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs text-center space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 block uppercase">Thân nhiệt</span>
                <p className="text-lg font-black text-amber-600 tracking-tight">{record.temperature ? `${record.temperature}°C` : "--"}</p>
                <span className="text-[10px] text-gray-400">Độ C</span>
              </div>

              {/* Cân nặng */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs text-center space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 block uppercase">Cân nặng</span>
                <p className="text-lg font-black text-blue-600 tracking-tight">{record.weight ? `${record.weight}` : "--"}</p>
                <span className="text-[10px] text-gray-400">kg</span>
              </div>

              {/* Chiều cao */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs text-center space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 block uppercase">Chiều cao</span>
                <p className="text-lg font-black text-indigo-600 tracking-tight">{record.height ? `${record.height}` : "--"}</p>
                <span className="text-[10px] text-gray-400">cm</span>
              </div>

              {/* Chỉ số BMI */}
              <div className="bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs text-center space-y-1">
                <span className="text-[11px] font-semibold text-gray-500 block uppercase">Chỉ số BMI</span>
                <p className="text-lg font-black text-teal-600 tracking-tight">{calculatedBmi || "--"}</p>
                <span className="text-[10px] text-gray-400">kg/m²</span>
              </div>
            </div>

            {/* Triệu chứng lâm sàng */}
            {record.clinicalSymptoms && (
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 text-xs">
                <span className="font-bold text-gray-700 block mb-1">Triệu chứng lâm sàng ghi nhận:</span>
                <p className="text-gray-800 leading-relaxed whitespace-pre-line">{record.clinicalSymptoms}</p>
              </div>
            )}
          </div>

          {/* PHẦN 2: CHẨN ĐOÁN & CẬN LÂM SÀNG */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xs">2</span>
              Chẩn Đoán Y Khoa & Cận Lâm Sàng
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200">
                <span className="text-xs font-bold text-blue-900 uppercase block mb-1 flex items-center gap-1.5">
                  <i className="fas fa-stethoscope text-blue-600"></i> Chẩn đoán bệnh chính:
                </span>
                <p className="text-base font-bold text-blue-950 leading-relaxed">
                  {record.diagnosis || "Chưa có kết luận chẩn đoán."}
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                <span className="text-xs font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1.5">
                  <i className="fas fa-microscope text-slate-600"></i> Kết quả xét nghiệm / Cận lâm sàng:
                </span>
                <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                  {record.labResults || "Không có chỉ định cận lâm sàng đặc biệt."}
                </p>
              </div>
            </div>
          </div>

          {/* PHẦN 3: TOA THUỐC ĐIỀU TRỊ */}
          <div className="space-y-3">
            <h3 className="text-sm font-black uppercase text-gray-900 tracking-wider flex items-center gap-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center text-xs">3</span>
              Đơn Thuốc Điều Trị
            </h3>

            {parsedPrescriptions.length === 0 ? (
              <div className="p-4 bg-gray-50 border border-dashed border-gray-300 rounded-xl text-center text-gray-500 text-xs italic">
                Bác sĩ không kê đơn thuốc cho đợt khám này hoặc sử dụng phác đồ theo dõi.
              </div>
            ) : (
              <div className="overflow-x-auto border border-gray-200 rounded-xl shadow-2xs">
                <table className="min-w-full text-xs text-left">
                  <thead className="bg-gray-100/90 text-gray-700 uppercase font-black text-[11px] border-b border-gray-200">
                    <tr>
                      <th className="py-2.5 px-3 w-12 text-center">STT</th>
                      <th className="py-2.5 px-3">Tên thuốc & Hàm lượng</th>
                      <th className="py-2.5 px-3 w-28 text-center">Số lượng</th>
                      <th className="py-2.5 px-3">Liều dùng & Cách sử dụng</th>
                      <th className="py-2.5 px-3">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {parsedPrescriptions.map((item, index) => (
                      <tr key={index} className="hover:bg-blue-50/30 transition">
                        <td className="py-2.5 px-3 text-center font-bold text-gray-500">{index + 1}</td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{item.name || item.medicineName || "Thuốc"}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-blue-700">
                          {item.quantity ? `${item.quantity} ${item.unit || 'viên'}` : (item.amount || 'Theo hướng dẫn')}
                        </td>
                        <td className="py-2.5 px-3 text-gray-800">{item.dosage || item.instruction || item.usage || "Uống theo chỉ định"}</td>
                        <td className="py-2.5 px-3 text-gray-500 italic">{item.note || item.advice || "Sau bữa ăn"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* PHẦN 4: LỜI DẶN & HẸN TÁI KHÁM */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="md:col-span-2 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
              <span className="text-xs font-bold text-amber-900 uppercase block mb-1 flex items-center gap-1.5">
                <i className="fas fa-comment-medical text-amber-600"></i> Lời dặn dò của Bác sĩ:
              </span>
              <p className="text-xs text-amber-950 leading-relaxed whitespace-pre-line">
                {record.doctorAdvice || "Uống thuốc đúng giờ, kiêng các chất kích thích, nghỉ ngơi hợp lý và tái khám khi có dấu hiệu bất thường."}
              </p>
            </div>

            <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 flex flex-col justify-center text-center">
              <span className="text-xs font-bold text-emerald-900 uppercase block mb-1">
                <i className="fas fa-calendar-check text-emerald-600 mr-1"></i> Ngày Hẹn Tái Khám
              </span>
              <p className="text-base font-black text-emerald-700">
                {record.followUpDate ? new Date(record.followUpDate).toLocaleDateString('vi-VN') : "Theo dõi khi cần"}
              </p>
              <span className="text-[11px] text-emerald-600 mt-0.5">Đặt lịch tái khám đúng hẹn</span>
            </div>
          </div>

          {/* Chữ ký khi in */}
          <div className="hidden print:grid grid-cols-2 pt-8 text-center text-xs">
            <div>
              <p className="font-semibold text-gray-600">Người bệnh / Thân nhân</p>
              <p className="italic text-[10px] text-gray-400">(Ký và ghi rõ họ tên)</p>
            </div>
            <div>
              <p className="font-semibold text-gray-600">Bác sĩ khám bệnh</p>
              <p className="italic text-[10px] text-gray-400">(Ký, đóng dấu và ghi rõ họ tên)</p>
              <div className="h-16"></div>
              <p className="font-bold text-gray-900 text-sm">{record.doctorName || appointment?.doctorName}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0">
          <p className="text-xs text-gray-500">
            Hồ sơ được số hóa tự động và bảo mật theo chuẩn y khoa.
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer"
            >
              <i className="fas fa-print"></i>
              <span>In Bệnh Án</span>
            </button>
            <button
              onClick={onClose}
              type="button"
              className="px-4 py-2.5 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
