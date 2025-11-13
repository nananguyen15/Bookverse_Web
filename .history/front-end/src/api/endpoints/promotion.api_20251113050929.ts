import apiClient from "../client";
import type { ApiResponse } from "../../types/api/common.types";
import type {
  PromotionResponse,
  PromotionWithSubCategoriesResponse,
  CreatePromotionRequest,
  UpdatePromotionRequest,
} from "../../types/api/promotion.types";

const PROMOTION_ENDPOINT = "/promotions";

export const promotionApi = {
  /**
   * Get all promotions (Admin/Staff)
   */
  getAll: async (): Promise<PromotionResponse[]> => {
    const response = await apiClient.get<ApiResponse<PromotionResponse[]>>(
      PROMOTION_ENDPOINT
    );
    return response.data.result;
  },

  /**
   * Get active promotions only
   */
  getActive: async (): Promise<PromotionResponse[]> => {
    const response = await apiClient.get<ApiResponse<PromotionResponse[]>>(
      `${PROMOTION_ENDPOINT}/active`
    );
    return response.data.result;
  },

  /**
   * Get inactive promotions only
   */
  getInactive: async (): Promise<PromotionResponse[]> => {
    const response = await apiClient.get<ApiResponse<PromotionResponse[]>>(
      `${PROMOTION_ENDPOINT}/inactive`
    );
    return response.data.result;
  },

  /**
   * Get promotion by ID
   * @param id Promotion ID
   */
  getById: async (id: number): Promise<PromotionResponse> => {
    const response = await apiClient.get<ApiResponse<PromotionResponse>>(
      `${PROMOTION_ENDPOINT}/${id}`
    );
    return response.data.result;
  },

  /**
   * Get promotion with sub-categories
   * @param id Promotion ID
   */
  getSubCategories: async (
    id: number
  ): Promise<PromotionWithSubCategoriesResponse> => {
    const response = await apiClient.get<
      ApiResponse<PromotionWithSubCategoriesResponse>
    >(`${PROMOTION_ENDPOINT}/${id}/sub-categories`);
    return response.data.result;
  },

  /**
   * Create new promotion (Admin/Staff)
   * @param data Promotion data
   */
  create: async (data: CreatePromotionRequest): Promise<PromotionResponse> => {
    const response = await apiClient.post<ApiResponse<PromotionResponse>>(
      `${PROMOTION_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  /**
   * Update promotion (Admin/Staff)
   * @param id Promotion ID
   * @param data Updated promotion data
   */
  update: async (
    id: number,
    data: UpdatePromotionRequest
  ): Promise<PromotionResponse> => {
    const response = await apiClient.put<ApiResponse<PromotionResponse>>(
      `${PROMOTION_ENDPOINT}/update/${id}`,
      data
    );
    return response.data.result;
  },

  /**
   * Set promotion as inactive (Admin/Staff)
   * @param id Promotion ID
   */
  setInactive: async (id: number): Promise<PromotionResponse> => {
    const response = await apiClient.put<ApiResponse<PromotionResponse>>(
      `${PROMOTION_ENDPOINT}/inactive/${id}`
    );
    return response.data.result;
  },

  /**
   * Set promotion as active (Admin/Staff)
   * @param id Promotion ID
   */
  setActive: async (id: number): Promise<PromotionResponse> => {
    const response = await apiClient.put<ApiResponse<PromotionResponse>>(
      `${PROMOTION_ENDPOINT}/active/${id}`
    );
    return response.data.result;
  },
};
