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
    const response = await apiClient.get<ApiResponse<Publisher>>(
      `${PUBLISHERS_ENDPOINT}/${id}`
    );
    return response.data.result;
  },
};
