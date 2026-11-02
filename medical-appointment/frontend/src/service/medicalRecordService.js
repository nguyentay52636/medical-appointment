import axios from "axios";
import { API_ENDPOINT } from '../config/apiConfig';

export const medicalRecordService = {
  // Lưu hoặc cập nhật hồ sơ bệnh án
  saveMedicalRecord: async (medicalRecordData) => {
    const res = await axios.post(`${API_ENDPOINT}/api/medical-record`, medicalRecordData, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  },

  // Lấy hồ sơ bệnh án theo appointmentId
  getMedicalRecordByAppointment: async (appointmentId) => {
    const res = await axios.get(`${API_ENDPOINT}/api/medical-record/appointment/${appointmentId}`);
    return res.data;
  },

  // Lấy danh sách hồ sơ bệnh án của một bệnh nhân
  getMedicalRecordsByPatient: async (patientId) => {
    const res = await axios.get(`${API_ENDPOINT}/api/medical-record/patient/${patientId}`);
    return res.data;
  },

  // Lấy chi tiết hồ sơ bệnh án theo ID
  getMedicalRecordById: async (id) => {
    const res = await axios.get(`${API_ENDPOINT}/api/medical-record/${id}`);
    return res.data;
  }
};
