import axios from "axios";
import { API_ENDPOINT } from "../config/apiConfig";

export const fetchDoctorSchedule = async (doctorId) => {
  const response = await axios.get(
    `${API_ENDPOINT}/api/availability/schedule?doctorId=${doctorId}`,
    { withCredentials: true }
  );

  const data = response.data;

  const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  const formatted = {};
  DAYS.forEach((d) => (formatted[d] = []));

  data.forEach((slot) => {
    const key = slot.dayOfWeek.trim().toLowerCase();
    const start = slot.startTime.split(":").slice(0, 2).join(":");
    const end = slot.endTime.split(":").slice(0, 2).join(":");

    formatted[key].push({
      timeRange: `${start}-${end}`,
      slotDurationMinutes: slot.slotDurationMinutes ?? 15
    });
  });

  return formatted;
};

export const updateDoctorSchedule = async (doctorId, request) => {
  const slots = request.slots.map(item => {
    return {
      startTime: item.startTime + ":00",
      endTime: item.endTime + ":00",
      slotDurationMinutes: item.slotDurationMinutes ?? 15
    };
  });

  const payload = {
    dayOfWeek: request.dayOfWeek,
    slots: slots
  };

  return axios.post(
    `${API_ENDPOINT}/api/availability/update?doctorId=${doctorId}`,
    payload,
    { withCredentials: true }
  );
};


export const fetchAllDoctor = {
  getAllDoctors: async () => {
    const res = await axios.get(`${API_ENDPOINT}/api/doctor/all`);
    return res.data;
  }
};

export const fetchDoctorsBySpecialtyId = {
  getDoctorsBySpecialtyId: async (specialtyId) => {
    const res = await axios.get(`${API_ENDPOINT}/api/doctor/specialty/${specialtyId}`);
    return res.data;
  },
};

export const changePasswordDoctor = {
  changePassword: async (id, passwordData) => {
    const res = await axios.put(`${API_ENDPOINT}/api/doctor/change_password/${id}`, passwordData);
    return res.data;
  }
};

export const fetchDoctorsSuggestByAI = async (patientAddress, patientSymptom) => {
  const payload = {
    patientAddress: patientAddress,
    patientSymptom: patientSymptom,
  };

  try {
    const res = await axios.post(
      `${API_ENDPOINT}/suggest-doctors`, payload);
    return res.data;

  } catch (error) {
    console.error("Error fetching suggested doctors:", error);
    throw error;
  }
};

// Lấy bác sĩ gần đây theo vĩ độ, kinh độ, số lượng và bán kính
export const fetchNearbyDoctors = async (lat, lng, topN = 5, radiusKm = 10) => {
  try {
    const res = await axios.get(`${API_ENDPOINT}/api/doctor/nearby`, {
      params: { lat, lng, topN, radiusKm }
    });
    return res.data; // danh sách bác sĩ gần nhất trong bán kính
  } catch (error) {
    console.error("Lỗi fetch bác sĩ gần đây:", error);
    return [];
  }
};



