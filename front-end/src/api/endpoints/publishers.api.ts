import apiClient from "../client";
import type { ApiResponse, Publisher } from "../../types";

const PUBLISHERS_ENDPOINT = "/publishers";

export const publishersApi = {
  // GET all publishers
  getAll: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<ApiResponse<Publisher[]>>(
      PUBLISHERS_ENDPOINT
    );
    return response.data.result;
  },

  // GET active publishers
  getActive: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<ApiResponse<Publisher[]>>(
      `${PUBLISHERS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET inactive publishers
  getInactive: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<ApiResponse<Publisher[]>>(
      `${PUBLISHERS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET publisher by ID
  getById: async (id: number): Promise<Publisher> => {
    const response = await apiClient.get<ApiResponse<Publisher> | Publisher>(
      `${PUBLISHERS_ENDPOINT}/${id}`
    );
    // Backend returns flat object for single item, not wrapped in ApiResponse
    return "result" in response.data ? response.data.result : response.data;
  },

  // POST create publisher
  create: async (data: Partial<Publisher>): Promise<Publisher> => {
    const response = await apiClient.post<ApiResponse<Publisher>>(
      PUBLISHERS_ENDPOINT,
      data
    );
    return response.data.result;
  },

  // PUT update publisher
  update: async (id: number, data: Partial<Publisher>): Promise<Publisher> => {
    const response = await apiClient.put<ApiResponse<Publisher>>(
      `${PUBLISHERS_ENDPOINT}/${id}`,
      data
    );
    return response.data.result;
  },

  // PUT activate publisher
  activate: async (id: number): Promise<Publisher> => {
    const response = await apiClient.put<ApiResponse<Publisher>>(
      `${PUBLISHERS_ENDPOINT}/active/${id}`
    );
    return response.data.result;
  },

  // PUT deactivate publisher
  deactivate: async (id: number): Promise<Publisher> => {
    const response = await apiClient.put<ApiResponse<Publisher>>(
      `${PUBLISHERS_ENDPOINT}/inactive/${id}`
    );
    return response.data.result;
  },
};
