import axios from "axios";
import { API_ENDPOINT } from "../config/apiConfig";

export const getDashboardStats = async () => {
  const doctor = JSON.parse(sessionStorage.getItem("doctor"));
  if (!doctor?.id) {
    throw new Error("Không tìm thấy thông tin bác sĩ trong sessionStorage");
  }try {

    const response = await axios.get(`${API_ENDPOINT}/dashboard/stats`, {
        params: { doctorId: doctor.id },
        withCredentials: true,
      });
      
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API /dashboard/stats:", error);
    throw new Error(
      error.response?.data?.message || "Không thể tải dữ liệu Dashboard"
    );
  }
};


export const getUpcomingAppointments = async () => {
    const doctor = JSON.parse(sessionStorage.getItem("doctor"));
    if (!doctor?.id) {
      throw new Error("Không tìm thấy thông tin bác sĩ trong sessionStorage");
    }
  
    try {
      const response = await axios.get(`${API_ENDPOINT}/dashboard/upcoming`, {
        params: { doctorId: doctor.id },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      console.error("❌ Lỗi khi gọi API /dashboard/upcoming:", error);
      throw new Error(
        error.response?.data?.message || "Không thể tải lịch hẹn sắp tới"
      );
    }
  };

  export const getMissedAppointments = async () => {
    const doctor = JSON.parse(sessionStorage.getItem("doctor"));
    const response = await axios.get(`${API_ENDPOINT}/dashboard/missed`, {
      params: { doctorId: doctor.id },
      withCredentials: true,
    });
    return response.data;
  };