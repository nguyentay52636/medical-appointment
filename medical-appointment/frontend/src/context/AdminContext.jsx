import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { adminService } from '../service/adminService';

const AdminContext = createContext(null);

export const AdminProvider = ({ children }) => {
    const [doctors, setDoctors] = useState([]);
    const [specialties, setSpecialties] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [patients, setPatients] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(Date.now());

    // Fetch all core admin datasets concurrently
    const refreshAll = useCallback(async () => {
        setIsLoading(true);
        try {
            const [docRes, specRes, apptRes, patRes] = await Promise.allSettled([
                adminService.getAllDoctors(),
                adminService.getAllSpecialties(),
                adminService.getAllAppointments(),
                adminService.getAllPatients()
            ]);

            if (docRes.status === 'fulfilled') setDoctors(docRes.value || []);
            if (specRes.status === 'fulfilled') setSpecialties(specRes.value || []);
            if (apptRes.status === 'fulfilled') setAppointments(apptRes.value || []);
            if (patRes.status === 'fulfilled') setPatients(patRes.value || []);

            setLastUpdated(Date.now());
        } catch (err) {
            console.error('Lỗi khi nạp dữ liệu AdminContext:', err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Initial load
    useEffect(() => {
        refreshAll();
    }, [refreshAll]);

    // Individual fetchers if needed
    const fetchDoctors = useCallback(async () => {
        try {
            const data = await adminService.getAllDoctors();
            setDoctors(data || []);
            return data;
        } catch (err) {
            console.error('Lỗi nạp danh sách bác sĩ:', err);
            throw err;
        }
    }, []);

    const fetchSpecialties = useCallback(async () => {
        try {
            const data = await adminService.getAllSpecialties();
            setSpecialties(data || []);
            return data;
        } catch (err) {
            console.error('Lỗi nạp danh sách chuyên khoa:', err);
            throw err;
        }
    }, []);

    const fetchAppointments = useCallback(async () => {
        try {
            const data = await adminService.getAllAppointments();
            setAppointments(data || []);
            return data;
        } catch (err) {
            console.error('Lỗi nạp danh sách lịch hẹn:', err);
            throw err;
        }
    }, []);

    const fetchPatients = useCallback(async () => {
        try {
            const data = await adminService.getAllPatients();
            setPatients(data || []);
            return data;
        } catch (err) {
            console.error('Lỗi nạp danh sách bệnh nhân:', err);
            throw err;
        }
    }, []);

    // Action: Cấp tài khoản bác sĩ mới
    const createDoctor = useCallback(async (doctorData) => {
        const result = await adminService.createDoctor(doctorData);
        // Refresh doctor list to get full specialty relationship from backend
        await fetchDoctors();
        return result;
    }, [fetchDoctors]);

    // Action: Cập nhật thông tin bác sĩ & chuyên khoa
    const updateDoctor = useCallback(async (doctorId, doctorData) => {
        const result = await adminService.updateDoctor(doctorId, doctorData);
        await fetchDoctors();
        return result;
    }, [fetchDoctors]);

    // Action: Đổi mật khẩu bác sĩ
    const resetDoctorPassword = useCallback(async (doctorId, newPassword) => {
        return await adminService.resetDoctorPassword(doctorId, newPassword);
    }, []);

    // Action: Xóa bác sĩ
    const deleteDoctor = useCallback(async (doctorId) => {
        const result = await adminService.deleteDoctor(doctorId);
        setDoctors(prev => prev.filter(d => d.id !== doctorId));
        return result;
    }, []);

    // Action: Upload ảnh đại diện
    const uploadAvatar = useCallback(async (file) => {
        return await adminService.uploadAvatar(file);
    }, []);

    // Action: Cập nhật trạng thái lịch hẹn
    const updateAppointmentStatus = useCallback(async (appointmentId, status) => {
        const result = await adminService.updateAppointmentStatus(appointmentId, status);
        setAppointments(prev =>
            prev.map(a => a.id === appointmentId ? { ...a, status } : a)
        );
        return result;
    }, []);

    // Action: Xóa bệnh nhân
    const deletePatient = useCallback(async (patientId) => {
        const result = await adminService.deletePatient(patientId);
        setPatients(prev => prev.filter(p => p.id !== patientId));
        return result;
    }, []);

    // Computed KPI Metrics & Statistics
    const stats = useMemo(() => {
        const pendingAppointments = appointments.filter(
            a => a.status === 'pending' || a.status === 'Chờ duyệt'
        ).length;
        const confirmedAppointments = appointments.filter(
            a => a.status === 'confirmed' || a.status === 'Đã xác nhận'
        ).length;
        const completedAppointments = appointments.filter(
            a => a.status === 'completed' || a.status === 'Đã khám'
        ).length;
        const rejectedAppointments = appointments.filter(
            a => a.status === 'rejected' || a.status === 'cancelled' || a.status === 'Đã hủy'
        ).length;

        const estimatedRevenue = appointments
            .filter(a => a.status === 'completed' || a.status === 'confirmed')
            .reduce((sum, a) => sum + (a.price || 200000), 0);

        return {
            totalDoctors: doctors.length,
            totalSpecialties: specialties.length,
            totalAppointments: appointments.length,
            pendingAppointments,
            confirmedAppointments,
            completedAppointments,
            rejectedAppointments,
            totalPatients: patients.length,
            estimatedRevenue
        };
    }, [doctors, specialties, appointments, patients]);

    const value = {
        doctors,
        setDoctors,
        specialties,
        setSpecialties,
        appointments,
        setAppointments,
        patients,
        setPatients,
        isLoading,
        lastUpdated,
        stats,
        refreshAll,
        fetchDoctors,
        fetchSpecialties,
        fetchAppointments,
        fetchPatients,
        createDoctor,
        updateDoctor,
        resetDoctorPassword,
        deleteDoctor,
        uploadAvatar,
        updateAppointmentStatus,
        deletePatient
    };

    return (
        <AdminContext.Provider value={value}>
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (!context) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
