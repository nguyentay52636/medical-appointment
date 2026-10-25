import React, { useState, useEffect } from 'react';
import { adminService } from '../../service/adminService';

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchPatients = async () => {
            setIsLoading(true);
            try {
                const data = await adminService.getAllPatients();
                setPatients(data || []);
            } catch (err) {
                console.error("Lỗi tải danh sách bệnh nhân:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPatients();
    }, []);

    const filteredPatients = patients.filter((p) => {
        return (
            (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.phoneNumber || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Danh Sách Bệnh Nhân Đăng Ký
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Quản lý danh bạ hồ sơ bệnh nhân, thông tin liên hệ và lịch sử tài khoản.
                </p>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm bệnh nhân theo tên, email, SĐT..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                    Tổng số: <span className="text-blue-600 font-bold">{filteredPatients.length}</span> bệnh nhân
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-semibold text-xs tracking-wider">
                            <tr>
                                <th className="px-5 py-4">Mã BN</th>
                                <th className="px-5 py-4">Họ và Tên</th>
                                <th className="px-5 py-4">Email</th>
                                <th className="px-5 py-4">Số Điện Thoại</th>
                                <th className="px-5 py-4">Địa Chỉ</th>
                                <th className="px-5 py-4 text-center">Trạng Thái</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        <i className="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                                        Đang tải dữ liệu bệnh nhân...
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-12 text-slate-400">
                                        Không tìm thấy bệnh nhân nào.
                                    </td>
                                </tr>
                            ) : (
                                filteredPatients.map((p) => (
                                    <tr key={p.id} className="hover:bg-slate-50/70 transition">
                                        <td className="px-5 py-4 font-mono font-bold text-slate-700">
                                            #{p.id}
                                        </td>
                                        <td className="px-5 py-4">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 font-bold text-xs flex items-center justify-center">
                                                    {(p.fullName || 'B').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-900">{p.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-medium text-slate-700">
                                            {p.email}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-600">
                                            {p.phoneNumber || 'Chưa cung cấp'}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                                            {p.address || 'Chưa cập nhật'}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                Đã kích hoạt
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
