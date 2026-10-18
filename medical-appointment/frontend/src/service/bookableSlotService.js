import axios from "axios";
import { API_ENDPOINT } from "../config/apiConfig";

export const bookableSlotService = {
  /**
   * Lấy danh sách slot khả dụng của bác sĩ theo ngày
   * @param {number} doctorId - ID bác sĩ
   * @param {string} date - Ngày cần lấy lịch, định dạng "YYYY-MM-DD"
   * @returns {Promise<Array>} - Mảng slot khả dụng
   */
  getAvailableSlots: async (doctorId, date) => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/api/bookable_slots/doctor/${doctorId}/slots`, {
        params: { date }
      });
      return res.data;
    } catch (error) {
      console.error("Lỗi khi fetch slot:", error);
      return [];
    }
  }
};