import { reviewApi } from "../api";

/**
 * Get reviews for a specific book
 * @param type - Type of product (e.g., "book")
 * @param id - Book ID
 * @returns Promise with array of reviews
 */
export async function getProductReviews(type: string, id: string | number) {
  if (type === "book") {
    try {
      const bookId = typeof id === "string" ? parseInt(id) : id;
      return await reviewApi.getByBookId(bookId);
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
      return [];
    }
  }
  return [];
}

/**
 * Get review count for a specific book
 * @param type - Type of product (e.g., "book")
 * @param id - Book ID
 * @returns Promise with review count
 */
export async function getReviewCount(type: string, id: string | number): Promise<number> {
  const reviews = await getProductReviews(type, id);
  return reviews.length;
}
