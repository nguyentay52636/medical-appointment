import axios from "axios";
import { API_ENDPOINT } from "../config/apiConfig";

export const reviewService = {
  // Lấy tổng quan đánh giá và danh sách nhận xét của bác sĩ
  getDoctorReviews: async (doctorId) => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/api/reviews/doctor/${doctorId}`);
      return res.data;
    } catch (error) {
      console.error("Lỗi lấy danh sách đánh giá bác sĩ:", error);
      throw error;
    }
  },

  // Lấy đánh giá của bệnh nhân đối với bác sĩ (nếu đã từng đánh giá)
  getPatientReviewForDoctor: async (doctorId, patientId) => {
    try {
      const res = await axios.get(
        `${API_ENDPOINT}/api/reviews/doctor/${doctorId}/patient/${patientId}`
      );
      return res.data;
    } catch (error) {
      console.error("Lỗi kiểm tra đánh giá của bệnh nhân:", error);
      throw error;
    }
  },

  // Tạo mới hoặc cập nhật đánh giá (Upsert: 1 bệnh nhân / 1 bác sĩ)
  saveDoctorReview: async (reviewData) => {
    try {
      const res = await axios.post(`${API_ENDPOINT}/api/reviews`, reviewData);
      return res.data;
    } catch (error) {
      console.error("Lỗi lưu đánh giá bác sĩ:", error);
      throw error;
    }
  },

  // Xóa đánh giá
  deleteReview: async (reviewId) => {
    try {
      const res = await axios.delete(`${API_ENDPOINT}/api/reviews/${reviewId}`);
      return res.data;
    } catch (error) {
      console.error("Lỗi xóa đánh giá:", error);
      throw error;
    }
  },
};

