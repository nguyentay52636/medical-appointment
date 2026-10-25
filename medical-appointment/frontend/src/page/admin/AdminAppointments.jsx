import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import Pagination from '../../component/common/Pagination';
import AppointmentTable from '../../component/admin/AppointmentTable';

export default function AdminAppointments() {
    const { appointments, isLoading, updateAppointmentStatus, fetchAppointments } = useAdmin();

    const [statusFilter, setStatusFilter] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');
    const [updatingId, setUpdatingId] = useState(null);

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(8);

    // Reset pagination to page 1 on filter or search changes
    useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, searchQuery, pageSize]);

    const handleUpdateStatus = async (appointmentId, newStatus) => {
        setUpdatingId(appointmentId);
        try {
            await updateAppointmentStatus(appointmentId, newStatus);
        } catch (err) {
            alert(err.response?.data?.message || err.message || 'Lỗi khi cập nhật trạng thái');
        } finally {
            setUpdatingId(null);
        }
    };

    const filteredAppointments = appointments.filter((appt) => {
        const matchesStatus =
            statusFilter === 'ALL' ||
            appt.status?.toLowerCase() === statusFilter.toLowerCase();
        const matchesSearch =
            (appt.patientName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.doctorName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.appointmentCode || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (appt.notes || '').toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    // Pagination slicing
    const totalItems = filteredAppointments.length;
    const startIndex = (currentPage - 1) * pageSize;
    const paginatedAppointments = filteredAppointments.slice(startIndex, startIndex + pageSize);

    return (
        <div className="space-y-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
                        <span className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center text-lg shadow-sm">
                            <i className="fas fa-calendar-check"></i>
                        </span>
                        Lịch Hẹn Toàn Phòng Khám
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        Theo dõi, rà soát và điều phối mọi ca khám bệnh của tất cả các chuyên khoa.
                    </p>
                </div>

                <button
                    onClick={fetchAppointments}
                    disabled={isLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold shadow-sm transition cursor-pointer self-start sm:self-auto"
                >
                    <i className={`fas fa-sync-alt text-blue-600 ${isLoading ? 'fa-spin' : ''}`}></i>
                    <span>Làm mới dữ liệu</span>
                </button>
            </div>

            {/* Filter Bar */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
                <div className="relative w-full md:w-80">
                    <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
                    <input
                        type="text"
                        placeholder="Tìm bệnh nhân, bác sĩ, mã lịch..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                    {[
                        { key: 'ALL', label: 'Tất cả' },
                        { key: 'pending', label: 'Chờ duyệt' },
                        { key: 'confirmed', label: 'Đã xác nhận' },
                        { key: 'completed', label: 'Đã khám' },
                        { key: 'rejected', label: 'Đã hủy' }
                    ].map((st) => (
                        <button
                            key={st.key}
                            onClick={() => setStatusFilter(st.key)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition cursor-pointer ${
                                statusFilter === st.key
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                        >
                            {st.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Appointment Table */}
            <AppointmentTable
                appointments={paginatedAppointments}
                isLoading={isLoading}
                updatingId={updatingId}
                onUpdateStatus={handleUpdateStatus}
            />

            {/* Pagination Component */}
            <Pagination
                currentPage={currentPage}
                totalItems={totalItems}
                pageSize={pageSize}
                pageSizeOptions={[8, 16, 24, 40]}
                onPageChange={setCurrentPage}
                onPageSizeChange={setPageSize}
                itemName="lịch hẹn"
            />
        </div>
    );
}
