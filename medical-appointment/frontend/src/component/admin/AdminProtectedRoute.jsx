import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/**
 * Route Guard cho cổng Quản trị viên (/admin/*)
 * Kiểm tra xem người dùng đã đăng nhập chưa và tài khoản có role === 'admin' hay không.
 * Nếu chưa hoặc không đúng role, điều hướng tới /admin/login và lưu lại trang đang truy cập.
 */
export default function AdminProtectedRoute({ children }) {
    const location = useLocation();

    const storedAdmin = sessionStorage.getItem('admin');
    let admin = null;
    try {
        admin = storedAdmin ? JSON.parse(storedAdmin) : null;
    } catch {
        admin = null;
    }

    if (!admin || !admin.role || admin.role.toLowerCase() !== 'admin') {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    return children;
}
