import React, { useEffect, useState, useRef } from 'react';

// Cấu hình màu sắc, icon, border cho từng loại thông báo
const toastStyles = {
  success: {
    bg: 'bg-white border-emerald-200 shadow-emerald-500/10',
    accent: 'bg-emerald-500 text-white',
    progressBar: 'bg-emerald-500',
    titleColor: 'text-slate-900',
    icon: 'fas fa-check-circle',
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  error: {
    bg: 'bg-white border-rose-200 shadow-rose-500/10',
    accent: 'bg-rose-500 text-white',
    progressBar: 'bg-rose-500',
    titleColor: 'text-slate-900',
    icon: 'fas fa-circle-exclamation',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  warning: {
    bg: 'bg-white border-amber-200 shadow-amber-500/10',
    accent: 'bg-amber-500 text-white',
    progressBar: 'bg-amber-500',
    titleColor: 'text-slate-900',
    icon: 'fas fa-triangle-exclamation',
    badge: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  info: {
    bg: 'bg-white border-blue-200 shadow-blue-500/10',
    accent: 'bg-blue-600 text-white',
    progressBar: 'bg-blue-600',
    titleColor: 'text-slate-900',
    icon: 'fas fa-circle-info',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  auth_login: {
    bg: 'bg-white border-blue-300 shadow-blue-600/15 ring-1 ring-blue-100',
    accent: 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-md shadow-blue-500/20',
    progressBar: 'bg-blue-600',
    titleColor: 'text-blue-950 font-extrabold',
    icon: 'fas fa-user-check',
    badge: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  auth_logout: {
    bg: 'bg-white border-slate-300 shadow-slate-600/10',
    accent: 'bg-slate-800 text-white shadow-md shadow-slate-900/20',
    progressBar: 'bg-slate-700',
    titleColor: 'text-slate-900',
    icon: 'fas fa-right-from-bracket',
    badge: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

// Item Toast hiển thị
function ToastItem({ toast, onRemove }) {
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);
  const [isClosing, setIsClosing] = useState(false);
  const startTimeRef = useRef(Date.now());
  const remainingTimeRef = useRef(toast.duration);

  const style = toastStyles[toast.type] || toastStyles.info;

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onRemove(toast.id);
    }, 250);
  };

  useEffect(() => {
    if (toast.duration <= 0) return;

    let intervalId;
    if (!isPaused) {
      const step = 50;
      intervalId = setInterval(() => {
        remainingTimeRef.current -= step;
        const pct = Math.max(0, (remainingTimeRef.current / toast.duration) * 100);
        setProgress(pct);

        if (remainingTimeRef.current <= 0) {
          clearInterval(intervalId);
          handleClose();
        }
      }, step);
    }

    return () => clearInterval(intervalId);
  }, [isPaused, toast.duration]);

  return (
    <div
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className={`relative w-88 sm:w-96 max-w-[calc(100vw-2rem)] rounded-2xl border shadow-xl overflow-hidden transition-all duration-300 transform pointer-events-auto ${style.bg} ${
        isClosing ? 'opacity-0 translate-x-12 scale-95' : 'opacity-100 translate-x-0 scale-100 animate-slide-in-right'
      }`}
    >
      <div className="p-4 flex items-start gap-3.5">
        {/* Icon huy hiệu y tế */}
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-base ${style.accent}`}>
          <i className={style.icon}></i>
        </div>

        {/* Nội dung thông báo */}
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2">
            <h4 className={`text-sm font-bold leading-tight ${style.titleColor}`}>
              {toast.title}
            </h4>
          </div>
          {toast.message && (
            <p className="text-xs text-slate-600 mt-1 leading-relaxed break-words">
              {toast.message}
            </p>
          )}
        </div>

        {/* Nút đóng */}
        <button
          type="button"
          onClick={handleClose}
          className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition cursor-pointer shrink-0 text-xs"
          title="Đóng thông báo"
        >
          ✕
        </button>
      </div>

      {/* Thanh đo thời gian tự đóng */}
      {toast.duration > 0 && (
        <div className="w-full bg-slate-100 h-1 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${style.progressBar}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// Modal Xác Nhận (Confirm Dialog)
function ConfirmModal({ config, onClose }) {
  if (!config.isOpen) return null;

  const isDanger = config.type === 'danger';
  const isLogout = config.title?.toLowerCase().includes('đăng xuất') || config.message?.toLowerCase().includes('đăng xuất');

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-scaleUp">
        
        {/* Nội dung modal */}
        <div className="p-6 text-center space-y-3.5">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-md ${
            isDanger || isLogout ? 'bg-rose-50 text-rose-600 border border-rose-200' : 'bg-blue-50 text-blue-600 border border-blue-200'
          }`}>
            <i className={isLogout ? 'fas fa-right-from-bracket' : isDanger ? 'fas fa-triangle-exclamation' : 'fas fa-circle-question'}></i>
          </div>

          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            {config.title}
          </h3>

          <p className="text-xs text-slate-600 leading-relaxed px-4">
            {config.message}
          </p>
        </div>

        {/* Nút hành động */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={config.onCancel || onClose}
            className="px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200 transition cursor-pointer"
          >
            {config.cancelText || 'Hủy bỏ'}
          </button>
          <button
            type="button"
            onClick={config.onConfirm}
            className={`px-5 py-2 rounded-xl text-white text-xs font-semibold transition shadow-xs cursor-pointer ${
              isDanger || isLogout ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20' : 'bg-blue-600 hover:bg-blue-700 shadow-blue-600/20'
            }`}
          >
            {config.confirmText || 'Xác nhận'}
          </button>
        </div>

      </div>
    </div>
  );
}

// Container chính bọc cả danh sách Toast và Confirm Modal
export default function ToastContainer({ toasts, onRemove, confirmModal, onCloseConfirm }) {
  return (
    <>
      {/* Vị trí Toast góc trên bên phải */}
      <aside
        aria-live="polite"
        className="fixed top-5 right-5 z-[99999] flex flex-col gap-3 pointer-events-none"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={onRemove} />
        ))}
      </aside>

      {/* Modal xác nhận */}
      {confirmModal && <ConfirmModal config={confirmModal} onClose={onCloseConfirm} />}
    </>
  );
}
