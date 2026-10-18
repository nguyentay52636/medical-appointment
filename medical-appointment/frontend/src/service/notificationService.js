import axios from 'axios';
import { API_ENDPOINT } from '../config/apiConfig';

/**
 * Lấy tất cả thông báo của bác sĩ
 * @param {number} doctorId 
 * @returns {Promise<Array>} danh sách NotificationDTO
 */
export const getAllNotifications = async (doctorId) => {
    try {
        const res = await axios.get(`${API_ENDPOINT}/api/notification/doctor/${doctorId}`);
        return res.data; // mảng NotificationDTO
    } catch (err) {
        console.error("Lỗi khi lấy tất cả thông báo:", err);
        return [];
    }
};

/**
 * Lấy số lượng thông báo chưa đọc của bác sĩ
 * @param {number} doctorId 
 * @returns {Promise<number>}
 */
export const getUnreadNotificationCount = async (doctorId) => {
    try {
        const res = await axios.get(`${API_ENDPOINT}/api/notification/doctor/${doctorId}/unread_count`);
        console.log('Unread count API raw =', res.data);
        // res.data is { messages: ..., notifications: ... }
        const notifications = res.data?.notifications ?? 0;
        return Number(notifications);
    } catch (err) {
        console.error("Lỗi khi lấy số lượng thông báo chưa đọc:", err);
        return 0;
    }
};

/**
 * Đánh dấu tất cả thông báo đã đọc
 * @param {number} doctorId 
 * @returns {Promise<boolean>}
 */
export const markAllNotificationsAsRead = async (doctorId) => {
    try {
        await axios.post(`${API_ENDPOINT}/api/notification/doctor/${doctorId}/mark_all_read`);
        return true;
    } catch (err) {
        console.error("Lỗi khi đánh dấu tất cả thông báo đã đọc:", err);
        return false;
    }
};
