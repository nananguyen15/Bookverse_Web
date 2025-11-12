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
  role: string;
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
