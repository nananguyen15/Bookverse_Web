// Promotion API Types

/**
 * Promotion Response
 */
export type PromotionResponse = {
  id: number;
  content: string;
  percentage: number; // e.g., 10 for 10%
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
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
  content: string;
  percentage: number;
  startDate: string; // 'YYYY-MM-DD'
  endDate: string; // 'YYYY-MM-DD'
  active: boolean;
  subCategoryIds: number[];
};

/**
 * Update Promotion Request
 */
export type UpdatePromotionRequest = {
  id: number;
  content?: string;
  percentage?: number;
  startDate?: string;
  endDate?: string;
  active?: boolean;
};
