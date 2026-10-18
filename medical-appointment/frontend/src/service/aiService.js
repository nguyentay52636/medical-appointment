import axios from "axios";
import { API_ENDPOINT } from '../config/apiConfig';

export const fetchChatResponse= async (message, sessionId = null, history = null) => {
    const payload = {
      message: message,
      sessionId: sessionId,
      history: history,
    };

    try {
      const res = await axios.post(`${API_ENDPOINT}/api/rag-chat/ask`, payload);
        return res.data;
      
    } catch (error) {
      console.error("Error fetching chat response:", error);
      throw error; 
    }
}