import apiClient from "../client";
import type {
  ApiResponse,
  SignUpRequest,
  SignInRequest,
  AuthenticationResponse,
  UserResponse,
  ForgotPasswordRequest,
  VerifyOTPRequest,
  ResetPasswordRequest,
} from "../../types";

const AUTH_ENDPOINT = "/auth";
const USERS_ENDPOINT = "/users";

export const authApi = {
  // Sign Up - Register new user
  signUp: async (data: SignUpRequest): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      `${USERS_ENDPOINT}/signup`,
      data
    );
    return response.data.result;
  },

  // Sign In - Authenticate user and get token
  signIn: async (data: SignInRequest): Promise<AuthenticationResponse> => {
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
      `${AUTH_ENDPOINT}/token`,
      data
    );
    return response.data.result;
  },

  // Get current user info (requires authentication)
  getMyInfo: async (): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `${USERS_ENDPOINT}/myInfo`
    );
    return response.data.result;
  },

  // Forgot Password - Request OTP
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    // TODO: Backend needs to implement this endpoint
    const response = await apiClient.post<ApiResponse<void>>(
      `${AUTH_ENDPOINT}/forgot-password`,
      data
    );
    return response.data.result;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPRequest): Promise<boolean> => {
    // TODO: Backend needs to implement this endpoint
    const response = await apiClient.post<ApiResponse<boolean>>(
      `${AUTH_ENDPOINT}/verify-otp`,
      data
    );
    return response.data.result;
  },

  // Reset Password
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    // TODO: Backend needs to implement this endpoint
    const response = await apiClient.post<ApiResponse<void>>(
      `${AUTH_ENDPOINT}/reset-password`,
      data
    );
    return response.data.result;
  },
};
