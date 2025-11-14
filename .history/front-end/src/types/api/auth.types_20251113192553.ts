// Authentication request/response types
export interface SignUpRequest {
  username: string;
  password: string;
  email: string;
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface AuthenticationResponse {
  authenticated: boolean;
  token: string;
}

export interface IntrospectRequest {
  token: string;
}

export interface IntrospectResponse {
  valid: boolean;
}

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  image?: string;
  roles: string[]; // Backend trả về Set<String>, JSON parse thành array
  active: boolean;
  createdDate?: string;
  modifiedDate?: string;
}

export interface SendOTPRequest {
  email: string;
  tokenType?: string; // "LOGIN" (default) or "RESET_PASSWORD"
  userId?: string;
}

export interface VerifyOTPRequest {
  userId: string;
  email?: string;
  code: string;
  tokenType?: string; // "LOGIN" (default) or "RESET_PASSWORD"
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}

// Forgot Password - Get user ID by email
// Backend returns userId as a string directly in result field
export type GetUserIdByEmailResponse = string;

// Forgot Password - Send OTP for reset password
export interface SendOTPResetPasswordRequest {
  email: string;
  tokenType: "RESET_PASSWORD";
  userId: string;
}

// Forgot Password - Verify OTP and reset password
export interface VerifyAndResetPasswordRequest {
  userId: string;
  email: string;
  code: string;
  tokenType: "RESET_PASSWORD";
  newPassword: string;
}
