import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../component/common/Pagination';
import PatientTable from '../../component/admin/PatientTable';

export default function AdminPatients() {
    const { patients, isLoading, deletePatient, fetchPatients } = useAdmin();

    const [searchQuery, setSearchQuery] = useState('');
    const [deletingId, setDeletingId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);

    // Reset pagination to page 1 on search or page size change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, pageSize]);

    const handleDeletePatient = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ bệnh nhân "${name}" (#${id}) khỏi hệ thống?`)) {
            return;
        }

        setDeletingId(id);
        try {
            await deletePatient(id);
            alert('Đã xóa hồ sơ bệnh nhân thành công!');
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Không thể xóa bệnh nhân do có ràng buộc lịch khám!');
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

    // Pagination slicing
    const totalItems = filteredPatients.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedPatients = filteredPatients.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-hospital-user"></i>
                        </span>
                        Danh Bạ Hồ Sơ Bệnh Nhân
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Tra cứu danh sách tài khoản bệnh nhân đã đăng ký khám tại phòng khám Klinik.
                    </p>
                </div>

                <button
                    onClick={fetchPatients}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                    <i className={`fas fa-sync-alt text-blue-600 ${isLoading ? 'fa-spin' : ''}`}></i>
                    <span>Làm mới dữ liệu</span>
                </button>
            </div>

            {/* Filter and Search Bar */}
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
                    Tổng số: <span className="text-blue-600 font-bold">{totalItems}</span> bệnh nhân trong hệ thống
                </div>
            </div>

            {/* Patient Table */}
            <PatientTable
                patients={paginatedPatients}
                isLoading={isLoading}
                deletingId={deletingId}
                onDelete={handleDeletePatient}
            />

            {/* Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[5, 10, 20, 50]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemName="bệnh nhân"
            />
        </div>
    );
}
