import apiClient from '../config/api';
import type { SeriesResponse, Series, APIResponse } from '../types/api';
import { mapSeries } from '../types/api';

/**
 * Series Service - Xử lý API calls cho series
 */
const seriesService = {
  /**
   * Lấy tất cả series
   */
  getAllSeries: async (): Promise<Series[]> => {
    try {
      const response: APIResponse<SeriesResponse[]> = await apiClient.get('/series');
      return (response.result || []).map(mapSeries);
    } catch (error) {
      console.error('Error fetching all series:', error);
      return [];
    }
  },

  /**
   * Lấy series theo ID
   */
  getSeriesById: async (seriesId: string | number): Promise<Series | null> => {
    try {
      const response: APIResponse<SeriesResponse> = await apiClient.get(`/series/${seriesId}`);
      return response.result ? mapSeries(response.result) : null;
    } catch (error) {
      console.error(`Error fetching series ${seriesId}:`, error);
      return null;
    }
  },

  /**
   * Lấy danh sách series đang active
   */
  getActiveSeries: async (): Promise<Series[]> => {
    try {
      const response: APIResponse<SeriesResponse[]> = await apiClient.get('/series/active');
      return (response.result || []).map(mapSeries);
    } catch (error) {
      console.error('Error fetching active series:', error);
      return [];
    }
  },
};

export default seriesService;
