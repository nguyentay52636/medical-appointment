import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ForgotPassword({ role }) {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setIsLoading(true);

        try {
            const url = role === "doctor"
                ? 'http://localhost:8080/api/doctor/forgot_password'
                : 'http://localhost:8080/api/patient/forgot_password';

            const res = await axios.post(url, { email });
            setMessage(res.data.message);
            navigate(role === "doctor" ? "/doctor/login" : "/patient/login", {replace: true});
        } catch (err) {
            setError(err.response?.data?.message || 'Lỗi gửi email');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6 relative">
            <div className="w-full max-w-2xl bg-white p-12 rounded-2xl shadow-xl relative">
                {/* Nút X đóng form */}
                <button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:bg-red-500 hover:text-white transition cursor-pointer"
                >
                    X
                </button>

                <h2 className="text-4xl font-bold mb-3 text-center text-blue-700">Quên mật khẩu</h2>
                <p className="text-center text-gray-600 mb-8 text-lg">
                    Nhập email bạn đã dùng để đăng ký. Chúng tôi sẽ gửi link để đặt lại mật khẩu.
                </p>

                {message && <p className="p-4 mb-6 bg-green-100 text-green-700 border rounded-lg text-center">{message}</p>}
                {error && <p className="p-4 mb-6 bg-red-100 text-red-700 border rounded-lg text-center">⚠️ {error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-8">
                        <label className="block text-gray-700 font-semibold mb-2 text-lg">Email</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ví dụ: user@example.com"
                            className="w-full p-5 text-lg border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                        />
                        <p className="mt-2 text-sm text-gray-500">
                            Hãy nhập chính xác email mà bạn dùng để đăng ký. Nếu không nhớ, hãy kiểm tra email cũ hoặc liên hệ hỗ trợ.
                        </p>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-semibold text-xl transition duration-300 ${
                            isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                        } cursor-pointer`}
                    >
                        {isLoading ? 'Đang gửi...' : 'Gửi yêu cầu'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ForgotPassword;
