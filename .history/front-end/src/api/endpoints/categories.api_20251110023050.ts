import apiClient from "../client";
import type {
  ApiResponse,
  SupCategory,
  SubCategory,
  Book,
  SupCategoryCreateRequest,
  SupCategoryUpdateRequest,
  SubCategoryCreateRequest,
  SubCategoryUpdateRequest,
} from "../../types";

const SUP_CATEGORIES_ENDPOINT = "/sup-categories";
const SUB_CATEGORIES_ENDPOINT = "/sub-categories";

export const categoriesApi = {
  // ========== SupCategories ==========
  sup: {
    // POST /api/sup-categories/create - Create new sup-category
    create: async (data: SupCategoryCreateRequest): Promise<SupCategory> => {
      const response = await apiClient.post<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/create`,
        data
      );
      return response.data.result;
    },

    // GET /api/sup-categories - Get all sup-categories
    getAll: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(
        SUP_CATEGORIES_ENDPOINT
      );
      return response.data.result;
    },

    // GET /api/sup-categories/{supCategoryId} - Get sup-category by ID
    getById: async (supCategoryId: number): Promise<SupCategory> => {
      const response = await apiClient.get<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/${supCategoryId}`
      );
      return response.data.result;
    },

    // GET /api/sup-categories/active - Get active sup-categories
    getActive: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/active`
      );
      return response.data.result;
    },

    // GET /api/sup-categories/inactive - Get inactive sup-categories
    getInactive: async (): Promise<SupCategory[]> => {
      const response = await apiClient.get<ApiResponse<SupCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/inactive`
      );
      return response.data.result;
    },

    // GET /api/sup-categories/{supCategoryId}/sub-categories - Get sub-categories by sup-category ID
    getSubCategories: async (supCategoryId: number): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUP_CATEGORIES_ENDPOINT}/${supCategoryId}/sub-categories`
      );
      return response.data.result;
    },

    // PUT /api/sup-categories/update/{supCategoryId} - Update sup-category
    update: async (
      supCategoryId: number,
      data: SupCategoryUpdateRequest
    ): Promise<SupCategory> => {
      const response = await apiClient.put<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/update/${supCategoryId}`,
        data
      );
      return response.data.result;
    },

    // PUT /api/sup-categories/active/{supCategoryId} - Activate sup-category
    // Note: This endpoint may not be implemented in BE yet
    activate: async (supCategoryId: number): Promise<SupCategory> => {
      const response = await apiClient.put<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/active/${supCategoryId}`
      );
      return response.data.result;
    },

    // PUT /api/sup-categories/inactive/{supCategoryId} - Deactivate sup-category (soft delete)
    // Note: This endpoint may not be implemented in BE yet
    deactivate: async (supCategoryId: number): Promise<SupCategory> => {
      const response = await apiClient.put<ApiResponse<SupCategory>>(
        `${SUP_CATEGORIES_ENDPOINT}/inactive/${supCategoryId}`
      );
      return response.data.result;
    },
  },

  // ========== SubCategories ==========
  sub: {
    // POST /api/sub-categories/create - Create new sub-category
    create: async (data: SubCategoryCreateRequest): Promise<SubCategory> => {
      const response = await apiClient.post<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/create`,
        data
      );
      return response.data.result;
    },

    // GET /api/sub-categories - Get all sub-categories
    getAll: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        SUB_CATEGORIES_ENDPOINT
      );
      return response.data.result;
    },

    // GET /api/sub-categories/{subCategoryId} - Get sub-category by ID
    getById: async (subCategoryId: number): Promise<SubCategory> => {
      const response = await apiClient.get<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/${subCategoryId}`
      );
      return response.data.result;
    },

    // GET /api/sub-categories/active - Get active sub-categories
    getActive: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/active`
      );
      return response.data.result;
    },

    // GET /api/sub-categories/inactive - Get inactive sub-categories
    getInactive: async (): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/inactive`
      );
      return response.data.result;
    },

    // GET /api/sub-categories/search/{keyword} - Search sub-categories
    search: async (keyword: string): Promise<SubCategory[]> => {
      const response = await apiClient.get<ApiResponse<SubCategory[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/search/${encodeURIComponent(keyword)}`
      );
      return response.data.result;
    },

    // GET /api/sub-categories/{subCategoryId}/active-books - Get active books by sub-category ID
    getActiveBooks: async (subCategoryId: number): Promise<Book[]> => {
      const response = await apiClient.get<ApiResponse<Book[]>>(
        `${SUB_CATEGORIES_ENDPOINT}/${subCategoryId}/active-books`
      );
      return response.data.result;
    },

    // PUT /api/sub-categories/ubdate/{subCategoryId} - Update sub-category
    // Note: Typo in BE endpoint: "ubdate" instead of "update"
    update: async (
      subCategoryId: number,
      data: SubCategoryUpdateRequest
    ): Promise<SubCategory> => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/ubdate/${subCategoryId}`,
        data
      );
      return response.data.result;
    },

    // PUT /api/sub-categories/active/{subCategoryId} - Activate sub-category
    // Note: This endpoint may not be implemented in BE yet
    activate: async (subCategoryId: number): Promise<SubCategory> => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/active/${subCategoryId}`
      );
      return response.data.result;
    },

    // PUT /api/sub-categories/inactive/{subCategoryId} - Deactivate sub-category (soft delete)
    // Note: This endpoint may not be implemented in BE yet
    deactivate: async (subCategoryId: number): Promise<SubCategory> => {
      const response = await apiClient.put<ApiResponse<SubCategory>>(
        `${SUB_CATEGORIES_ENDPOINT}/inactive/${subCategoryId}`
      );
      return response.data.result;
    },
  },
};
