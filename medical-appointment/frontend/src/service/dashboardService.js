import axios from "axios";
import { API_ENDPOINT } from "../config/apiConfig";

const getDoctorFromStorage = () => {
  try {
    const raw = sessionStorage.getItem("doctor");
    if (raw && raw !== "undefined" && raw !== "null") {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error("Lỗi parse thông tin bác sĩ từ sessionStorage:", err);
  }
  return null;
};

export const getDashboardStats = async () => {
  const doctor = getDoctorFromStorage();
  if (!doctor?.id) {
    return {
      totalAppointmentsToday: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      totalUniquePatientsToday: 0
    };
  }

  try {
    const response = await axios.get(`${API_ENDPOINT}/dashboard/stats`, {
      params: { doctorId: doctor.id },
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("❌ Lỗi khi gọi API /dashboard/stats:", error);
    return {
      totalAppointmentsToday: 0,
      pendingAppointments: 0,
      confirmedAppointments: 0,
      totalUniquePatientsToday: 0
    };
  }
};

export const getUpcomingAppointments = async () => {
  const doctor = getDoctorFromStorage();
  if (!doctor?.id) {
    return [];
  }

  try {
    const response = await axios.get(`${API_ENDPOINT}/dashboard/upcoming`, {
      params: { doctorId: doctor.id },
      withCredentials: true,
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Lỗi khi gọi API /dashboard/upcoming:", error);
    return [];
  }
};

export const getMissedAppointments = async () => {
  const doctor = getDoctorFromStorage();
  if (!doctor?.id) {
    return [];
  }

  try {
    const response = await axios.get(`${API_ENDPOINT}/dashboard/missed`, {
      params: { doctorId: doctor.id },
      withCredentials: true,
    });
    return Array.isArray(response.data) ? response.data : [];
  } catch (error) {
    console.error("❌ Lỗi khi gọi API /dashboard/missed:", error);
    return [];
  }
};