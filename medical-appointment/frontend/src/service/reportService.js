import axios from "axios";
import { API_ENDPOINT } from "../config/apiConfig";

export const reportService = {
  downloadAppointment: async (appointmentId) => {
    const response = await axios.get(
      `${API_ENDPOINT}/api/report/appointment/${appointmentId}`,
      { responseType: "blob" } // Nhận file PDF dạng blob
    );
    return response.data;
  }
};
