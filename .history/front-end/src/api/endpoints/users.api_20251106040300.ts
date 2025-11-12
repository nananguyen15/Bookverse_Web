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

  // GET staffs
  getStaffs: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/staffs`
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

  // GET inactive users
  getInactive: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/inactive`
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

  // POST create user (admin)
  create: async (data: SignUpRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      USERS_ENDPOINT,
      data
    );
    return response.data.result;
  },

  // PUT update user
  update: async (id: string, data: Partial<User>): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/${id}`,
      data
    );
    return response.data.result;
  },

  // PUT change role
  changeRole: async (id: string, role: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/${id}/change-role`,
      { role }
    );
    return response.data.result;
  },

  // PUT activate user
  activate: async (id: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/${id}/activate`
    );
    return response.data.result;
  },

  // PUT deactivate user
  deactivate: async (id: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/${id}/deactivate`
    );
    return response.data.result;
  },
};
