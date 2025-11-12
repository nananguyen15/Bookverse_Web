export function getProductReviews(type: string, id: string | number) {
  const allReviews = JSON.parse(localStorage.getItem("reviews") || "{}");
  const productKey = `${type}-${id}`;
  return allReviews[productKey] || [];
}

export function getAverageRating(type: string, id: string | number): number {
  const reviews = getProductReviews(type, id);
  if (reviews.length === 0) return 0;
  const sum = reviews.reduce((acc: number, r: any) => acc + r.rating, 0);
  return sum / reviews.length;
}

export function getReviewCount(type: string, id: string | number): number {
  return getProductReviews(type, id).length;
}
