import axios from "axios";
import { API_ENDPOINT } from '../config/apiConfig';

export const appointmentService = {
  getAppointmentsByPatientId: async (patientId) => {
    const res = await axios.get(`${API_ENDPOINT}/api/appointment/patient/${patientId}`);
    return res.data;
  },

  createAppointment: async (appointmentData) => {
    const res = await axios.post(`${API_ENDPOINT}/api/appointment/save`, appointmentData, {
      headers: { "Content-Type": "application/json" }
    });
    return res.data;
  },

  getPaymentResult: async (vnpTxnRef, vnpResponseCode, allParams = {}) => {
    const res = await axios.get(`${API_ENDPOINT}/api/appointment/payment/result`, {
      params: {
        ...allParams,
        vnp_TxnRef: vnpTxnRef,
        vnp_ResponseCode: vnpResponseCode
      }
    });
    return res.data;
  },

  checkPaymentStatus: async (appointmentId) => {
    const res = await axios.get(`${API_ENDPOINT}/api/appointment/payment/status/${appointmentId}`);
    return res.data;
  },

  payDirect: async (appointmentId) => {
    const res = await axios.post(`${API_ENDPOINT}/api/appointment/payment/pay-direct/${appointmentId}`);
    return res.data;
  },

  recreatePaymentUrl: async (appointmentId) => {
    const res = await axios.post(`${API_ENDPOINT}/api/appointment/payment/create-url/${appointmentId}`);
    return res.data;
  },

  rejectAppointment: async (doctorId, appointmentId) => {
    const res = await axios.post(
      `${API_ENDPOINT}/api/appointment/doctor/${doctorId}/reject/${appointmentId}`
    );
    return res.data;
  },

  rescheduleAppointment: async (appointmentId, payload) => {
    const { date, time } = payload;
    const res = await axios.put(`${API_ENDPOINT}/api/appointment/reschedule/${appointmentId}`, { date, time });
    return res.data;
  },

  autoExpireAppointment: async (appointmentId) => {
    return axios.put(`${API_ENDPOINT}/api/appointment/expired/${appointmentId}`);
  },

};