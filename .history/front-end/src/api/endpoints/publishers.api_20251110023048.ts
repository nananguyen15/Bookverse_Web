import apiClient from "../client";
import type {
  ApiResponse,
  Publisher,
  PublisherCreateRequest,
  PublisherUpdateRequest,
} from "../../types";

const PUBLISHERS_ENDPOINT = "/publishers";

export const publishersApi = {
  // POST /api/publishers/create - Create new publisher
  create: async (data: PublisherCreateRequest): Promise<Publisher> => {
    const response = await apiClient.post<ApiResponse<Publisher>>(
      `${PUBLISHERS_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  // GET /api/publishers - Get all publishers
  getAll: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<ApiResponse<Publisher[]>>(
      PUBLISHERS_ENDPOINT
    );
    return response.data.result;
  },

  // GET /api/publishers/{publisherId} - Get publisher by ID
  getById: async (publisherId: number): Promise<Publisher> => {
    const response = await apiClient.get<Publisher>(
      `${PUBLISHERS_ENDPOINT}/${publisherId}`
    );
    // Backend returns Publisher directly, not wrapped in ApiResponse
    return response.data;
  },

  // GET /api/publishers/active - Get active publishers
  getActive: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<ApiResponse<Publisher[]>>(
      `${PUBLISHERS_ENDPOINT}/active`
    );
    return response.data.result;
  },

  // GET /api/publishers/inactive - Get inactive publishers
  getInactive: async (): Promise<Publisher[]> => {
    const response = await apiClient.get<ApiResponse<Publisher[]>>(
      `${PUBLISHERS_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  // PUT /api/publishers/update/{publisherId} - Update publisher
  update: async (
    publisherId: number,
    data: PublisherUpdateRequest
  ): Promise<Publisher> => {
    const response = await apiClient.put<Publisher>(
      `${PUBLISHERS_ENDPOINT}/update/${publisherId}`,
      data
    );
    // Backend returns Publisher directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/publishers/active/{publisherId} - Activate publisher
  // Note: This endpoint may not be implemented in BE yet
  activate: async (publisherId: number): Promise<Publisher> => {
    const response = await apiClient.put<Publisher>(
      `${PUBLISHERS_ENDPOINT}/active/${publisherId}`
    );
    // Backend returns Publisher directly, not wrapped in ApiResponse
    return response.data;
  },

  // PUT /api/publishers/inactive/{publisherId} - Deactivate publisher (soft delete)
  // Note: This endpoint may not be implemented in BE yet
  deactivate: async (publisherId: number): Promise<Publisher> => {
    const response = await apiClient.put<Publisher>(
      `${PUBLISHERS_ENDPOINT}/inactive/${publisherId}`
    );
    // Backend returns Publisher directly, not wrapped in ApiResponse
    return response.data;
  },
};
