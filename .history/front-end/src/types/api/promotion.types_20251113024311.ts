// Promotion API Types

/**
 * Promotion Response
 */
export type PromotionResponse = {
  id: number;
  name: string;
  description?: string;
  discountPercentage: number; // e.g., 10 for 10%
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/**
 * Promotion with Sub-Categories
 */
export type PromotionWithSubCategoriesResponse = PromotionResponse & {
  subCategoryIds: number[];
  subCategoryNames?: string[];
};

/**
 * Create Promotion Request
 */
export type CreatePromotionRequest = {
  name: string;
  description?: string;
  discountPercentage: number;
  startDate: string; // ISO date string or 'YYYY-MM-DD'
  endDate: string; // ISO date string or 'YYYY-MM-DD'
  subCategoryIds?: number[]; // Optional sub-category IDs
};

/**
 * Update Promotion Request
 */
export type UpdatePromotionRequest = {
  id: number;
  name?: string;
  description?: string;
  discountPercentage?: number;
  startDate?: string;
  endDate?: string;
  subCategoryIds?: number[];
};
