import apiClient from "../client";
import type { ApiResponse } from "../../types/api/common.types";
import type {
  ReviewResponse,
  BookReviewsResponse,
  CreateReviewRequest,
  UpdateReviewRequest,
  DeleteReviewByAdminRequest,
} from "../../types/api/review.types";

const REVIEW_ENDPOINT = "/reviews";

export const reviewApi = {
  /**
   * Get all books with their reviews
   * Returns nested structure: { bookId, bookTitle, reviews: [...] }
   */
  getAll: async (): Promise<BookReviewsResponse[]> => {
    const response = await apiClient.get<ApiResponse<BookReviewsResponse[]>>(
      REVIEW_ENDPOINT
    );
    return response.data.result;
  },

  /**
   * Get all reviews flattened (helper method)
   * Converts nested structure to flat array of reviews
   */
  getAllFlat: async (): Promise<ReviewResponse[]> => {
    const bookReviews = await reviewApi.getAll();
    const allReviews: ReviewResponse[] = [];

    bookReviews.forEach((bookReview) => {
      bookReview.reviews.forEach((review) => {
        allReviews.push({
          ...review,
          // Add bookTitle for convenience
          bookTitle: bookReview.bookTitle,
        } as ReviewResponse & { bookTitle: string });
      });
    });

    return allReviews;
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
   * Delete user's own review (Customer only)
   * @param bookId Book ID
   */
  deleteMyReview: async (bookId: number): Promise<void> => {
    await apiClient.delete(`${REVIEW_ENDPOINT}/myReview/${bookId}`);
  },

  /**
   * Delete review by Admin/Staff
   * @param bookId Book ID
   * @param data Request body with userId and reviewId
   */
  deleteByAdminStaff: async (
    bookId: number,
    data: DeleteReviewByAdminRequest
  ): Promise<void> => {
    await apiClient.delete(`${REVIEW_ENDPOINT}/deleteByAdminStaff/${bookId}`, {
      data,
    });
  },

  /**
   * Check if current user has reviewed a specific book
   * @param bookId Book ID
   * @returns boolean indicating if user has reviewed the book
   */
  isReviewed: async (bookId: number): Promise<boolean> => {
    const response = await apiClient.get<ApiResponse<boolean>>(
      `/reviews/is-reviewed/${bookId}`
    );
    return response.data.result;
  },
};
