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

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  role: string;
  active: boolean;
  createdDate?: string;
  modifiedDate?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface VerifyOTPRequest {
  email: string;
  otp: string;
}

export interface ResetPasswordRequest {
  email: string;
  otp: string;
  newPassword: string;
}
