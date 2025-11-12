export function getProductReviews(type: string, id: string | number) {
  const allReviews = JSON.parse(localStorage.getItem("reviews") || "{}");
  const productKey = `${type}-${id}`;
  return allReviews[productKey] || [];
}

export function getReviewCount(type: string, id: string | number): number {
  return getProductReviews(type, id).length;
}
