import apiClient from "../client";
import type { ApiResponse, SupCategory, SubCategory, Book } from "../../types";

const SUP_CATEGORIES_ENDPOINT = "/sup-categories";
const SUB_CATEGORIES_ENDPOINT = "/sub-categories";

export const categoriesApi = {
  // ========== SupCategories ==========
  sup: {
    // GET all sup-categories
    getAll: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(
        SUP_CATEGORIES_ENDPOINT
      );
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
      const response = await apiClient.get<
        ApiResponse<SupCategory> | SupCategory
      >(`${SUP_CATEGORIES_ENDPOINT}/${id}`);
      // Backend returns flat object for single item, not wrapped in ApiResponse
      return "result" in response.data ? response.data.result : response.data;
    },

    // GET sub-categories by sup-category ID
    getSubCategories: async (supId: number): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/${supId}/sub-categories`
      );
      return response.data.result;
    },

    // POST create sup-category
    create: async (data: Partial<SupCategory>): Promise<SupCategory> => {
      const response = await apiClient.post<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/create`,
        data
      );
      return response.data.result;
    },

    // PUT update sup-category
    update: async (id: number, data: Partial<SupCategory>): Promise<SupCategory> => {
      const response = await apiClient.put<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/update/${id}`,
        data
      );
      return response.data.result;
    },

    // PUT activate sup-category (also activates all sub-categories)
    activate: async (id: number): Promise<SupCategory> => {
      const response = await apiClient.put<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/active/${id}`
      );
      return response.data.result;
    },

    // PUT deactivate sup-category (also deactivates all sub-categories)
    deactivate: async (id: number): Promise<SupCategory> => {
      const response = await apiClient.put<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/inactive/${id}`
      );
      return response.data.result;
    },
  },

  // ========== SubCategories ==========
  sub: {
    // GET all sub-categories
    getAll: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        SUB_CATEGORIES_ENDPOINT
      );
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
      const response = await apiClient.get<
        ApiResponse<SubCategory> | SubCategory
      >(`${SUB_CATEGORIES_ENDPOINT}/${id}`);
      // Backend returns flat object for single item, not wrapped in ApiResponse
      return "result" in response.data ? response.data.result : response.data;
    },

    // GET active books by sub-category ID
    getActiveBooks: async (subId: number): Promise<Book[]> => {
      const response = await apiClient.get<ApiResponse<Book[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/${subId}/active-books`
      );
      return response.data.result;
    },

    // POST create sub-category
    create: async (data: Partial<SubCategory>): Promise<SubCategory> => {
      const response = await apiClient.post<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/create`,
        data
      );
      return response.data.result;
    },

    // PUT update sub-category
    update: async (id: number, data: Partial<SubCategory>): Promise<SubCategory> => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/update/${id}`,
        data
      );
      return response.data.result;
    },

    // PUT activate sub-category
    activate: async (id: number): Promise<SubCategory> => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/active/${id}`
      );
      return response.data.result;
    },

    // PUT deactivate sub-category
    deactivate: async (id: number): Promise<SubCategory> => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/inactive/${id}`
      );
      return response.data.result;
    },
  },
};
