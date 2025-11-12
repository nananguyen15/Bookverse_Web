import apiClient from '../config/api';

/**
 * Category Service - Xử lý API calls cho categories (sup-categories và sub-categories)
 */
const categoryService = {
  /**
   * Lấy tất cả sup-categories
   */
  getAllSupCategories: async () => {
    try {
      const response = await apiClient.get('/sup-categories');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching sup-categories:', error);
      throw error;
    }
  },

  /**
   * Lấy sup-categories đang active
   */
  getActiveSupCategories: async () => {
    try {
      const response = await apiClient.get('/sup-categories/active');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching active sup-categories:', error);
      throw error;
    }
  },

  /**
   * Lấy sup-category theo ID
   */
  getSupCategoryById: async (supCategoryId) => {
    try {
      const response = await apiClient.get(`/sup-categories/${supCategoryId}`);
      return response.result || null;
    } catch (error) {
      console.error(`Error fetching sup-category ${supCategoryId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách sub-categories theo sup-category ID
   */
  getSubCategoriesBySupCategoryId: async (supCategoryId) => {
    try {
      const response = await apiClient.get(`/sup-categories/${supCategoryId}/sub-categories`);
      return response.result || [];
    } catch (error) {
      console.error(`Error fetching sub-categories for sup-category ${supCategoryId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy tất cả sub-categories
   */
  getAllSubCategories: async () => {
    try {
      const response = await apiClient.get('/sub-categories');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching sub-categories:', error);
      throw error;
    }
  },

  /**
   * Lấy sub-categories đang active
   */
  getActiveSubCategories: async () => {
    try {
      const response = await apiClient.get('/sub-categories/active');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching active sub-categories:', error);
      throw error;
    }
  },

  /**
   * Lấy sub-category theo ID
   */
  getSubCategoryById: async (subCategoryId) => {
    try {
      const response = await apiClient.get(`/sub-categories/${subCategoryId}`);
      return response.result || null;
    } catch (error) {
      console.error(`Error fetching sub-category ${subCategoryId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy sách active theo sub-category ID
   */
  getActiveBooksbySubCategoryId: async (subCategoryId) => {
    try {
      const response = await apiClient.get(`/sub-categories/${subCategoryId}/active-books`);
      return response.result || [];
    } catch (error) {
      console.error(`Error fetching books for sub-category ${subCategoryId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo sup-category mới (Admin only)
   */
  createSupCategory: async (data) => {
    try {
      const response = await apiClient.post('/sup-categories/create', data);
      return response.result;
    } catch (error) {
      console.error('Error creating sup-category:', error);
      throw error;
    }
  },

  /**
   * Cập nhật sup-category (Admin only)
   */
  updateSupCategory: async (supCategoryId, data) => {
    try {
      const response = await apiClient.put(`/sup-categories/update/${supCategoryId}`, data);
      return response.result;
    } catch (error) {
      console.error(`Error updating sup-category ${supCategoryId}:`, error);
      throw error;
    }
  },

  /**
   * Tạo sub-category mới (Admin only)
   */
  createSubCategory: async (data) => {
    try {
      const response = await apiClient.post('/sub-categories/create', data);
      return response.result;
    } catch (error) {
      console.error('Error creating sub-category:', error);
      throw error;
    }
  },

  /**
   * Cập nhật sub-category (Admin only)
   */
  updateSubCategory: async (subCategoryId, data) => {
    try {
      const response = await apiClient.put(`/sub-categories/update/${subCategoryId}`, data);
      return response.result;
    } catch (error) {
      console.error(`Error updating sub-category ${subCategoryId}:`, error);
      throw error;
    }
  },
};

export default categoryService;
