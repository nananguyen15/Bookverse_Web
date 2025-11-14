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

  // POST create user (admin) - with image upload support
  create: async (data: Partial<User> & { password?: string; roles?: string[]; imageFile?: File }): Promise<User> => {
    const formData = new FormData();
    
    // Add text fields
    if (data.username) formData.append('username', data.username);
    if (data.password) formData.append('password', data.password);
    if (data.email) formData.append('email', data.email);
    if (data.name) formData.append('name', data.name);
    if (data.phone) formData.append('phone', data.phone);
    if (data.address) formData.append('address', data.address);
    if (data.active !== undefined) formData.append('active', String(data.active));
    
    // Add roles
    if (data.roles && data.roles.length > 0) {
      data.roles.forEach(role => formData.append('roles', role));
    }
    
    // Add image - either file or URL string
    if (data.imageFile) {
      // File upload
      formData.append('image', data.imageFile);
    } else if (data.image) {
      // URL/path string
      formData.append('imageUrl', data.image);
    }

    const response = await apiClient.post<ApiResponse<User>>(
      `${USERS_ENDPOINT}/create`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.result;
  },

  // PUT update user - with image upload support
  update: async (userId: string, data: Partial<User> & { imageFile?: File }): Promise<User> => {
    const formData = new FormData();
    
    // Add text fields (only if provided)
    if (data.name !== undefined) formData.append('name', data.name);
    if (data.phone !== undefined) formData.append('phone', data.phone);
    if (data.address !== undefined) formData.append('address', data.address);
    
    // Add image - either file or URL string
    if (data.imageFile) {
      // File upload
      formData.append('image', data.imageFile);
    } else if (data.image !== undefined) {
      // URL/path string (create empty file to satisfy multipart requirement)
      formData.append('imageUrl', data.image);
    }

    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/update/${userId}`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
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
