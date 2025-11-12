import apiClient from "../client";
import type { ApiResponse, Author } from "../../types";

const AUTHORS_ENDPOINT = "/authors";

export const authorsApi = {
  // GET all authors
  getAll: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      AUTHORS_ENDPOINT
    );
    return response.data.result;
  },

  // GET active authors
  getActive: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET inactive authors
  getInactive: async (): Promise<Author[]> => {
    const response = await apiClient.get<ApiResponse<Author[]>>(
      `${AUTHORS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // GET author by ID
  getById: async (id: number): Promise<Author> => {
    const response = await apiClient.get<ApiResponse<Author> | Author>(
      `${AUTHORS_ENDPOINT}/${id}`
    );
    // Backend returns flat object for single item, not wrapped in ApiResponse
    return "result" in response.data ? response.data.result : response.data;
  },

  // POST create author
  create: async (data: Partial<Author>): Promise<Author> => {
    const response = await apiClient.post<ApiResponse<Author>>(
      AUTHORS_ENDPOINT,
      data
    );
    return response.data.result;
  },

  // PUT update author
  update: async (id: number, data: Partial<Author>): Promise<Author> => {
    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/${id}`,
      data
    );
    return response.data.result;
  },

  // PUT activate author
  activate: async (id: number): Promise<Author> => {
    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/active/${id}`
    );
    return response.data.result;
  },

  // PUT deactivate author
  deactivate: async (id: number): Promise<Author> => {
    const response = await apiClient.put<ApiResponse<Author>>(
      `${AUTHORS_ENDPOINT}/inactive/${id}`
    );
    return response.data.result;
  },
};
