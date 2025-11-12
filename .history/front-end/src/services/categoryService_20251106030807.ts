import apiClient from '../config/api';
import type { SupCategoryResponse, SubCategoryResponse, Category, SubCategory, APIResponse } from '../types/api';
import { mapCategory, mapSubCategory } from '../types/api';

/**
 * Category Service - Xử lý API calls cho categories (sup-categories và sub-categories)
 */
const categoryService = {
  /**
   * Lấy tất cả sup-categories
   */
  getAllSupCategories: async (): Promise<Category[]> => {
    try {
      const response: APIResponse<SupCategoryResponse[]> = await apiClient.get('/sup-categories');
      return (response.result || []).map(mapCategory);
    } catch (error) {
      console.error('Error fetching sup-categories:', error);
      return [];
    }
  },

  /**
   * Lấy sup-categories đang active
   */
  getActiveSupCategories: async (): Promise<Category[]> => {
    try {
      const response: APIResponse<SupCategoryResponse[]> = await apiClient.get('/sup-categories/active');
      return (response.result || []).map(mapCategory);
    } catch (error) {
      console.error('Error fetching active sup-categories:', error);
      return [];
    }
  },

  /**
   * Lấy danh sách sub-categories theo sup-category ID
   */
  getSubCategoriesBySupCategoryId: async (supCategoryId: string | number): Promise<SubCategory[]> => {
    try {
      const response: APIResponse<SubCategoryResponse[]> = await apiClient.get(
        `/sup-categories/${supCategoryId}/sub-categories`
      );
      return (response.result || []).map(mapSubCategory);
    } catch (error) {
      console.error(`Error fetching sub-categories for sup-category ${supCategoryId}:`, error);
      return [];
    }
  },

  /**
   * Lấy tất cả sub-categories
   */
  getAllSubCategories: async (): Promise<SubCategory[]> => {
    try {
      const response: APIResponse<SubCategoryResponse[]> = await apiClient.get('/sub-categories');
      return (response.result || []).map(mapSubCategory);
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      return [];
    }
  },

  /**
   * Lấy sub-categories đang active
   */
  getActiveSubCategories: async (): Promise<SubCategory[]> => {
    try {
      const response: APIResponse<SubCategoryResponse[]> = await apiClient.get('/sub-categories/active');
      return (response.result || []).map(mapSubCategory);
    } catch (error) {
      console.error('Error fetching active sub-categories:', error);
      return [];
    }
  },

  /**
   * Lấy sách active theo sub-category ID
   */
  getActiveBooksbySubCategoryId: async (subCategoryId: string | number) => {
    try {
      const response = await apiClient.get(`/sub-categories/${subCategoryId}/active-books`);
      return response.result || [];
    } catch (error) {
      console.error(`Error fetching books for sub-category ${subCategoryId}:`, error);
      return [];
    }
  },
};

export default categoryService;
