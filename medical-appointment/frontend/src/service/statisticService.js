import axios from "axios";
import { API_ENDPOINT } from '../config/apiConfig';
export const statisticService = {
    //Lấy dữ liệu thống kê biểu đồ tròn
  getAppointmentStatistics: async (month, year,doctorId) => { 
    const res = await axios.get(`${API_ENDPOINT}/api/appointment/statistics/status`, {
        params: {
            month: month,
            year: year,
            doctorId: doctorId
        }
    });
    return res.data;
    
}, 
  //API cho Biểu đồ Cột + Đường: Doanh Thu & Lượt Khám
    getYearlyRevenuePatientStatistics: async (year,doctorId) => {
      const res = await axios.get(`${API_ENDPOINT}/api/appointment/statistics/revenue-patient`, {
          params: { 
            year:year,
            doctorId:doctorId
           }
      });
      return res.data; 
  },
//Lấy Bảng Báo Cáo Chi Tiết Lịch Hẹn
  getDetailedAppointmentReport: async (startDate, endDate,doctorId) => {
    // URL: /api/appointment/reports/detailed-list
    const res = await axios.get(`${API_ENDPOINT}/api/appointment/reports/detailed-list`, {
        params: { 
            startDate: startDate, // Dạng chuỗi YYYY-MM-DD
            endDate: endDate,      // Dạng chuỗi YYYY-MM-DD
            doctorId:doctorId
        }
    });
    // Trả về DetailedReportResponse { totalRevenue, appointments: [] }
    return res.data; 
}
};