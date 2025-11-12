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
  IntrospectRequest,
  IntrospectResponse,
  SendOTPResetPasswordRequest,
  VerifyAndResetPasswordRequest,
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
    const response = await apiClient.post<ApiResponse<AuthenticationResponse>>(
      `${AUTH_ENDPOINT}/token`,
      data
    );
    return response.data.result;
  },

  // Introspect - Verify JWT token validity
  introspect: async (data: IntrospectRequest): Promise<IntrospectResponse> => {
    const response = await apiClient.post<ApiResponse<IntrospectResponse>>(
      `${AUTH_ENDPOINT}/introspect`,
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

  // Forgot Password - Get user ID by email
  getUserIdByEmail: async (email: string): Promise<string> => {
    const response = await apiClient.get<ApiResponse<string>>(
      `${USERS_ENDPOINT}/id-by-email/${email}`
    );
    return response.data.result; // Backend returns userId directly as string
  },

  // Forgot Password - Send OTP for reset password
  sendOTPResetPassword: async (data: SendOTPResetPasswordRequest): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${OTP_ENDPOINT}/send-by-email-reset-password`,
      data
    );
    return response.data.result;
  },

  // Forgot Password - Verify OTP and reset password
  verifyAndResetPassword: async (data: VerifyAndResetPasswordRequest): Promise<void> => {
    const response = await apiClient.post<ApiResponse<void>>(
      `${OTP_ENDPOINT}/verify-reset-password`,
      data
    );
    return response.data.result;
  },

  // Forgot Password - Request OTP (deprecated - use new flow)
  forgotPassword: async (data: ForgotPasswordRequest): Promise<void> => {
    // Send OTP with RESET_PASSWORD token type
    await authApi.sendOTP({
      email: data.email,
      tokenType: "RESET_PASSWORD",
    });
  },

  // Reset Password (deprecated - use verifyAndResetPassword)
  resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
    // TODO: Backend needs to implement this endpoint
    const response = await apiClient.post<ApiResponse<void>>(
      `${AUTH_ENDPOINT}/reset-password`,
      data
    );
    return response.data.result;
  },
};
