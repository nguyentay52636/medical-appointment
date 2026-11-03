import axios from "axios";
import { API_ENDPOINT } from '../config/apiConfig';

export const fetchChatResponse = async (message, sessionId = null, history = null) => {
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
};

export const fetchTriageConsultAI = async (message, sessionId = null, history = null) => {
    const payload = {
      message: message,
      sessionId: sessionId,
      history: history,
    };

    try {
      const res = await axios.post(`${API_ENDPOINT}/api/ai/triage-consult`, payload);
      return res.data;
    } catch (error) {
      console.error("Error fetching AI triage consultation:", error);
      throw error;
    }
};

export const fetchCrmRules = async () => {
    try {
      const res = await axios.get(`${API_ENDPOINT}/api/ai/crm-rules`);
      return res.data;
    } catch (error) {
      console.error("Error fetching CRM rules:", error);
      throw error;
    }
};