import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { authSuccess, error: showToastError, warning: showToastWarning } = useToast();

    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Nếu đã đăng nhập với role 'admin' rồi, tự động chuyển về dashboard
    useEffect(() => {
        try {
            const raw = sessionStorage.getItem('admin');
            if (raw) {
                const admin = JSON.parse(raw);
                if (admin && admin.role === 'admin') {
                    navigate('/admin/dashboard', { replace: true });
                }
            }
        } catch {
            // Ignore parse error
        }
    }, [navigate]);

    // Xử lý nạp nhanh tài khoản demo
    const handleQuickFill = () => {
        setIdentifier('admin@medicare.com');
        setPassword('admin123');
        setErrorMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMessage('');

        if (!identifier.trim() || !password) {
            setErrorMessage('Vui lòng nhập đầy đủ tên đăng nhập/email và mật khẩu.');
            showToastWarning('Thiếu thông tin', 'Vui lòng nhập tài khoản và mật khẩu quản trị.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await axios.post('http://localhost:8080/api/admin/login', {
                usernameOrEmail: identifier.trim(),
                password: password
            });

            const { admin, token, message } = response.data;

            // Kiểm tra phân quyền chuẩn: role bắt buộc phải là 'admin'
            if (!admin || !admin.role || admin.role.toLowerCase() !== 'admin') {
                const roleErrMsg = 'Tài khoản không có đặc quyền quản trị viên (role !== admin)!';
                setErrorMessage(roleErrMsg);
                showToastError('Truy cập bị từ chối', roleErrMsg);
                sessionStorage.removeItem('admin');
                setIsLoading(false);
                return;
            }

            // Lưu thông tin phiên đăng nhập
            sessionStorage.setItem('admin', JSON.stringify(admin));
            if (token) {
                sessionStorage.setItem('token', token);
            }

            // Hiển thị thông báo chào mừng
            authSuccess(admin.fullName || admin.username, 'admin');

            // Điều hướng tới trang đích (hoặc mặc định /admin/dashboard)
            const targetPath = location.state?.from?.pathname || '/admin/dashboard';
            navigate(targetPath, { replace: true });

        } catch (err) {
            console.error('Lỗi đăng nhập admin:', err);
            const errText = err.response?.data?.message || 'Đăng nhập không thành công. Vui lòng kiểm tra lại thông tin!';
            setErrorMessage(errText);
            showToastError('Đăng nhập thất bại', errText);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
            {/* Background glowing effects */}
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="w-full max-w-md z-10">
                {/* Header Logo & Title */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white shadow-xl shadow-blue-500/20 mb-4 border border-blue-400/30">
                        <i className="fas fa-shield-alt text-2xl"></i>
                    </div>
                    <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="font-black text-2xl tracking-wider text-white">KLINIK</span>
                        <span className="text-xs uppercase px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 border border-blue-500/40 font-bold tracking-widest">
                            Admin Portal
                        </span>
                    </div>
                    <h2 className="text-xl font-bold text-slate-100">Cổng Quản Trị Hệ Thống</h2>
                    <p className="text-sm text-slate-400 mt-1">
                        Xác thực quyền quản trị viên phòng khám (Role: <span className="text-emerald-400 font-mono font-bold">admin</span>)
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/50">
                    {/* Error Banner */}
                    {errorMessage && (
                        <div className="mb-6 p-4 rounded-xl bg-red-500/15 border border-red-500/30 flex items-start gap-3 text-red-300 text-sm animate-fadeIn">
                            <i className="fas fa-exclamation-triangle text-red-400 mt-0.5 flex-shrink-0 text-base"></i>
                            <div className="flex-1">
                                <p className="font-semibold">Đăng nhập không thành công</p>
                                <p className="text-xs text-red-300/90 mt-0.5">{errorMessage}</p>
                            </div>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Identifier field */}
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                                Tên đăng nhập hoặc Email Quản trị
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <i className="fas fa-user-shield text-sm"></i>
                                </div>
                                <input
                                    type="text"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    placeholder="admin@medicare.com hoặc admin"
                                    required
                                    autoFocus
                                    className="w-full pl-10 pr-4 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                                    Mật khẩu
                                </label>
                            </div>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                                    <i className="fas fa-lock text-sm"></i>
                                </div>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu quản trị viên"
                                    required
                                    className="w-full pl-10 pr-11 py-3 bg-slate-950/60 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300 transition"
                                    tabIndex={-1}
                                >
                                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'} text-sm`}></i>
                                </button>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-blue-600/30 transition duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                        >
                            {isLoading ? (
                                <>
                                    <i className="fas fa-spinner fa-spin text-base"></i>
                                    <span>Đang xác thực thông tin...</span>
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-sign-in-alt text-base"></i>
                                    <span>Đăng Nhập Quản Trị</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Quick Demo Credentials Box */}
                    <div className="mt-6 pt-5 border-t border-slate-800">
                        <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                                <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                                    <i className="fas fa-key text-amber-400"></i> Tài khoản Admin mẫu:
                                </p>
                                <p className="text-xs text-slate-200 font-mono mt-0.5 truncate">
                                    admin@medicare.com / admin123
                                </p>
                                <span className="inline-block mt-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-semibold">
                                    role: admin
                                </span>
                            </div>
                            <button
                                type="button"
                                onClick={handleQuickFill}
                                className="px-3 py-1.5 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 border border-blue-500/30 text-xs font-semibold transition flex-shrink-0 cursor-pointer"
                                title="Tự động điền tài khoản mẫu"
                            >
                                <i className="fas fa-magic mr-1"></i> Điền nhanh
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation Switchers */}
                <div className="mt-6 flex items-center justify-between text-xs text-slate-400 px-2">
                    <Link
                        to="/doctor/login"
                        className="hover:text-blue-300 transition flex items-center gap-1.5"
                    >
                        <i className="fas fa-user-md text-cyan-400"></i> Cổng Bác sĩ
                    </Link>
                    <Link
                        to="/patient/home"
                        className="hover:text-emerald-300 transition flex items-center gap-1.5"
                    >
                        <i className="fas fa-home text-emerald-400"></i> Về Website Phòng khám
                    </Link>
                </div>
            </div>
        </div>
    );
}
