import apiClient from "../client";
import type { ApiResponse, User, SignUpRequest } from "../../types";

const USERS_ENDPOINT = "/users";

export const usersApi = {
  // GET my info
  getMyInfo: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      `${USERS_ENDPOINT}/myInfo`
    );
    return response.data.result;
  },

  // GET all users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(USERS_ENDPOINT);
    return response.data.result;
  },

  // GET user by ID
  getById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      `${USERS_ENDPOINT}/${userId}`
    );
    return response.data.result;
  },

  // GET staffs
  getStaffs: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/staffs`
    );
    return response.data.result;
  },

  // GET is user active
  isActive: async (userId: string): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `${USERS_ENDPOINT}/is-active/${userId}`
    );
    return response.data.result;
  },

  // GET inactive users
  getInactive: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET user ID by email
  getIdByEmail: async (email: string): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>(
      `${USERS_ENDPOINT}/id-by-email/${email}`
    );
    return response.data.result;
  },

  // GET customers
  getCustomers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/customers`
    );
    return response.data.result;
  },

  // GET active users
  getActive: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // POST sign up
  signUp: async (data: SignUpRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `${USERS_ENDPOINT}/signup`,
      data
    );
    return response.data.result;
  },

  // POST create user (admin) - correct endpoint
  create: async (data: Partial<User> & { password?: string; roles?: string[] }): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `${USERS_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  // PUT update user - correct endpoint
  update: async (userId: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/update/${userId}`,
      data
    );
    return response.data.result;
  },

  // PUT update my info
  updateMyInfo: async (data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/myInfo`,
      data
    );
    return response.data.result;
  },

  // PUT deactivate user - correct endpoint
  deactivate: async (userId: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/inactive/${userId}`
    );
    return response.data.result;
  },

  // PUT change role
  changeRole: async (userId: string, role: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/change-role/${userId}`,
      { role }
    );
    return response.data.result;
  },

  // PUT change my password
  changeMyPassword: async (data: { oldPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.put(
      `${USERS_ENDPOINT}/change-my-password`,
      data
    );
  },

  // PUT activate user - correct endpoint
  activate: async (userId: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/active/${userId}`
    );
    return response.data.result;
  },
};
