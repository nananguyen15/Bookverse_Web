import apiClient from "../client";
import type {
  ApiResponse,
  User,
  SignUpRequest,
  UserUpdateRequest,
  UserCreateRequest,
} from "../../types";

const USERS_ENDPOINT = "/users";

export const usersApi = {
  // POST /api/users/create - Create new user (Admin)
  create: async (data: UserCreateRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `${USERS_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  // POST /api/users/signup - Sign up new customer
  signUp: async (data: SignUpRequest): Promise<User> => {
    const response = await apiClient.post<ApiResponse<User>>(
      `${USERS_ENDPOINT}/signup`,
      data
    );
    return response.data.result;
  },

  // GET /api/users - Get all users
  getAll: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(USERS_ENDPOINT);
    return response.data.result;
  },

  // GET /api/users/{userId} - Get user by ID
  getById: async (userId: string): Promise<User> => {
    const response = await apiClient.get<User>(`${USERS_ENDPOINT}/${userId}`);
    // Backend returns User directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/users/myInfo - Get current user info
  getMyInfo: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>(
      `${USERS_ENDPOINT}/myInfo`
    );
    return response.data.result;
  },

  // PUT /api/users/myInfo - Update current user info
  updateMyInfo: async (data: UserUpdateRequest): Promise<User> => {
    const response = await apiClient.put<User>(
      `${USERS_ENDPOINT}/myInfo`,
      data
    );
    // Backend returns User directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/users/update/{userId} - Update user by ID
  update: async (userId: string, data: UserUpdateRequest): Promise<User> => {
    const response = await apiClient.put<User>(
      `${USERS_ENDPOINT}/update/${userId}`,
      data
    );
    // Backend returns User directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/users/change-role/{userId} - Toggle user role (Customer <-> Staff)
  changeRole: async (userId: string): Promise<User> => {
    const response = await apiClient.put<User>(
      `${USERS_ENDPOINT}/change-role/${userId}`
    );
    // Backend returns User directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/users/customers - Get all customers
  getCustomers: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/customers`
    );
    return response.data.result;
  },

  // GET /api/users/staffs - Get all staffs
  getStaffs: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/staffs`
    );
    return response.data.result;
  },

  // GET /api/users/active - Get all active users
  getActive: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET /api/users/inactive - Get all inactive users
  getInactive: async (): Promise<User[]> => {
    const response = await apiClient.get<ApiResponse<User[]>>(
      `${USERS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET /api/users/is-active/{userId} - Check if user is active
  isActive: async (userId: string): Promise<boolean> => {
    const response = await apiClient.get<boolean>(
      `${USERS_ENDPOINT}/is-active/${userId}`
    );
    return response.data;
  },

  // PUT /api/users/active/{userId} - Activate user
  activate: async (userId: string): Promise<User> => {
    const response = await apiClient.put<User>(
      `${USERS_ENDPOINT}/active/${userId}`
    );
    // Backend returns User directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/users/inactive/{userId} - Deactivate user (soft delete)
  deactivate: async (userId: string): Promise<User> => {
    const response = await apiClient.put<User>(
      `${USERS_ENDPOINT}/inactive/${userId}`
    );
    // Backend returns User directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/users/id-by-email/{email} - Get user ID by email
  getUserIdByEmail: async (email: string): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>(
      `${USERS_ENDPOINT}/id-by-email/${email}`
    );
    return response.data.result;
  },
};
