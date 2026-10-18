import React, { useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import doctorImg from "../../assets/doctor.webp";
import { PatientContext } from '../../context/PatientContext.jsx';
import { DoctorContext } from '../../context/DoctorContext.jsx';
import { GoogleLogin } from '@react-oauth/google';

function LoginForm({ role }) {
    const patientContext = useContext(PatientContext);
    const doctorContext = useContext(DoctorContext);

    const context = role === "patient" ? patientContext : doctorContext;
    const user = role === "patient" ? context?.patient : context?.doctor;
    const login = context?.login;

    const API_LOGIN_URL = role === "doctor"
        ? 'http://localhost:8080/api/doctor/login'
        : 'http://localhost:8080/api/patient/login';

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate(role === "patient" ? "/patient/booking" : "/doctor/dashboard", { replace: true });
        }
    }, [user, navigate, role]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // --- Login truyền thống ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setIsLoading(true);

        try {
            const response = await axios.post(API_LOGIN_URL, formData);
            const loggedUser = role === "doctor" ? response.data.doctor : response.data.patient;

            sessionStorage.setItem(role, JSON.stringify(loggedUser));
            sessionStorage.setItem('token', response.data.token);

            if (login) login(loggedUser);

            navigate(role === "patient" ? "/patient/booking" : "/doctor/dashboard");
            alert(role === "patient" ? "Đăng nhập thành công!" : response.data.message);
        } catch (err) {
            setError(err.response?.data?.message || 'Sai email hoặc mật khẩu');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Login Google OAuth2 (bác sĩ) ---
    const handleGoogleLoginSuccess = async (credentialResponse) => {
        const googleToken = credentialResponse.credential; // ID token của Google
        try {
            const res = await axios.post('http://localhost:8080/api/doctor/google-login', { idToken: googleToken });

            const loggedDoctor = res.data.doctor;
            sessionStorage.setItem('doctor', JSON.stringify(loggedDoctor));
            sessionStorage.setItem('token', res.data.token);

            if (doctorContext?.login) doctorContext.login(loggedDoctor);
            alert(res.data.message);
            navigate("/doctor/dashboard");
        } catch (err) {
            alert(err.response?.data?.message || 'Đăng nhập Google thất bại');
            console.error(err);
        }
    };

    const handleGoogleLoginFailure = (err) => {
        console.error(err);
        alert("Đăng nhập Google thất bại");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6 relative">
            <div className="w-full max-w-5xl h-[580px] bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-blue-200 flex overflow-hidden">

                <div className="hidden md:flex w-1/2 bg-blue-50 items-center justify-center rounded-l-2xl overflow-hidden">
                    <img src={doctorImg} alt="doctor" className="w-full h-full object-cover" />
                </div>

                <div className="w-full md:w-1/2 p-10">
                    <form onSubmit={handleSubmit}>
                        <button type="button"
                            className="absolute top-3 right-3 w-10 h-9 flex items-center justify-center rounded-full text-gray-400 hover:bg-red-500 hover:text-white transition cursor-pointer"
                            onClick={() => navigate(-1)}>X</button>

                        <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">Đăng Nhập</h2>

                        {message && <p className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 border border-green-200">{message}</p>}
                        {error && <p className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-200">⚠️ {error}</p>}

                        <div className="mb-4">
                            <label className="block text-lg font-medium text-gray-700 mb-1">Email</label>
                            <input type="text" name="email" value={formData.email} onChange={handleChange} required
                                placeholder="Nhập email của bạn"
                                className="h-15 w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition" />
                        </div>

                        <div className="mb-6 relative">
                            <label className="block text-lg font-medium text-gray-700 mb-1">Mật khẩu</label>

                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                required
                                placeholder="Nhập mật khẩu"
                                className="h-15 w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                            />

                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[50px] text-gray-500 hover:text-gray-700 cursor-pointer"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M3.98 8.223A10.477 10.477 0 0 0 1.5 12c2.28 4.049 6.53 7 10.5 7 1.57 0 3.14-.33 4.58-.98M6.223 6.223A10.45 10.45 0 0 1 12 5c3.97 0 8.22 2.951 10.5 7a10.52 10.52 0 0 1-2.24 3.02M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M3 3l18 18" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M1.5 12c2.28-4.049 6.53-7 10.5-7s8.22 2.951 10.5 7c-2.28 4.049-6.53 7-10.5 7S3.78 16.049 1.5 12Z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                            d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" />
                                    </svg>
                                )}
                            </button>
                        </div>

                        <div className="flex justify-end -mt-4 mb-6">
                            <a
                                href={role === "patient" ? "/patient/forgot_password" : "/doctor/forgot_password"}
                                className="text-blue-600 hover:text-blue-800 text-sm font-medium underline"
                            >
                                Quên mật khẩu?
                            </a>
                        </div>

                        <button type="submit" disabled={isLoading}
                            className={`w-full py-3 rounded-xl font-semibold transition duration-300 ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md text-lg cursor-pointer'}`}>
                            {isLoading ? 'Đang xác thực...' : 'Đăng Nhập'}
                        </button>

                        {role === "doctor" && (
                            <div className="mt-6 flex justify-center">
                                <GoogleLogin
                                    onSuccess={handleGoogleLoginSuccess}
                                    onError={handleGoogleLoginFailure}
                                />
                            </div>
                        )}

                        {role === "patient" && (
                            <p className="mt-6 text-center text-lg text-gray-500">
                                Chưa có tài khoản?{' '}
                                <a href="/patient/register" className="text-blue-600 hover:text-blue-800 font-medium underline">Đăng ký ngay</a>
                            </p>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default LoginForm;
