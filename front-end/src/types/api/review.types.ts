// Review API Types

/**
 * Review Response from backend
 */
export type ReviewResponse = {
  id: number;
  userId: string;
  userName: string; // Username for login
  name?: string; // Customer's full name
  bookId: number;
  bookTitle?: string; // Optional, may be populated by client
  comment?: string;
  createdAt: string;
};

/**
 * Book with Reviews Response (from GET /api/reviews)
 */
export type BookReviewsResponse = {
  bookId: number;
  bookTitle: string;
  reviews: ReviewResponse[];
};

/**
 * Create Review Request
 */
export type CreateReviewRequest = {
  bookId: number;
  // rating: number; // 1-5 (required)
  comment?: string;
};

/**
 * Update Review Request
 */
export type UpdateReviewRequest = {
  bookId: number;
  comment?: string;
};

/**
 * Delete Review Request (for Admin/Staff)
 */
export type DeleteReviewByAdminRequest = {
  userId: string;
  reviewId: number;
  message?: string; // Reason for deletion
};
