import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ResetPassword({ role }) {
    const [token, setToken] = useState('');
    const [newPassword, setNewPassword] = useState('');
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
                ? 'http://localhost:8080/api/doctor/reset_password'
                : 'http://localhost:8080/api/patient/reset_password';

            const res = await axios.post(url, { token, newPassword }); // gửi JSON
            setMessage(res.data.message); // backend trả {message: "..."}
            navigate(role === "doctor" ? "/doctor/login" : "/patient/login", { replace: true })
        } catch (err) {
            setError(err.response?.data?.message || 'Đổi mật khẩu thất bại');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-50 p-6">
            <div className="w-full max-w-2xl bg-white p-12 rounded-2xl shadow-xl">
                <h2 className="text-4xl font-bold mb-3 text-center text-blue-700">Đặt lại mật khẩu</h2>
                <p className="text-center text-gray-600 mb-8 text-lg">
                    Nhập token từ email và mật khẩu mới của bạn
                </p>

                {message && <p className="p-4 mb-6 bg-green-100 text-green-700 border rounded-lg text-center">{message}</p>}
                {error && <p className="p-4 mb-6 bg-red-100 text-red-700 border rounded-lg text-center">⚠️ {error}</p>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2 text-lg">Token</label>
                        <input
                            type="text"
                            value={token}
                            onChange={(e) => setToken(e.target.value)}
                            placeholder="Nhập token từ email"
                            className="w-full p-5 text-lg border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <div className="mb-8">
                        <label className="block text-gray-700 font-semibold mb-2 text-lg">Mật khẩu mới</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="Nhập mật khẩu mới"
                            className="w-full p-5 text-lg border rounded-xl focus:outline-none focus:ring-3 focus:ring-blue-500"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-4 rounded-xl font-semibold text-xl transition duration-300 ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'} cursor-pointer`}
                    >
                        {isLoading ? 'Đang xử lý...' : 'Đặt lại mật khẩu'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default ResetPassword;
