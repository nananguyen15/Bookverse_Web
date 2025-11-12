// User & Auth Types
export interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  phone?: string;
  address?: string;
  image?: string;
  active: boolean;
  roles: string[];
}

export interface SignInRequest {
  username: string;
  password: string;
}

export interface SignUpRequest {
  username: string;
  email: string;
  password: string;
  name: string;
  phone?: string;
  address?: string;
}

export interface UserUpdateRequest {
  name?: string;
  phone?: string;
  address?: string;
  image?: string;
  password?: string;
}

export interface AuthResponse {
  token: string;
  authenticated: boolean;
}

export interface IntrospectResponse {
  valid: boolean;
}
