import axios from 'axios';
import { API_ENDPOINT } from '../config/apiConfig'; 

const PatientService = {
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
