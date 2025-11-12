import apiClient from '../client';
import type { 
  ApiResponse, 
  SignInRequest, 
  AuthResponse, 
  IntrospectResponse 
} from '../../types';

const AUTH_ENDPOINT = '/auth';

export const authApi = {
  // POST sign in
  signIn: async (credentials: SignInRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>(
      `${AUTH_ENDPOINT}/token`,
      credentials
    );
    return response.data.result;
  },

  // POST introspect token
  introspect: async (token: string): Promise<IntrospectResponse> => {
    const response = await apiClient.post<ApiResponse<IntrospectResponse>>(
      `${AUTH_ENDPOINT}/introspect`,
      { token }
    );
    return response.data.result;
  },
};
