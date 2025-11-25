import type { Book, PromotionResponse } from "../types";

export interface PromotionPriceResult {
  originalPrice: number;
  promoPrice: number | null;
  percentage: number | null;
  hasPromotion: boolean;
}

/**
 * Calculate promotional price for a book based on active promotions
 * @param book - The book to calculate price for
 * @param promotions - List of all promotions
 * @param subCategories - List of all sub-categories with promotion assignments
 * @returns Object containing original price, promotional price, and discount percentage
 */
export function calculatePromotionalPrice(
  book: Book,
  promotions: PromotionResponse[],
  subCategoryPromotions: Map<number, number[]> // Map<promotionId, subCategoryIds[]>
): PromotionPriceResult {
  const now = new Date();

  // Find active promotion for this book's category
  for (const promo of promotions) {
    // Check if promotion is active
    const start = new Date(promo.startDate);
    const end = new Date(promo.endDate);
    const isActive = now >= start && now <= end && promo.active;

    if (!isActive) continue;

    // Check if this book's category is in the promotion
    const subCatIds = subCategoryPromotions.get(promo.id) || [];
    if (subCatIds.includes(book.categoryId)) {
      const discount = book.price * (promo.percentage / 100);
      const promoPrice = book.price - discount;

      return {
        originalPrice: book.price,
        promoPrice,
        percentage: promo.percentage,
        hasPromotion: true,
      };
    }
  }

  // No promotion found
  return {
    originalPrice: book.price,
    promoPrice: null,
    percentage: null,
    hasPromotion: false,
  };
}

/**
 * Simpler version that works with pre-computed sub-category promotions
 * (Used in components that already have the mapping)
 */
export function getPromotionalPrice(
  book: Book,
  subCategoryPromotions: Record<string, PromotionResponse | null>
): PromotionPriceResult {
  // Convert to string to ensure matching
  const categoryKey = String(book.categoryId);
  const promotion = subCategoryPromotions[categoryKey];

  console.log(`🔍 getPromotionalPrice for book ${book.id}:`, {
    categoryId: book.categoryId,
    categoryKey,
    hasPromotion: !!promotion,
    promotion: promotion
      ? { id: promotion.id, percentage: promotion.percentage }
      : null,
    availableCategories: Object.keys(subCategoryPromotions),
  });

  if (!promotion) {
    return {
      originalPrice: book.price,
      promoPrice: null,
      percentage: null,
      hasPromotion: false,
    };
  }

  const discount = book.price * (promotion.percentage / 100);
  const promoPrice = book.price - discount;

  return {
    originalPrice: book.price,
    promoPrice,
    percentage: promotion.percentage,
    hasPromotion: true,
  };
}
