import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import ToastContainer from '../component/common/ToastContainer';

const ToastContext = createContext(null);

// Global singleton helper for non-component calls
let globalToastHandler = null;

export const toast = {
  success: (title, message, duration) => globalToastHandler?.success(title, message, duration),
  error: (title, message, duration) => globalToastHandler?.error(title, message, duration),
  warning: (title, message, duration) => globalToastHandler?.warning(title, message, duration),
  info: (title, message, duration) => globalToastHandler?.info(title, message, duration),
  authSuccess: (userName, role) => globalToastHandler?.authSuccess(userName, role),
  logoutSuccess: (role) => globalToastHandler?.logoutSuccess(role),
  confirm: (options) => globalToastHandler?.confirm(options),
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Xác nhận',
    cancelText: 'Hủy bỏ',
    type: 'warning', // 'warning' | 'danger' | 'info'
    onConfirm: null,
    onCancel: null,
  });

  const nextIdRef = useRef(1);

  // Xóa toast theo ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Thêm một toast mới
  const showToast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = nextIdRef.current++;
    const newToast = {
      id,
      type,
      title: title || (type === 'success' ? 'Thành công' : type === 'error' ? 'Lỗi' : 'Thông báo'),
      message: message || '',
      duration,
      createdAt: Date.now(),
    };

    setToasts((prev) => [...prev.slice(-4), newToast]); // Giới hạn tối đa 5 toast cùng lúc để không choán màn hình
    return id;
  }, []);

  const success = useCallback((title, message, duration = 3500) => {
    if (!message && title) {
      return showToast({ type: 'success', title: 'Thành công', message: title, duration });
    }
    return showToast({ type: 'success', title, message, duration });
  }, [showToast]);

  const error = useCallback((title, message, duration = 4500) => {
    if (!message && title) {
      return showToast({ type: 'error', title: 'Đã xảy ra lỗi', message: title, duration });
    }
    return showToast({ type: 'error', title, message, duration });
  }, [showToast]);

  const warning = useCallback((title, message, duration = 4000) => {
    if (!message && title) {
      return showToast({ type: 'warning', title: 'Cảnh báo', message: title, duration });
    }
    return showToast({ type: 'warning', title, message, duration });
  }, [showToast]);

  const info = useCallback((title, message, duration = 3500) => {
    if (!message && title) {
      return showToast({ type: 'info', title: 'Thông tin', message: title, duration });
    }
    return showToast({ type: 'info', title, message, duration });
  }, [showToast]);

  // Toast chuyên biệt khi Đăng nhập thành công
  const authSuccess = useCallback((userName, role = 'patient') => {
    const roleTitle = role === 'doctor' ? 'Bác sĩ' : role === 'admin' ? 'Quản trị viên' : 'Quý khách';
    const nameDisplay = userName ? `${roleTitle} ${userName}` : roleTitle;
    return showToast({
      type: 'auth_login',
      title: 'Đăng nhập thành công!',
      message: `Chào mừng ${nameDisplay} quay trở lại với phòng khám đa khoa Klinik.`,
      duration: 4000,
    });
  }, [showToast]);

  // Toast chuyên biệt khi Đăng xuất thành công
  const logoutSuccess = useCallback((role = 'patient') => {
    const roleMsg = role === 'doctor' ? 'Tài khoản Bác sĩ' : role === 'admin' ? 'Tài khoản Quản trị' : 'Tài khoản';
    return showToast({
      type: 'auth_logout',
      title: 'Đăng xuất thành công',
      message: `${roleMsg} đã được đăng xuất an toàn khỏi hệ thống. Hẹn gặp lại bạn!`,
      duration: 3500,
    });
  }, [showToast]);

  // Hộp thoại xác nhận tương tác thay thế window.confirm
  const confirm = useCallback(({
    title = 'Xác nhận hành động',
    message = 'Bạn có chắc chắn muốn thực hiện hành động này?',
    confirmText = 'Xác nhận',
    cancelText = 'Hủy bỏ',
    type = 'warning',
    onConfirm,
    onCancel,
  }) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: async () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        if (onConfirm) await onConfirm();
      },
      onCancel: () => {
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
        if (onCancel) onCancel();
      },
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setConfirmModal((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const contextValue = {
    toasts,
    removeToast,
    showToast,
    success,
    error,
    warning,
    info,
    authSuccess,
    logoutSuccess,
    confirm,
  };

  // Đồng bộ global singleton
  globalToastHandler = contextValue;

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer
        toasts={toasts}
        onRemove={removeToast}
        confirmModal={confirmModal}
        onCloseConfirm={closeConfirm}
      />
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastContext;
