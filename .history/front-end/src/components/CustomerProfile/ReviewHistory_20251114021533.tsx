import { useState, useEffect } from "react";
import { FaComment, FaTrashAlt } from "react-icons/fa";
import { reviewApi } from "../../api";
import type { ReviewResponse } from "../../types";
import { useAuth } from "../../contexts/AuthContext";

interface Review {
  id: number;
  productName: string;
  productId: number;
  comment: string;
  date: string;
}

export function ReviewHistory() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        // Get all reviews and filter by current user
        const allReviews = await reviewApi.getAll();
        const userReviews = allReviews.filter((r: ReviewResponse) => r.userId === user?.username);

        // Transform to component interface
        const transformedReviews: Review[] = userReviews.map((r: ReviewResponse) => ({
          id: r.id,
          productName: r.bookTitle || "Unknown Book",
          productId: r.bookId,
          comment: r.comment || "",
          date: new Date(r.createdAt).toLocaleDateString("vi-VN"),
        }));

        setReviews(transformedReviews);
      } catch (error) {
        console.error("Failed to load reviews:", error);
        alert("Failed to load reviews. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadReviews();
    }
  }, [user]);

  const handleDelete = async (reviewId: number) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    if (window.confirm("Are you sure you want to delete this review?")) {
      try {
        await reviewApi.deleteMyReview(review.productId);
        const updatedReviews = reviews.filter((r) => r.id !== reviewId);
        setReviews(updatedReviews);
        alert("Review deleted successfully!");
      } catch (error) {
        console.error("Failed to delete review:", error);
        alert("Failed to delete review. Please try again.");
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-sm">
        <h2 className="mb-6 text-3xl font-bold text-beige-900">My Reviews</h2>
        <p className="text-center text-beige-600">Loading reviews...</p>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-sm">
      <h2 className="mb-6 text-3xl font-bold text-beige-900">My Reviews</h2>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className="py-12 text-center text-beige-600">
          <FaComment className="mx-auto mb-4 text-4xl text-beige-400" />
          <p>No reviews yet.</p>
          <p className="mt-2 text-sm">
            Your reviews will appear here after you write them.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="p-4 border rounded-lg border-beige-200 bg-beige-50"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-beige-900">
                    {review.productName}
                  </h3>
                  <p className="text-sm text-beige-600">
                    Reviewed on: {review.date}
                  </p>
                  <p className="mt-3 text-beige-800">{review.comment}</p>
                </div>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="ml-4 text-beige-400 hover:text-red-600"
                  title="Delete review"
                >
                  <FaTrashAlt />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
