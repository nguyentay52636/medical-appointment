import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

export const adminService = {
    // 1. Quản lý Bác sĩ
    getAllDoctors: async () => {
        const res = await axios.get(`${API_BASE}/doctor/all`);
        return res.data;
    },

    createDoctor: async (doctorData) => {
        const res = await axios.post(`${API_BASE}/doctor/create`, doctorData);
        return res.data;
    },

    deleteDoctor: async (doctorId) => {
        const res = await axios.delete(`${API_BASE}/doctor/${doctorId}`);
        return res.data;
    },

    // 2. Quản lý Chuyên khoa
    getAllSpecialties: async () => {
        const res = await axios.get(`${API_BASE}/specialty/all`);
        return res.data;
    },

    // 3. Quản lý Lịch hẹn toàn viện
    getAllAppointments: async () => {
        const res = await axios.get(`${API_BASE}/appointment/all`);
        return res.data;
    },

    // 4. Quản lý Bệnh nhân
    getAllPatients: async () => {
        const res = await axios.get(`${API_BASE}/patient/all`);
        return res.data;
    }
};
