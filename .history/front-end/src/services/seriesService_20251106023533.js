import apiClient from '../config/api';

/**
 * Series Service - Xử lý API calls cho series
 */
const seriesService = {
  /**
   * Lấy tất cả series
   */
  getAllSeries: async () => {
    try {
      const response = await apiClient.get('/series');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching all series:', error);
      throw error;
    }
  },

  /**
   * Lấy series theo ID
   */
  getSeriesById: async (seriesId) => {
    try {
      const response = await apiClient.get(`/series/${seriesId}`);
      return response.result || null;
    } catch (error) {
      console.error(`Error fetching series ${seriesId}:`, error);
      throw error;
    }
  },

  /**
   * Lấy danh sách series đang active
   */
  getActiveSeries: async () => {
    try {
      const response = await apiClient.get('/series/active');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching active series:', error);
      throw error;
    }
  },

  /**
   * Lấy danh sách series inactive
   */
  getInactiveSeries: async () => {
    try {
      const response = await apiClient.get('/series/inactive');
      return response.result || [];
    } catch (error) {
      console.error('Error fetching inactive series:', error);
      throw error;
    }
  },
};

export default seriesService;
