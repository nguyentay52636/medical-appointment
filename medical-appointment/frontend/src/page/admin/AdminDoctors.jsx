import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../component/common/Pagination';
import DoctorTable from '../../component/admin/DoctorTable';
import DoctorCreateModal from '../../component/admin/DoctorCreateModal';
import DoctorEditModal from '../../component/admin/DoctorEditModal';
import DoctorResetPasswordModal from '../../component/admin/DoctorResetPasswordModal';

export default function AdminDoctors() {
    const [searchParams] = useSearchParams();
    const { doctors, specialties, isLoading, deleteDoctor, fetchDoctors } = useAdmin();

    // Filters and Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedSpecialty, setSelectedSpecialty] = useState('ALL');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);

    // Modals State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingDoctor, setEditingDoctor] = useState(null);
    const [resetPwDoctor, setResetPwDoctor] = useState(null);

    // Auto-open create dialog if URL has ?action=create
    useEffect(() => {
        if (searchParams.get('action') === 'create') {
            setShowCreateModal(true);
        }
    }, [searchParams]);

    // Reset to page 1 when filtering or searching
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedSpecialty, pageSize]);

    // Filter doctors
    const filteredDoctors = doctors.filter((doc) => {
        const matchesName =
            (doc.fullName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (doc.email || '').toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSpec =
            selectedSpecialty === 'ALL' ||
            doc.specialtyId === Number(selectedSpecialty) ||
            doc.specialtyName === selectedSpecialty;
        return matchesName && matchesSpec;
    });

    // Pagination slicing
    const totalItems = filteredDoctors.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedDoctors = filteredDoctors.slice(startIndex, startIndex + pageSize);

    // Handlers
    const handleDeleteDoctor = async (id, name) => {
        if (!window.confirm(`Bạn có chắc chắn muốn xóa bác sĩ "${name}" khỏi hệ thống?`)) {
            return;
        }
        try {
            await deleteDoctor(id);
            alert('Đã xóa bác sĩ thành công!');
        } catch (err) {
            alert(err.response?.data?.message || 'Không thể xóa bác sĩ vì đã có dữ liệu lịch hẹn liên quan!');
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-user-md"></i>
                        </span>
                        Quản Lý Đội Ngũ Bác Sĩ
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Cấp tài khoản mới, điều chuyển chuyên khoa và quản lý thông tin bác sĩ toàn viện.
                    </p>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                    <button
                        onClick={fetchDoctors}
                        disabled={isLoading}
                        className="inline-flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer"
                        title="Tải lại danh sách bác sĩ"
                    >
                        <i className={`fas fa-sync-alt text-blue-600 ${isLoading ? 'fa-spin' : ''}`}></i>
                        <span className="hidden sm:inline">Làm mới</span>
                    </button>

                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition cursor-pointer"
                    >
                        <i className="fas fa-plus"></i> Cấp tài khoản mới
                    </button>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm bác sĩ theo tên, email..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Lọc chuyên khoa:</span>
                    <select
                        value={selectedSpecialty}
                        onChange={(e) => setSelectedSpecialty(e.target.value)}
                        className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full md:w-auto cursor-pointer"
                    >
                        <option value="ALL">Tất cả chuyên khoa ({doctors.length})</option>
                        {specialties?.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.specialtyName}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Doctor Table with Paginated Data */}
            <DoctorTable
                doctors={paginatedDoctors}
                isLoading={isLoading}
                onEdit={(doc) => setEditingDoctor(doc)}
                onResetPassword={(doc) => setResetPwDoctor(doc)}
                onDelete={handleDeleteDoctor}
            />

            {/* Clean Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[6, 12, 24, 48]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemName="bác sĩ"
            />

            {/* Modals and Dialogs */}
            <DoctorCreateModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
            />

            <DoctorEditModal
                doctor={editingDoctor}
                onClose={() => setEditingDoctor(null)}
            />

            <DoctorResetPasswordModal
                doctor={resetPwDoctor}
                onClose={() => setResetPwDoctor(null)}
            />
        </div>
    );
}
