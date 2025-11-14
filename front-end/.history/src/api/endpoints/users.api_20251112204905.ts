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

  // POST create user (admin) - JSON only (no image upload in create)
  create: async (
    data: Partial<User> & {
      password: string;
    }
  ): Promise<User> => {
    // Backend now accepts JSON body with UserCreationRequest
    const requestBody = {
      username: data.username,
      password: data.password,
      email: data.email,
      name: data.name,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      image: data.image, // Can pass image URL/path as string
      active: data.active !== undefined ? data.active : true,
    };

    const response = await apiClient.post<ApiResponse<User>>(
      `${USERS_ENDPOINT}/create`,
      requestBody
    );
    return response.data.result;
  },

  // PUT update user - with image upload support
  update: async (
    userId: string,
    data: Partial<User> & { imageFile?: File }
  ): Promise<User> => {
    const formData = new FormData();

    // Add text fields (only if provided)
    if (data.name !== undefined) formData.append("name", data.name);
    if (data.phone !== undefined) formData.append("phone", data.phone);
    if (data.address !== undefined) formData.append("address", data.address);

    // Add image - either file or URL string
    if (data.imageFile) {
      // File upload
      formData.append("image", data.imageFile);
    } else if (data.image !== undefined) {
      // URL/path string
      formData.append("imageUrl", data.image);
    }

    // Don't set Content-Type - let browser set it with boundary
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/update/${userId}`,
      formData
    );
    return response.data.result;
  },

  // PUT update my info - JSON only (UserUpdateRequest)
  updateMyInfo: async (data: Partial<User>): Promise<User> => {
    // Backend accepts UserUpdateRequest (JSON) - no password field
    const requestBody = {
      name: data.name,
      phone: data.phone,
      address: data.address,
      birthDate: data.birthDate,
      image: data.image, // Can pass image URL/path as string
    };

    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/myInfo`,
      requestBody
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

  // PUT change role - toggles between CUSTOMER and STAFF
  changeRole: async (userId: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/change-role/${userId}`
    );
    return response.data.result;
  },

  // PUT change my password
  changeMyPassword: async (data: {
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await apiClient.put(`${USERS_ENDPOINT}/change-my-password`, data);
  },

  // PUT activate user - correct endpoint
  activate: async (userId: string): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>(
      `${USERS_ENDPOINT}/active/${userId}`
    );
    return response.data.result;
  },
};
