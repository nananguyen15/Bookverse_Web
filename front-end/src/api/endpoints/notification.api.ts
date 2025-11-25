import apiClient from "../client";
import type { ApiResponse } from "../../types";
import type { User } from "../../types/api/user.types";

export type NotificationType =
  | "FOR_CUSTOMERS_PERSONAL"
  | "FOR_STAFFS_PERSONAL"
  | "FOR_ADMINS_PERSONAL"
  | "FOR_CUSTOMERS"
  | "FOR_STAFFS"
  | "FOR_ADMINS";

export interface Notification {
  id: number;
  content: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  userId?: string; // For personal notifications - target user ID
}

export interface CreatePersonalNotificationRequest {
  content: string;
  type: NotificationType; // FOR_CUSTOMERS_PERSONAL | FOR_STAFFS_PERSONAL | FOR_ADMINS_PERSONAL
  targetUserId: string;
}

export interface CreateBroadcastNotificationRequest {
  content: string;
  type: NotificationType; // FOR_CUSTOMERS | FOR_STAFFS | FOR_ADMINS
}

export interface UpdateNotificationRequest {
  content: string;
  type: NotificationType;
}

const NOTIFICATION_ENDPOINT = "/notifications";

export const notificationApi = {
  // Admin/Staff: Get all notifications in the system
  getAll: async (): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      NOTIFICATION_ENDPOINT
    );
    return response.data.result;
  },

  // Admin/Staff: Get notifications by type
  getByType: async (type: NotificationType): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `${NOTIFICATION_ENDPOINT}/type/${type}`
    );
    return response.data.result;
  },

  // Admin/Staff: Create personal notification for specific user
  createPersonal: async (
    data: CreatePersonalNotificationRequest
  ): Promise<Notification> => {
    const response = await apiClient.post<ApiResponse<Notification>>(
      `${NOTIFICATION_ENDPOINT}/admin-create/personal`,
      data
    );
    return response.data.result;
  },

  // Admin/Staff: Create broadcast notification for all users with specific role
  // Returns list of users who received the notification
  createBroadcast: async (
    data: CreateBroadcastNotificationRequest
  ): Promise<User[]> => {
    const response = await apiClient.post<ApiResponse<User[]>>(
      `${NOTIFICATION_ENDPOINT}/admin-create/broadcast`,
      data
    );
    return response.data.result;
  },

  // Admin: Update notification
  update: async (
    id: number,
    data: UpdateNotificationRequest
  ): Promise<Notification> => {
    const response = await apiClient.put<ApiResponse<Notification>>(
      `${NOTIFICATION_ENDPOINT}/update/${id}`,
      data
    );
    return response.data.result;
  },

  // Admin/Staff: Delete any notification
  adminDelete: async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `${NOTIFICATION_ENDPOINT}/admin-delete/${id}`
    );
    return response.data.result;
  },

  // User: Get all notifications for current user
  getMyNotifications: async (): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `${NOTIFICATION_ENDPOINT}/myNotifications`
    );
    return response.data.result;
  },

  // User: Get first 5 notifications
  getFirst5: async (): Promise<Notification[]> => {
    const response = await apiClient.get<ApiResponse<Notification[]>>(
      `${NOTIFICATION_ENDPOINT}/myNotifications/first-5`
    );
    return response.data.result;
  },

  // User: Get unread count
  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<ApiResponse<number>>(
      `${NOTIFICATION_ENDPOINT}/myNotifications/unread-count`
    );
    return response.data.result;
  },

  // User: Mark single notification as read
  markAsRead: async (id: number): Promise<string> => {
    const response = await apiClient.put<ApiResponse<string>>(
      `${NOTIFICATION_ENDPOINT}/myNotifications/mark-one-read/${id}`
    );
    return response.data.result;
  },

  // User: Mark all notifications as read
  markAllRead: async (): Promise<string> => {
    const response = await apiClient.put<ApiResponse<string>>(
      `${NOTIFICATION_ENDPOINT}/myNotifications/mark-all-read`
    );
    return response.data.result;
  },

  // User: Delete own notification
  deleteMyNotification: async (id: number): Promise<string> => {
    const response = await apiClient.delete<ApiResponse<string>>(
      `${NOTIFICATION_ENDPOINT}/myNotifications/delete/${id}`
    );
    return response.data.result;
  },
};
