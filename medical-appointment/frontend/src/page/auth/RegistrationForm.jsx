import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import doctorImg from "../../assets/doctor.webp";
import { PatientContext } from '../../context/PatientContext.jsx';

const API_REGISTER_URL = 'http://localhost:8080/api/patient/register';

function RegistrationForm({ role }) {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    password: '',
    confirmPassword: '',
  });

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { patient } = useContext(PatientContext);

  useEffect(() => {
    if (patient) {
      if (role === "doctor") {
        navigate("/doctor/dashboard", { replace: true });
      } else {
        navigate("/patient/booking", { replace: true });
      }
    }
  }, [patient, navigate, role]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (formData.password !== formData.confirmPassword) {
      setError("Mật khẩu không khớp!");
      return;
    }

    if (formData.password.length < 6) {
      setError("Mật khẩu phải >= 6 ký tự!");
      return;
    }

    setIsLoading(true);

    try {
      const res = await axios.post(API_REGISTER_URL, {
        fullName: formData.fullName,
        email: formData.email,
        phoneNumber: formData.phoneNumber,
        address: formData.address,
        password: formData.password,
      });

      window.alert(`${res.data.message} Bạn vui lòng đăng nhập để đặt lịch.`);
      setError("");

      setTimeout(() => navigate("/patient/login"), 1000);

    } catch (err) {
      if (err.response?.status === 409 || err.response?.data?.message.includes("email")) {
        setError("Email này đã tồn tại. Vui lòng sử dụng email khác.");
      }
      else if (err.response?.status === 409 || err.response?.data?.message.includes("phoneNumber")) {
        setError("Số điện thoại này đã tồn tại. Vui lòng sử dụng số điện thoại khác.");
      }
      else {
        setError(err.response?.data?.message || "Lỗi hệ thống!");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6 relative">
      <div className="w-full max-w-6xl h-[650px] bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl border border-blue-200 flex overflow-hidden">

        {/* IMAGE LEFT */}
        <div className="hidden md:flex w-1/2 bg-blue-50 items-center justify-center rounded-l-2xl overflow-hidden">
          <img src={doctorImg} alt="doctor" className="w-full h-full object-cover" />
        </div>

        {/* FORM RIGHT */}
        <div className="w-full md:w-1/2 p-10 relative">
          <form onSubmit={handleSubmit}>
            <button
              type="button"
              className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full
            text-gray-400 hover:bg-red-500 hover:text-white transition cursor-pointer text-xl font-bold"
              onClick={() => navigate(-1)}
            >
              ×
            </button>

            <h2 className="text-4xl font-bold text-center mb-8 text-blue-700">
              Đăng Ký
            </h2>

            {message && <p className="p-3 mb-4 rounded-lg bg-green-100 text-green-700 border border-green-200 text-lg">{message}</p>}
            {error && <p className="p-3 mb-4 rounded-lg bg-red-100 text-red-700 border border-red-200 text-lg">⚠ {error}</p>}

            <input type="text" name="fullName" placeholder="Họ tên" required onChange={handleChange}
              className="h-14 w-full px-4 border border-gray-300 rounded-xl text-lg mb-4" />

            <input type="text" name="phoneNumber" placeholder="Số điện thoại" required onChange={handleChange}
              className="h-14 w-full px-4 border border-gray-300 rounded-xl text-lg mb-4" />

            <input type="email" name="email" placeholder="Email" required onChange={handleChange}
              className="h-14 w-full px-4 border border-gray-300 rounded-xl text-lg mb-4" />

            <input type="text" name="address" placeholder="Địa chỉ" required onChange={handleChange}
              className="h-14 w-full px-4 border border-gray-300 rounded-xl text-lg mb-4" />

            <div className="grid grid-cols-2 gap-4 mb-8">

              {/* Mật khẩu */}
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Mật khẩu"
                  required
                  onChange={handleChange}
                  className="h-14 w-full px-4 pr-12 border border-gray-300 rounded-xl text-lg"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
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

              {/* Nhập lại mật khẩu */}
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Nhập lại mật khẩu"
                  required
                  onChange={handleChange}
                  className="h-14 w-full px-4 pr-12 border border-gray-300 rounded-xl text-lg"
                />

                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-4 text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  {showConfirmPassword ? (

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

            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-xl font-semibold text-xl transition duration-300 ${isLoading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 text-white shadow-md"
                }`}
            >
              {isLoading ? "Đang xử lý..." : "Đăng Ký"}
            </button>

            <p className="mt-6 text-center text-lg text-gray-500">
              Đã có tài khoản?{" "}
              <a
                href="/patient/login"
                className="text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-2"
              >
                Đăng nhập ngay
              </a>
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}

export default RegistrationForm;
