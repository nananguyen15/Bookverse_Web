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
  SendOTPRequest,
} from "../../types";

const AUTH_ENDPOINT = "/auth";
const USERS_ENDPOINT = "/users";
const OTP_ENDPOINT = "/otp";

export const authApi = {
  // Sign Up - Register new user
  signUp: async (data: SignUpRequest): Promise<UserResponse> => {
    const response = await apiClient.post<ApiResponse<UserResponse>>(
      `${USERS_ENDPOINT}/signup`,
      data
    );
    return response.data.result;
  },

  // Send OTP to email
  sendOTP: async (data: SendOTPRequest): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${OTP_ENDPOINT}/send-by-email`,
      {
        email: data.email,
        tokenType: data.tokenType || "LOGIN",
        userId: data.userId,
      }
    );
    return response.data.result;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPRequest): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${OTP_ENDPOINT}/verify`,
      {
        userId: data.userId,
        email: data.email,
        code: data.code,
        tokenType: data.tokenType || "LOGIN",
      }
    );
    return response.data.result;
  },

  // Sign In - Authenticate user and get token
  signIn: async (data: SignInRequest): Promise<AuthenticationResponse> => {
    console.log("🔐 SignIn request payload:", data);
    console.log("🔐 Request URL:", `${AUTH_ENDPOINT}/token`);
    
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
      `${AUTH_ENDPOINT}/token`,
      data
    );
    
    console.log("✅ SignIn response:", response.data);
    return response.data.result;
  },

  // Get current user info (requires authentication)
  getMyInfo: async (): Promise<UserResponse> => {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `${USERS_ENDPOINT}/myInfo`
    );
    return response.data.result;
  },

  // Get user ID by email (for forgot password flow)
  getUserIdByEmail: async (email: string): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>(
      `${USERS_ENDPOINT}/id-by-email/${email}`
    );
    return response.data.result;
  },

  // Send OTP for reset password (forgot password flow)
  sendOTPResetPassword: async (data: SendOTPRequest): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${OTP_ENDPOINT}/send-by-email`,
      {
        email: data.email,
        tokenType: "RESET_PASSWORD",
        userId: data.userId,
      }
    );
    return response.data.result;
  },

  // Forgot Password - Request OTP
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    // Send OTP with RESET_PASSWORD token type
    await authApi.sendOTP({
      email: data.email,
      tokenType: "RESET_PASSWORD",
    });
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

  // Verify OTP and Reset Password (combined for forgot password flow)
  verifyAndResetPassword: async (data: {
    userId: string;
    email: string;
    code: string;
    tokenType: string;
    newPassword: string;
  }): Promise<void> => {
    // Step 1: Verify OTP first
    await authApi.verifyOTP({
      userId: data.userId,
      email: data.email,
      code: data.code,
      tokenType: data.tokenType,
    });

    // Step 2: If OTP is valid, change password using usersApi
    // Import usersApi inline to avoid circular dependency
    const { usersApi } = await import("./users.api");
    await usersApi.changePasswordByUserId(data.userId, data.newPassword);
  },
};
