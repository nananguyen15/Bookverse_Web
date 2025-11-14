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
  // rating: number; // 1-5 stars
  comment?: string;
  createdAt: string;
  updatedAt?: string;
};

/**
 * Create Review Request
 */
export type CreateReviewRequest = {
  bookId: number;
  // rating: number; // 1-5 (required): update later
  comment?: string;
};

/**
 * Update Review Request
 */
export type UpdateReviewRequest = {
  bookId: number;
  rating?: number; // 1-5
  comment?: string;
};

/**
 * Book Reviews Summary
 */
export type BookReviewsSummary = {
  bookId: number;
  averageRating: number;
  totalReviews: number;
  reviews: ReviewResponse[];
};
