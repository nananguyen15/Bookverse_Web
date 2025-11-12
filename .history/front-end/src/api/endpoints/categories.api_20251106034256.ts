import apiClient from '../client';
import type { ApiResponse, SupCategory, SubCategory } from '../../types';

const SUP_CATEGORIES_ENDPOINT = '/sup-categories';
const SUB_CATEGORIES_ENDPOINT = '/sub-categories';

export const categoriesApi = {
  // ========== SupCategories ==========
  sup: {
    // GET all sup-categories
    getAll: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(SUP_CATEGORIES_ENDPOINT);
      return response.data.result;
    },

    // GET active sup-categories
    getActive: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/active`
      );
      return response.data.result;
    },

    // GET inactive sup-categories
    getInactive: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/inactive`
      );
      return response.data.result;
    },

    // GET sup-category by ID
    getById: async (id: number): Promise<SupCategory> => {
      const response = await apiClient.get<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/${id}`
      );
      return response.data.result;
    },

    // GET sub-categories by sup-category ID
    getSubCategories: async (supId: number): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/${supId}/sub-categories`
      );
      return response.data.result;
    },
  },

  // ========== SubCategories ==========
  sub: {
    // GET all sub-categories
    getAll: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(SUB_CATEGORIES_ENDPOINT);
      return response.data.result;
    },

    // GET active sub-categories
    getActive: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/active`
      );
      return response.data.result;
    },

    // GET inactive sub-categories
    getInactive: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/inactive`
      );
      return response.data.result;
    },

    // GET sub-category by ID
    getById: async (id: number): Promise<SubCategory> => {
      const response = await apiClient.get<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/${id}`
      );
      return response.data.result;
    },

    // GET active books by sub-category ID
    getActiveBooks: async (subId: number): Promise<any[]> => {
      const response = await apiClient.get<ApiResponse<any[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/${subId}/active-books`
      );
      return response.data.result;
    },
  },
};
