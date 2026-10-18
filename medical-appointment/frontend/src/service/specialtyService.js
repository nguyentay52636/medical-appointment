import axios from "axios";
import { API_ENDPOINT } from '../config/apiConfig';

export const specialtyService = {
  getAllSpecialties: async () => {
    const res = await axios.get(`${API_ENDPOINT}/api/specialty/all`);
    return res.data;
  }
};
