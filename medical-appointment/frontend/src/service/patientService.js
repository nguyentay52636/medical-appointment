import axios from 'axios';
import { API_ENDPOINT } from '../config/apiConfig'; 

const PatientService = {
  // Lấy thông tin chi tiết patient theo ID
  getPatientById: async (id) => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/api/patient/${id}`);
      return res.data;
    } catch (error) {
      console.error("Lỗi lấy thông tin patient:", error);
      throw error;
    }
  },

  // Cập nhật thông tin patient
  updatePatient: async (id, patientData) => {
    try {
      const res = await axios.put(`${API_ENDPOINT}/api/patient/update/${id}`, patientData);
      return res.data;
    } catch (error) {
      console.error("Lỗi cập nhật patient:", error);
      throw error;
    }
  },

  // Đổi mật khẩu patient
  changePassword: async (id, passwordData) => {
    try {
      const res = await axios.put(`${API_ENDPOINT}/api/patient/change_password/${id}`, passwordData);
      return res.data;
    } catch (error) {
      console.error("Lỗi đổi mật khẩu:", error);
      throw error;
    }
  }
};

export default PatientService;
