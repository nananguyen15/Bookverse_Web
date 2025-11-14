// Review API Types

/**
 * Review Response
 */
export type ReviewResponse = {
  id: number;
  bookId: number;
  bookTitle?: string;
  userId: string;
  userName?: string;
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

/**
 * Create Review Request
 */
export type CreateReviewRequest = {
  bookId: number;
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
 * Book Reviews Summary
 */
export type BookReviewsSummary = {
  bookId: number;
  totalReviews: number;
  reviews: ReviewResponse[];
};
