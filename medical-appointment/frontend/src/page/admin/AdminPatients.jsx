import React, { useState, useEffect } from 'react';
import { adminService } from '../../service/adminService';

export default function AdminPatients() {
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);

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

    useEffect(() => {
        fetchPatients();
    }, []);

    const handleDeletePatient = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân "${name}" (#${id}) khỏi hệ thống?`)) {
            return;
        }

        setDeletingId(id);
        try {
            await adminService.deletePatient(id);
            alert("Đã xóa hồ sơ bệnh nhân thành công!");
            setPatients(prev => prev.filter(p => p.id !== id));
        } catch (err) {
            alert(err.response?.data?.message || err.message || "Không thể xóa bệnh nhân do có ràng buộc lịch khám!");
        } finally {
            setDeletingId(null);
        }
    };

    const filteredPatients = patients.filter((p) => {
        return (
            (p.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.phoneNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (p.address || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-hospital-user"></i>
                        </span>
                        Danh Sách Bệnh Nhân Đăng Ký
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Quản lý danh bạ hồ sơ bệnh nhân, thông tin liên hệ và lịch sử tài khoản.
                    </p>
                </div>

                <button
                    onClick={fetchPatients}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                    <i className="fas fa-sync-alt text-blue-600"></i> Làm mới danh bạ
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-96">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm bệnh nhân theo tên, email, SĐT, địa chỉ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="text-xs text-slate-500 font-semibold">
                    Tổng số: <span className="text-blue-600 font-bold">{filteredPatients.length}</span> bệnh nhân trong hệ thống
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 uppercase font-bold text-xs tracking-wider">
                            <tr>
                                <th className="px-5 py-4">Mã BN</th>
                                <th className="px-5 py-4">Họ và Tên</th>
                                <th className="px-5 py-4">Email Liên Hệ</th>
                                <th className="px-5 py-4">Số Điện Thoại</th>
                                <th className="px-5 py-4">Địa Chỉ</th>
                                <th className="px-5 py-4 text-center">Trạng Thái</th>
                                <th className="px-5 py-4 text-center">Thao Tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
                                        <i className="fas fa-spinner fa-spin text-2xl mb-2 block"></i>
                                        Đang tải dữ liệu bệnh nhân...
                                    </td>
                                </tr>
                            ) : filteredPatients.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-12 text-slate-400">
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
                                                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-extrabold text-xs flex items-center justify-center border border-blue-200/60 flex-shrink-0">
                                                    {(p.fullName || 'B').charAt(0).toUpperCase()}
                                                </div>
                                                <span className="font-bold text-slate-900">{p.fullName}</span>
                                            </div>
                                        </td>
                                        <td className="px-5 py-4 text-xs font-mono font-medium text-slate-800">
                                            {p.email}
                                        </td>
                                        <td className="px-5 py-4 text-xs font-medium text-slate-700">
                                            {p.phoneNumber || 'Chưa cung cấp'}
                                        </td>
                                        <td className="px-5 py-4 text-xs text-slate-500 max-w-xs truncate">
                                            {p.address || 'Chưa cập nhật'}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                                <i className="fas fa-check-circle text-[10px] mr-1"></i> Đã kích hoạt
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                onClick={() => handleDeletePatient(p.id, p.fullName)}
                                                disabled={deletingId === p.id}
                                                className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer disabled:opacity-50"
                                                title="Xóa hồ sơ bệnh nhân"
                                            >
                                                <i className="fas fa-trash-alt"></i>
                                            </button>
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
