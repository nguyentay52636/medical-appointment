import React, { useState, useEffect } from "react";
import { reviewService } from "../../service/reviewService";
import { useToast } from "../../context/ToastContext";
import DEFAULT_DOCTOR_IMAGE from "../../assets/doctor.webp";

export default function DoctorReviewModal({
  isOpen,
  onClose,
  doctor,
  appointment = null,
  existingReview = null,
  patientId,
  onSuccess,
}) {
  const { success: showToastSuccess, error: showToastError, warning: showToastWarning } = useToast();

  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (existingReview) {
      setRating(existingReview.rating || 5);
      setComment(existingReview.comment || "");
    } else {
      setRating(5);
      setComment("");
    }
  }, [existingReview, isOpen]);

  if (!isOpen || !doctor) return null;

  const starLabels = {
    1: "Rất thất vọng - Trải nghiệm khám chưa đạt yêu cầu",
    2: "Chưa hài lòng - Cần cải thiện thái độ hoặc thời gian chờ",
    3: "Bình thường - Đạt mức khám chữa bệnh tiêu chuẩn",
    4: "Hài lòng - Bác sĩ tư vấn rõ ràng, khám chu đáo",
    5: "Xuất sắc - Bác sĩ rất tận tâm, chuyên môn cao, dặn dò kỹ",
  };

  const activeRating = hoverRating || rating;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!patientId) {
      showToastWarning("Chưa đăng nhập", "Vui lòng đăng nhập tài khoản bệnh nhân để gửi đánh giá.");
      return;
    }

    if (!comment.trim()) {
      showToastWarning("Thiếu nội dung", "Vui lòng nhập lời nhận xét hoặc chia sẻ trải nghiệm khám của bạn.");
      return;
    }

    if (comment.trim().length < 5) {
      showToastWarning("Nội dung quá ngắn", "Vui lòng viết nhận xét ít nhất 5 ký tự.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        doctorId: doctor.id,
        patientId: Number(patientId),
        appointmentId: appointment?.id || existingReview?.appointmentId || null,
        rating: rating,
        comment: comment.trim(),
      };

      const res = await reviewService.saveDoctorReview(payload);
      if (res?.success) {
        showToastSuccess(
          existingReview ? "Cập nhật thành công!" : "Đánh giá thành công!",
          existingReview
            ? "Đánh giá của bạn đã được cập nhật thành công trên hệ thống."
            : "Cảm ơn bạn đã gửi đánh giá quý báu giúp nâng cao chất lượng khám chữa bệnh!"
        );
        if (onSuccess) {
          onSuccess(res.data);
        }
        onClose();
      } else {
        showToastError("Thao tác thất bại", res?.message || "Không thể lưu đánh giá.");
      }
    } catch (err) {
      console.error(err);
      showToastError("Lỗi hệ thống", err.response?.data?.message || "Có lỗi xảy ra khi gửi đánh giá.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200">
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal */}
        <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-amber-300 text-lg shadow-inner">
              <i className="fas fa-star"></i>
            </div>
            <div>
              <h3 className="font-extrabold text-base tracking-tight">
                {existingReview ? "Chỉnh Sửa Đánh Giá Bác Sĩ" : "Đánh Giá Bác Sĩ & Ca Khám"}
              </h3>
              <p className="text-xs text-blue-100 font-medium">
                {existingReview
                  ? "Cập nhật lại mức độ hài lòng của bạn"
                  : "Ý kiến phản hồi giúp nâng cao chất lượng phòng khám"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
          >
            <i className="fas fa-times text-sm"></i>
          </button>
        </div>

        {/* Nội dung form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Thông tin bác sĩ & ca khám */}
          <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <img
              src={doctor.imageUrl || DEFAULT_DOCTOR_IMAGE}
              alt={doctor.fullName}
              className="w-13 h-13 rounded-xl object-cover border border-slate-200 shrink-0 shadow-2xs"
            />
            <div className="min-w-0 flex-1 text-xs">
              <span className="font-semibold text-blue-700 uppercase tracking-wider text-[10px] block">
                {doctor.specialtyName || "Bác sĩ Chuyên khoa"}
              </span>
              <h4 className="font-extrabold text-slate-900 text-sm truncate">
                {doctor.fullName}
              </h4>
              {appointment && (
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Mã ca khám: <strong className="font-mono text-slate-700">{appointment.appointmentCode}</strong>
                  {appointment.slotDate && ` • Ngày ${appointment.slotDate}`}
                </p>
              )}
            </div>
            {existingReview && (
              <span className="px-2 py-1 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-[10px] font-bold shrink-0">
                Đã có đánh giá
              </span>
            )}
          </div>

          {/* Chọn số sao tương tác */}
          <div className="space-y-2 text-center py-2 bg-amber-50/50 border border-amber-100 rounded-2xl">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Mức độ hài lòng của bạn
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isLit = star <= activeRating;
                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-2xl md:text-3xl transition-transform hover:scale-120 cursor-pointer focus:outline-hidden"
                  >
                    <i
                      className={`${
                        isLit ? "fas fa-star text-amber-400 drop-shadow-xs" : "far fa-star text-slate-300"
                      } transition-colors`}
                    ></i>
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-amber-900 min-h-[1.25rem] px-4">
              {starLabels[activeRating]}
            </p>
          </div>

          {/* Ô nhập nhận xét */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">
                Chia sẻ cảm nhận chi tiết của bạn <span className="text-rose-500">*</span>
              </label>
              <span className="text-[11px] text-slate-400 font-mono">
                {comment.length} ký tự
              </span>
            </div>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Ví dụ: Bác sĩ khám rất cẩn thận, giải thích rõ nguyên nhân bệnh và hướng dẫn uống thuốc chu đáo..."
              className="w-full text-xs p-3.5 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition resize-none leading-relaxed text-slate-800 placeholder:text-slate-400"
              maxLength={1000}
            />
            <p className="text-[11px] text-slate-500 flex items-center gap-1">
              <i className="fas fa-shield-alt text-blue-600"></i>
              <span>Mỗi bệnh nhân có thể đánh giá và chỉnh sửa đánh giá của mình 1 lần cho mỗi bác sĩ.</span>
            </p>
          </div>

          {/* Hành động */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <i className="fas fa-spinner fa-spin text-xs"></i>
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <i className="fas fa-paper-plane text-xs"></i>
                  <span>{existingReview ? "Cập Nhật Đánh Giá" : "Gửi Đánh Giá Ngay"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

