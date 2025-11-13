import apiClient from "../client";
import type { ApiResponse } from "../../types/api/common.types";
import type {
  ReviewResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
} from "../../types/api/review.types";

const REVIEW_ENDPOINT = "/reviews";

export const reviewApi = {
  /**
   * Get all reviews (Admin/Staff)
   */
  getAll: async (): Promise<ReviewResponse[]> => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(
      REVIEW_ENDPOINT
    );
    return response.data.result;
  },

  /**
   * Get reviews for a specific book
   * @param bookId Book ID
   */
  getByBookId: async (bookId: number): Promise<ReviewResponse[]> => {
    const response = await apiClient.get<ApiResponse<ReviewResponse[]>>(
      `${REVIEW_ENDPOINT}/${bookId}`
    );
    return response.data.result;
  },

  /**
   * Create a review for a book (Customer only)
   * @param data Review data (bookId and rating are required)
   */
  create: async (data: CreateReviewRequest): Promise<ReviewResponse> => {
    const response = await apiClient.post<ApiResponse<ReviewResponse>>(
      `${REVIEW_ENDPOINT}/create`,
      data
    );
    return response.data.result;
  },

  /**
   * Update user's own review
   * @param data Updated review data (bookId required)
   */
  update: async (data: UpdateReviewRequest): Promise<ReviewResponse> => {
    const response = await apiClient.put<ApiResponse<ReviewResponse>>(
      `${REVIEW_ENDPOINT}/update`,
      data
    );
    return response.data.result;
  },

  /**
   * Delete user's own review
   * @param bookId Book ID
   */
  deleteMyReview: async (bookId: number): Promise<void> => {
    await apiClient.delete(`${REVIEW_ENDPOINT}/myReview/${bookId}`);
  },

  /**
   * Delete review by Admin/Staff
   * @param bookId Book ID
   */
  deleteByAdminStaff: async (bookId: number): Promise<void> => {
    await apiClient.delete(`${REVIEW_ENDPOINT}/deleteByAdminStaff/${bookId}`);
  },
};
